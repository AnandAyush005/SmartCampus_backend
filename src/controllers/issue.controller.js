import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Issue } from "../models/issue.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { createIssueSchema, updateIssueSchema } from "../middlewares/validates/issue.middleware.js";

export const createIssue = asyncHandler(async (req, res) => {
    const { title, description, category, priority, location } = req.body;
    
    if (!title?.trim() || !description?.trim() || !category) {
        throw new ApiError(400, "Title, description, and category required");
    }

    // Handle multiple images
    const imageUrls = [];
    if (req.files && Array.isArray(req.files)) {
        for (let file of req.files) {
            const uploadResponse = await uploadOnCloudinary(file.path);
            imageUrls.push(uploadResponse.secure_url);
        }
    }

    const issue = await Issue.create({
        title: title.trim(),
        description: description.trim(),
        category,
        priority: priority || 'medium',
        location: location?.trim(),
        images: imageUrls,
        raisedBy: req.user._id
    });

    const populatedIssue = await Issue.findById(issue._id)
        .populate('raisedBy', 'fullName registrationNumber')
        .populate('assignedTo', 'fullName role');

    return res.status(201).json(
        new ApiResponse(201, populatedIssue, "Issue reported successfully")
    );
});

export const getAllIssues = asyncHandler(async (req, res) => {
    const { category, status, priority, limit = 20, page = 1 } = req.query;
    
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    
    // Students see only their issues + resolved ones
    if (req.user.role === 'student') {
        query.$or = [
            { raisedBy: req.user._id },
            { status: 'resolved' },
            { status: 'closed' }
        ];
    }

    const issues = await Issue.find(query)
        .populate('raisedBy', 'fullName registrationNumber')
        .populate('assignedTo', 'fullName role')
        .sort({ createdAt: -1, priority: -1 }) // Urgent first
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

    return res.status(200).json(
        new ApiResponse(200, issues, "Issues fetched")
    );
});

export const getMyIssues = asyncHandler(async (req, res) => {
    const issues = await Issue.find({ raisedBy: req.user._id })
        .populate('assignedTo', 'fullName role')
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, issues, "Your issues")
    );
});

// controllers/issue.controller.js
export const assignIssue = asyncHandler(async (req, res) => {
    if (!['admin', 'faculty'].includes(req.user.role)) {
        throw new ApiError(403, "Only admin/faculty can assign issues");
    }

    const { facultyEmail } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
        throw new ApiError(404, "Issue not found");
    }

    if (!facultyEmail) {
        throw new ApiError(400, "facultyEmail required");
    }

    // Find faculty by email
    const faculty = await User.findOne({ 
        email: facultyEmail, 
        role: 'faculty' 
    });

    if (!faculty) {
        throw new ApiError(404, "Faculty member not found");
    }

    issue.assignedTo = faculty._id;
    issue.status = 'in-progress';
    await issue.save();

    const populatedIssue = await Issue.findById(issue._id)
        .populate('raisedBy', 'fullName email')
        .populate('assignedTo', 'fullName email registrationNumber');

    return res.status(200).json(
        new ApiResponse(200, populatedIssue, "Issue assigned successfully")
    );
});

export const updateIssueStatus = asyncHandler(async (req, res) => {
    if (!['admin', 'faculty'].includes(req.user.role)) {
        throw new ApiError(403, "Only admin/faculty can update status");
    }

    const { status, resolutionNotes } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
        throw new ApiError(404, "Issue not found");
    }

    issue.status = status;
    if (resolutionNotes) issue.resolutionNotes = resolutionNotes.trim();
    await issue.save();

    const populatedIssue = await Issue.findById(issue._id)
        .populate('raisedBy assignedTo', 'fullName role');

    return res.status(200).json(
        new ApiResponse(200, populatedIssue, "Status updated")
    );
});


