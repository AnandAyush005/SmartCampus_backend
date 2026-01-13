import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { registerUserSchema, loginUserSchema, updateUserSchema, changePasswordSchema } from "../middlewares/validates/user.middleware.js";


const registerUser = asyncHandler(async (req, res) => {
    // 1. Zod validation FIRST
    const { fullName, email, password, registrationNumber, mobile, role} = 
        registerUserSchema.parse(req.body);

    // 2. Check required fields
    if (!fullName?.trim() || !email?.trim() || !password?.trim() || 
        !registrationNumber?.trim() || !mobile?.trim()) {
        throw new ApiError(400, "All fields are required");
    }

    // 3. Check existing user (email, registrationNumber, mobile only)
    const existedUser = await User.findOne({
        $or: [{ registrationNumber }, { email }, { mobile }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email, registration number, or mobile already exists");
    }

    // 4. Upload avatar
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar?.url) {
        throw new ApiError(500, "Avatar upload failed");
    }

    // 5. Create user WITHOUT username
    const createdUser = await User.create({
        fullName,
        avatar: avatar.url,
        email,
        password,
        registrationNumber,
        mobile,
        role
    });

    const user = await User.findById(createdUser._id).select("-password");
    if (!user) {
        throw new ApiError(500, "User registration failed");
    }

    return res.status(201).json(
        new ApiResponse(200, user, "Student registered successfully")
    );
});


const loginUser = asyncHandler(async (req, res) => {
    // 1. Login validation (email + password only)
    const { email, password } = loginUserSchema.parse(req.body);

    // 2. Find by email only
    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(401, "Invalid credentials");
    }

    // 🆕 3. VERIFICATION CHECK - Only verified users can login
    if (!user.isVerified) {
        throw new ApiError(403, "You are not verified by the admin");
    }

    // 4. Account active check
    if (!user.isActive) {
        throw new ApiError(403, "Account is deactivated. Contact admin");
    }

    // 5. Verify password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }

    // 6. Generate tokens
    const accessToken = await user.generateAccessToken();

    const loggedInUser = user.toObject();
    delete loggedInUser.password;
    delete loggedInUser.refreshToken;

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'strict'
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser,
                accessToken,
            }, "Login successful")
        );
});



const logoutUser = asyncHandler( async (req,res)=>{

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken", "", options)
    .json(new ApiResponse(200, {}, "User logged out"))

})


const changeCurrentPassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = changePasswordSchema.parse(req.body);

    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Verify old password
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Current password is incorrect");
    }

    // Controller-side checks (since no confirmPassword field)
    if (newPassword.length < 8) {
        throw new ApiError(400, "New password too weak");
    }

    // Update password
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    );
});



const updateAccountDetails = asyncHandler(async (req, res) => {

    // 1. Zod validation for ALL campus fields
    console.log(req.body);
    const updateData = updateUserSchema.parse(req.body);

    // 2. Find current user
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // 3. FULL UNIQUENESS CHECKS for changeable fields
    const uniquenessChecks = [];

    // Email check
    if (updateData.email && updateData.email !== user.email) {
        const emailExists = await User.findOne({ 
            email: updateData.email,
            _id: { $ne: user._id } // exclude current user
        });
        if (emailExists) {
            throw new ApiError(409, "Email already exists");
        }
        user.email = updateData.email;
    }

    // Registration Number check (usually not changeable, but if allowed)
    if (updateData.registrationNumber && updateData.registrationNumber !== user.registrationNumber) {
        const regNumExists = await User.findOne({ 
            registrationNumber: updateData.registrationNumber,
            _id: { $ne: user._id }
        });
        if (regNumExists) {
            throw new ApiError(409, "Registration number already exists");
        }
        user.registrationNumber = updateData.registrationNumber;
    }

    // Mobile check
    if (updateData.mobile && updateData.mobile !== user.mobile) {
        const mobileExists = await User.findOne({ 
            mobile: updateData.mobile,
            _id: { $ne: user._id }
        });
        if (mobileExists) {
            throw new ApiError(409, "Mobile number already exists");
        }
        user.mobile = updateData.mobile;
    }

    // 4. Update ALL other fields (safe fields)
    if (updateData.fullName && updateData.fullName.trim()) {
        user.fullName = updateData.fullName.trim();
    }

    // 5. Save with Mongoose validation
    await user.save();

    // 6. Return updated user (hide sensitive data)
    const updatedUser = await User.findById(req.user._id)
        .select("-password")

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Profile updated successfully")
    );
});

const updateUserAvatar = asyncHandler(async(req,res)=>{

    const avatarLocalPath = req.file?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar.url){
        throw new ApiError("failed to update the avatar on cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                avatar : avatar.url
                
            }
        },

        {
            new : true
        }
    ).select("-password -refreshToken")

    return res.status(200)
    .json(
        new ApiResponse(200, "successfully updated the avatar")
    )


})

// controllers/user.controller.js
export const getFacultyList = asyncHandler(async (req, res) => {
    if (!['admin', 'faculty'].includes(req.user.role)) {
        throw new ApiError(403, "Only admin/faculty can view faculty list");
    }

    const { search } = req.query;
    const query = { 
        role: 'faculty',
    };

    if (search) {
        query.$or = [
            { fullName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    const faculty = await User.find(query)
        .select('fullName email registrationNumber _id avatar')  // Your existing fields
        .sort({ fullName: 1 })
        .limit(50);

    return res.status(200).json(
        new ApiResponse(200, faculty, "Faculty list")
    );
});

// 2. GET ALL USERS (Admin dashboard)
export const getAllUsers = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
        throw new ApiError(403, "Only admin can view all users");
    }

    const { role, search, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };

    if (role && role !== 'all') query.role = role;
    if (search) {
        query.$or = [
            { fullName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { registrationNumber: { $regex: search, $options: 'i' } }
        ];
    }

    const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, { users, total, pages: Math.ceil(total / limit) }, "Users fetched")
    );
});

// 3. ADMIN/FACULTY DASHBOARD STATS
export const adminDashboardStats = asyncHandler(async (req, res) => {
    if (!['admin', 'faculty'].includes(req.user.role)) {
        throw new ApiError(403, "Admin/Faculty access only");
    }

    const stats = await Promise.all([
        User.countDocuments({ role: 'student', isActive: true }),
        User.countDocuments({ role: 'faculty', isActive: true }),
        Issue.countDocuments({ status: 'open' }),
        Issue.countDocuments({ status: 'in-progress' }),
        Notice.countDocuments({ status: 'active' })
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            students: stats[0],
            faculty: stats[1],
            openIssues: stats[2],
            inProgressIssues: stats[3],
            activeNotices: stats[4]
        }, "Dashboard stats")
    );
});

// 4. FACULTY ASSIGNED ISSUES (Faculty dashboard)
export const getFacultyAssignedIssues = asyncHandler(async (req, res) => {
    if (req.user.role !== 'faculty') {
        throw new ApiError(403, "Faculty access only");
    }

    const issues = await Issue.find({ assignedTo: req.user._id })
        .populate('raisedBy', 'fullName registrationNumber')
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, issues, "Your assigned issues")
    );
});

// 5. UPDATE USER STATUS (Admin only)
export const updateUserStatus = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
        throw new ApiError(403, "Admin only");
    }

    const { status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.isActive = status === 'active';
    await user.save();

    const updatedUser = await User.findById(user._id)
        .select('fullName email role isActive');

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "User status updated")
    );
});


export { 

    registerUser,
    loginUser,
    logoutUser,
    updateAccountDetails,
    changeCurrentPassword,
    updateUserAvatar,

};
