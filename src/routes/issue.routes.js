import { Router } from 'express';
import { 
    createIssue, 
    getAllIssues, 
    getMyIssues, 
    updateIssueStatus,
    assignIssue 
} from '../controllers/issue.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { uploadImage } from '../middlewares/multer.middleware.js';

const router = Router();

// 🆕 Students report issues (images upload)
router.post('/', verifyJWT, uploadImage.array('images', 5), createIssue);

// 📋 All issues (public for students, full for admins)
router.get('/', verifyJWT, getAllIssues);

// 👤 My issues (student sees own, admin sees all)
router.get('/my-issues', verifyJWT, getMyIssues);

// 🔧 Admin assigns issue to faculty
router.put('/:id/assign', verifyJWT, assignIssue);

// ✅ Admin/faculty updates status
router.put('/:id/status', verifyJWT, updateIssueStatus);

export default router;
