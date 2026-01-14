// routes/notice.routes.js
import { Router } from "express";
import {
  createNotice,
  getAllNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
} from "../controllers/notice.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadPdf } from "../middlewares/multer.middleware.js";

const router = Router();

/* ===================== NOTICES ===================== */

// 📢 Create notice (Admin / Faculty)
router.route("/")
  .post(
    verifyJWT,
    uploadPdf.single("pdfFile"),
    createNotice
  )
  .get(getAllNotices);

// 📄 Single notice
router.route("/:id")
  .get(getNoticeById)
  .put(verifyJWT, updateNotice)
  .delete(verifyJWT, deleteNotice);

export default router;
