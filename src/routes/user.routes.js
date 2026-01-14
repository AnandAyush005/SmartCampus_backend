import { Router } from "express";
import {
  changeCurrentPassword,
  loginUser,
  logoutUser,
  registerUser,
  updateAccountDetails,
  updateUserAvatar,
  getFacultyList,
  getAllUsers,
  adminDashboardStats,
  getFacultyAssignedIssues,
  getPendingVerifications,
  adminVerifyUser,
  facultyVerifyStudent,
  getVerificationHistory,
  getCurrentUser,
} from "../controllers/user.controller.js";

import { uploadImage } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

/* ===================== PUBLIC ROUTES ===================== */

router.route("/register").post(
  uploadImage.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

/* ===================== SECURED ROUTES ===================== */

router.route("/me").get(verifyJWT, getCurrentUser);

router.route("/update-details").put(verifyJWT, updateAccountDetails);

router.route("/change-password").put(verifyJWT, changeCurrentPassword);

router.route("/logout").post(verifyJWT, logoutUser);

/* ===================== USER / FACULTY ===================== */

router.route("/faculty").get(verifyJWT, getFacultyList);

router.route("/faculty/assigned-issues").get(
  verifyJWT,
  getFacultyAssignedIssues
);

/* ===================== ADMIN ===================== */

router.route("/all-users").get(verifyJWT, getAllUsers);

router.route("/admin-dashboard-stats").get(
  verifyJWT,
  adminDashboardStats
);

/* ===================== PROFILE ===================== */

router.route("/update-avatar").put(
  verifyJWT,
  uploadImage.single("avatar"),
  updateUserAvatar
);

/* ===================== VERIFICATION ===================== */

router.route("/pending-verifications").get(
  verifyJWT,
  getPendingVerifications
);

router.route("/admin/verify").put(
  verifyJWT,
  adminVerifyUser
);

router.route("/faculty/verify-student").put(
  verifyJWT,
  facultyVerifyStudent
);

router.route("/verification-history").get(
  verifyJWT,
  getVerificationHistory
);

export default router;
