import mongoose , {Schema} from "mongoose"
import { string } from "zod";

const noticeSchema = new Schema(
{
    title: { 
        type: String, 
        required: true 
    },
    content: {
        type: String, 
        required: true 
    },
    status : {
        type : String,
        enum : ["active", "pending", "completed"],
        default : 'active'
    },
    author: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    category: { 
        type: String,
        enum: ['event', 'holiday', 'exam', 'notice']
    },
    date: {
        type: Date, 
        default: Date.now 
    },
    eventDate: Date, // for events
    isPinned: { 
        type: Boolean, 
        default: false  
    },
    views: [
        { 
            type: Schema.Types.ObjectId, 
            ref: 'User' 
        }
    ],
    fileUrl: String // attachments
}, 
{
    timestamps : true
});

export const Notice = new mongoose.model("Notice", noticeSchema)