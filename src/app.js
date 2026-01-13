import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))

app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({extended:true, limit : "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// routes import
import userRouter from "./routes/user.routes.js"
import noticeRoutes from "./routes/notice.routes.js"
import issueRoutes from "./routes/issue.routes.js";
import lostFoundRoutes from './routes/lostFound.routes.js';



// routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/notices", noticeRoutes)
app.use('/api/v1/issues', issueRoutes);
app.use('/api/lost-found', lostFoundRoutes);

export { app }