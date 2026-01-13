import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Notice } from "../models/notice.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { createNoticeSchema } from "../middlewares/validates/notice.middleware.js";

export const createNotice = asyncHandler(async (req, res) => {
  // Role check
  if (!["admin", "faculty"].includes(req.user.role)) {
    throw new ApiError(403, "Only admins and faculty can post notices");
  }

  // ✅ Zod validation (FIXED)
  const parsed = createNoticeSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.errors);
  }

  const { title, content, category, eventDate, isPinned } = parsed.data;

  // Handle file upload
  let fileUrl = null;
  let filePublicId = null;

  if (req.file) {
    const uploadResponse = await uploadOnCloudinary(req.file.path);

    if (!uploadResponse?.secure_url) {
      throw new ApiError(400, "File upload to Cloudinary failed");
    }

    fileUrl = uploadResponse.secure_url;
    filePublicId = uploadResponse.public_id;
  }

  const notice = await Notice.create({
    title: title.trim(),
    content: content.trim(),
    category,
    status: "active",
    eventDate: eventDate ? new Date(eventDate) : null,
    isPinned: isPinned === true || isPinned === "true",
    fileUrl,
    filePublicId,
    author: req.user._id,
  });

  const populatedNotice = await Notice.findById(notice._id)
    .populate("author", "fullName role avatar");

  return res.status(201).json(
    new ApiResponse(201, populatedNotice, "Notice created successfully")
  );
});


export const getAllNotices = asyncHandler(async (req, res) => {
    const { category, limit = 10, page = 1, sort = 'newest' } = req.query;
    
    const query = category ? { category, status: 'active' } : { status: 'active' };
    const sortOrder = sort === 'oldest' ? 1 : -1;

    const notices = await Notice.find(query)
        .populate('author', 'fullName role avatar')
        .sort({ createdAt: sortOrder, isPinned: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

    return res.status(200).json(
        new ApiResponse(200, notices, "Notices fetched")
    );
});

export const getNoticeById = asyncHandler(async (req, res) => {
    const notice = await Notice.findById(req.params.id)
        .populate('author', 'fullName role avatar');

    if (!notice) {
        throw new ApiError(404, "Notice not found");
    }

    return res.status(200).json(
        new ApiResponse(200, notice, "Notice details")
    );
});

export const updateNotice = asyncHandler(async (req, res) => {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
        throw new ApiError(404, "Notice not found");
    }

    // Author or admin only
    if (notice.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw new ApiError(403, "Not authorized");
    }

    // Update fields
    if (req.body.title) notice.title = req.body.title.trim();
    if (req.body.content) notice.content = req.body.content.trim();
    if (req.body.category) notice.category = req.body.category;
    if (req.body.eventDate) notice.eventDate = new Date(req.body.eventDate);
    if (req.body.isPinned !== undefined) notice.isPinned = req.body.isPinned === 'true';

    await notice.save();

    const updatedNotice = await Notice.findById(notice._id)
        .populate('author', 'fullName role');

    return res.status(200).json(
        new ApiResponse(200, updatedNotice, "Notice updated")
    );
});

export const deleteNotice = asyncHandler(async (req, res) => {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
        throw new ApiError(404, "Notice not found");
    }

    if (notice.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw new ApiError(403, "Not authorized");
    }

    // Delete PDF from Cloudinary if exists
    if (notice.filePublicId) {
        // Add cloudinary delete logic here
    }

    await Notice.findByIdAndDelete(req.params.id);

    return res.status(200).json(
        new ApiResponse(200, {}, "Notice deleted")
    );
});
