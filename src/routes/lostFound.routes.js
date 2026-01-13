import { Router } from 'express';
import { 
    createLostFound, 
    getAllLostFound, 
    getMyLostFound, 
    adminApproveLostFound,
    claimLostFound 
} from '../controllers/lostFound.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { uploadImage } from '../middlewares/multer.middleware.js';

const router = Router();

// 📱 Students post lost/found items
router.post('/', verifyJWT, uploadImage.array('images', 5), createLostFound);

// 👀 View all approved items (public for students)
router.get('/', verifyJWT, getAllLostFound);

// 📋 My posts (only own items)
router.get('/my-posts', verifyJWT, getMyLostFound);

// 👨‍💼 Admin approves/rejects
router.patch('/:id/approve', verifyJWT, adminApproveLostFound);

// ✅ Claim found item
router.patch('/:id/claim', verifyJWT, claimLostFound);

export default router;
