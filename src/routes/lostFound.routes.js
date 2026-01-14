import { Router } from "express";
import {
  createLostFound,
  getAllLostFound,
  getMyLostFound,
  adminApproveLostFound,
  claimLostFound,
} from "../controllers/lostFound.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadImage } from "../middlewares/multer.middleware.js";

const router = Router();

/* ===================== LOST & FOUND ===================== */

// 📱 Create lost/found post (students)
router.route("/")
  .post(
    verifyJWT,
    uploadImage.array("images", 5),
    createLostFound
  )
  .get(
    verifyJWT,   // authenticated students
    getAllLostFound
  );

// 📋 My posts (own items)
router.route("/my-posts")
  .get(
    verifyJWT,
    getMyLostFound
  );

// 👨‍💼 Admin approves/rejects post
router.route("/:id/approve")
  .patch(
    verifyJWT,
    adminApproveLostFound
  );

// ✅ Claim found item
router.route("/:id/claim")
  .patch(
    verifyJWT,
    claimLostFound
  );

export default router;
