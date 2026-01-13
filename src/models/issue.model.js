import mongoose from "mongoose";

const issueSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['wifi', 'maintenance', 'canteen', 'transport', 'lab', 'other'],
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    
    status: {
        type: String,
        enum: ['open', 'in-progress', 'resolved', 'closed'],
        default: 'open'
    },

    raisedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Faculty/Admin
    },

    images: [String], // Cloudinary URLs
    location: String,
    resolutionNotes: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const Issue = mongoose.model('Issue', issueSchema);
