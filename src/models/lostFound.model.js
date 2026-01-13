import mongoose, {Schema} from "mongoose"

const lostFoundSchema = new Schema(
    {
  title: String, 
  
  description: String,

  category: { 
    type: String, 
    enum: ['lost', 'found', 'claimed'] 
},
  itemType: { 
    type: String, 
    enum: ['electronics', 'documents', 'clothing', 'keys', 'other'] 
},
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true 
},
  images: [String],

  location: String, // "Hostel A Block 2"

  claimStatus: {
    type: String, 
    enum: ['available', 'claimed', 'returned'], 
    default: 'available' 
},

  claimedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
},
}, {timestamps : true});

export const LostFound = new mongoose.model("LostFound", lostFoundSchema)
