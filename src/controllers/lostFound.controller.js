import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { LostFound } from "../models/lostFound.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createLostFound = asyncHandler(async (req, res) => {
    const { title, description, type, category, location, contactNumber } = req.body;
    
    if (!title?.trim() || !description?.trim() || !type || !category || !location) {
        throw new ApiError(400, "All fields required");
    }

    // Upload images
    const images = [];
    if (req.files?.length) {
        for (let file of req.files) {
            const img = await uploadOnCloudinary(file.path);
            images.push(img.secure_url);
        }
    }

    const lostFoundItem = await LostFound.create({
        title: title.trim(),
        description: description.trim(),
        type,
        category,
        location: location.trim(),
        images,
        contactNumber: contactNumber?.trim(),
        postedBy: req.user._id
    });

    const populatedItem = await LostFound.findById(lostFoundItem._id)
        .populate('postedBy', 'fullName registrationNumber');

    return res.status(201).json(
        new ApiResponse(201, populatedItem, `${type} item posted - pending admin approval`)
    );
});

export const getAllLostFound = asyncHandler(async (req, res) => {
    const { type, category, status = 'approved', limit = 20 } = req.query;
    
    const query = { status };
    if (type) query.type = type;
    if (category) query.category = category;

    const items = await LostFound.find(query)
        .populate('postedBy', 'fullName')
        .populate('claimedBy', 'fullName')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

    return res.status(200).json(
        new ApiResponse(200, items, "Lost & Found items")
    );
});

export const getMyLostFound = asyncHandler(async (req, res) => {
    const items = await LostFound.find({ postedBy: req.user._id })
        .populate('claimedBy', 'fullName')
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, items, "Your lost & found posts")
    );
});

export const adminApproveLostFound = asyncHandler(async (req, res) => {
    if (!['admin', 'faculty'].includes(req.user.role)) {
        throw new ApiError(403, "Admin/Faculty only");
    }

    const { status } = req.body; // 'approved' or 'rejected'
    const item = await LostFound.findById(req.params.id);

    if (!item) {
        throw new ApiError(404, "Item not found");
    }

    item.status = status || 'approved';
    await item.save();

    const populatedItem = await LostFound.findById(item._id)
        .populate('postedBy', 'fullName');

    return res.status(200).json(
        new ApiResponse(200, populatedItem, `Item ${status}`)
    );
});

export const claimLostFound = asyncHandler(async (req, res) => {
    const item = await LostFound.findById(req.params.id);
    if (!item || item.status !== 'approved') {
        throw new ApiError(400, "Cannot claim this item");
    }

    if (item.claimedBy) {
        throw new ApiError(400, "Item already claimed");
    }

    item.claimedBy = req.user._id;
    item.status = 'claimed';
    await item.save();

    const populatedItem = await LostFound.findById(item._id)
        .populate('postedBy claimedBy', 'fullName registrationNumber');

    return res.status(200).json(
        new ApiResponse(200, populatedItem, "Item claimed successfully!")
    );
});
