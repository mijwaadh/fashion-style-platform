import { Router } from 'express';
import {
    getLooks,
    getFollowingFeed,
    getLookById,
    createLook,
    updateLook,
    deleteLook,
    toggleLikeLook,
    createUserLook,
    generateLookAI,
    getMyOutfits,
    featureLook,
} from '../controllers/lookController';
import { protect, authorize } from '../middlewares/auth';
import commentRoutes from './commentRoutes';

const router = Router();

// Nested routes for comments
router.use('/:id/comments', commentRoutes);

// Public routes
router.get('/', getLooks);
router.get('/feed/following', protect, getFollowingFeed);
router.get('/my-outfits', protect, getMyOutfits);
router.get('/:id', getLookById);

// Authenticated user actions
router.post('/:id/like', protect, toggleLikeLook);

// Community / AI Features — any logged-in user (including sellers)
// These create personal looks (draft, not in trending)
router.post('/user-created', protect, createUserLook);
router.post('/generate-ai', protect, generateLookAI);

// Admin-only routes — publishes directly to the Trending Discover feed
router.post('/', protect, authorize('admin'), createLook);
router.put('/:id', protect, authorize('admin'), updateLook);
router.delete('/:id', protect, authorize('admin'), deleteLook);

// Admin-only: feature/unfeature any look in Trending feed
router.patch('/:id/feature', protect, authorize('admin'), featureLook);

export default router;
