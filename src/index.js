import dotenv from "dotenv"
import connectDB from "./db/db.js";
import { app } from "./app.js";

dotenv.config({
    path : "./.env"
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log("app is listening on the port number : " + process.env.PORT);
    })
})
.catch((err)=>{
    console.log("MONGODB connection failed !!! ", err);
})






































/*
import express from "express";

const app = express();

(async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error", (err)=>{
        console.log("Error : " + err);
        throw err;
        })

        app.listen(process.env.PORT, ()=>{
            console.log(`App is listening on the port number : ${process.env.PORT}`)
        })
    }
    catch(e){
        console.log("Error : " + e);
    }
})()
*/