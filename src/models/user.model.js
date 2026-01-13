import mongoose , {Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new Schema({

    fullName : {
        type : String,
        required : true,
        trim : true,
        index : true
    },

    email : {
        type : String,
        required : true,
        lowercase : true,
        trim : true,
        unique : true
    }, 

    avatar : {
        type : String,
    },

    password : {
        type : String,
        required : [true, "Password is required"]
    },

    role : { 
        type: String, 
        enum: ['student', 'admin', 'faculty'], 
        default: 'student' 
    },

    registrationNumber : { 
        type: String,
        unique : true
    },

    mobile : {
        type : Number,
        unique : true,
        required : true,
    },

    isVerified: 
    { 
        type: Boolean, 
        default: false 
    },


}, {timestamps : true})

userSchema.methods.generateAccessToken = async function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            role: this.role,
            registrationNumber: this.registrationNumber
        },
        process.env.ACCESS_TOKEN_SECRET,
    );
};

userSchema.pre("save", async function (){

    if(!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
})

userSchema.methods.isPasswordCorrect = async function (password){

    return await bcrypt.compare(password, this.password);
}


export const User = new mongoose.model("User", userSchema);