// routes/notice.routes.js
import { Router } from 'express';
import { 
    createNotice, 
    getAllNotices, 
    getNoticeById, 
    updateNotice, 
    deleteNotice 
} from '../controllers/notice.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { uploadPdf } from "../middlewares/multer.middleware.js"

const router = Router();

// 📢 POST notices (Admin/Faculty + PDF/Image upload)
router.post('/', 
    verifyJWT,
    uploadPdf.single('pdfFile'),
    createNotice
);

// 👀 GET all notices (Public - students can view)
router.get('/', getAllNotices);

// 📄 GET single notice by ID (Public)
router.get('/:id', getNoticeById);

// ✏️ UPDATE notice (Author/Admin only)
router.put('/:id', verifyJWT, updateNotice);

// 🗑️ DELETE notice (Author/Admin only)
router.delete('/:id', verifyJWT, deleteNotice);

export default router;
