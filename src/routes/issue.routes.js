import { Router } from "express";
import {
  createIssue,
  getAllIssues,
  getMyIssues,
  updateIssueStatus,
  assignIssue,
} from "../controllers/issue.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadImage } from "../middlewares/multer.middleware.js";

const router = Router();

/* ===================== ISSUES ===================== */

// 🆕 Create issue (students)
router.route("/")
  .post(
    verifyJWT,
    uploadImage.array("images", 5),
    createIssue
  )
  .get(
    verifyJWT,
    getAllIssues
  );

// 👤 My issues
router.route("/my")
  .get(
    verifyJWT,
    getMyIssues
  );

// 🔧 Assign issue to faculty (admin)
router.route("/:id/assign")
  .put(
    verifyJWT,
    assignIssue
  );

// ✅ Update issue status (admin / faculty)
router.route("/:id/status")
  .put(
    verifyJWT,
    updateIssueStatus
  );

export default router;
