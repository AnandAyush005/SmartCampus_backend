import { Router } from "express";
import { changeCurrentPassword, loginUser, logoutUser, registerUser, updateAccountDetails, updateUserAvatar, getFacultyList, getAllUsers, adminDashboardStats, getFacultyAssignedIssues, getPendingVerifications, adminVerifyUser, facultyVerifyStudent, getVerificationHistory } from "../controllers/user.controller.js";
import { uploadImage } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    uploadImage.fields(
        [
            {
                name : "avatar",
                maxCount : 1
            },
        ]
    ),

    registerUser)


router.route("/login").post(loginUser)

// secured routes
router.route("/update-details").put(verifyJWT, updateAccountDetails);
router.route("/change-password").put(verifyJWT, changeCurrentPassword);
router.route("/logout").post(verifyJWT, logoutUser);

router.get('/faculty', verifyJWT, getFacultyList);
router.get("/all-users", verifyJWT, getAllUsers);
router.get("/admin-dashboard-stats", verifyJWT, adminDashboardStats);
router.get("/get-faculty-assgined-issue", verifyJWT, getFacultyAssignedIssues);

router.put(
  "/update-avatar",
  verifyJWT,               
  uploadImage.single("avatar"),  
  updateUserAvatar
);

// 🔐 VERIFICATION ROUTES
router.get('/pending-verifications', verifyJWT, getPendingVerifications);     // Admin/Faculty dashboard
router.put('/admin-verify', verifyJWT, adminVerifyUser);               // Admin verifies anyone
router.put('/faculty/verify-student', verifyJWT, facultyVerifyStudent); // Faculty verifies students
router.get('/verification-history', verifyJWT, getVerificationHistory);       // Verification logs



export default router;