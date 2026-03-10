import { Router } from 'express';
import { protect, authorize } from '../middlewares/auth';
import {
    getPlatformStats,
    getAllUsers,
    updateUserRole,
    deleteUser,
    getAllLooks,
    updateLook,
    deleteLook,
    featureLookAdmin,
    getAllProducts,
    updateProduct,
    deleteProduct,
    toggleProductPublish,
    getAllComments,
    deleteComment,
    createBroadcastNotification,
} from '../controllers/adminController';

const router = Router();

// All admin routes require authentication + admin role
router.use(protect, authorize('admin'));

// Stats
router.get('/stats', getPlatformStats);

// Users
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Looks
router.get('/looks', getAllLooks);
router.patch('/looks/:id/feature', featureLookAdmin);
router.put('/looks/:id', updateLook);
router.delete('/looks/:id', deleteLook);

// Products
router.get('/products', getAllProducts);
router.patch('/products/:id/publish', toggleProductPublish);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Comments
router.get('/comments', getAllComments);
router.delete('/comments/:id', deleteComment);

// Notifications
router.post('/notifications/broadcast', createBroadcastNotification);
// trigger reload

export default router;
