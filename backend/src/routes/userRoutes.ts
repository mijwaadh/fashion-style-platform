import { Router } from 'express';
import { Request, Response } from 'express';
import { protect, authorize } from '../middlewares/auth';
import User from '../models/User';

const router = Router();

// @GET /api/users — Admin only: list all users
router.get('/', protect, authorize('admin'), async (_req: Request, res: Response) => {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    return res.json(users);
});

// @GET /api/users/sellers — Public: list sellers (for creators directory)
router.get('/sellers', async (_req: Request, res: Response) => {
    const sellers = await User.find({ role: 'seller' }).select('-passwordHash').sort({ createdAt: -1 });
    return res.json(sellers);
});

import { getMySavedLooks, toggleSaveLook, toggleFollow, getCreatorProfile } from '../controllers/userController';

// @GET /api/users/saves — Protected
router.get('/saves', protect, getMySavedLooks);

// @POST /api/users/saves/:lookId — Protected
router.post('/saves/:lookId', protect, toggleSaveLook);

// @POST /api/users/follow/:id — Protected
router.post('/follow/:id', protect, toggleFollow);

// @GET /api/users/public/:id — Public: robust creator profile + works
router.get('/public/:id', getCreatorProfile);

// @GET /api/users/me — Get own profile (protected)
router.get('/me', protect, async (req: Request, res: Response) => {
    const user = await User.findById((req as any).user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.json(user);
});

// @PUT /api/users/me — Update own profile (protected)
router.put('/me', protect, async (req: Request, res: Response) => {
    const { name, bio, profileImage, storeName } = req.body;
    const user = await User.findByIdAndUpdate(
        (req as any).user.id,
        { name, bio, profileImage, storeName },
        { returnDocument: 'after', runValidators: true }
    ).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.json(user);
});

// @GET /api/users/:id — Public: creator profile
router.get('/:id', async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.json(user);
});



// @DELETE /api/users/:id — Admin only
router.delete('/:id', protect, authorize('admin'), async (req: Request, res: Response) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.json({ message: 'User deleted.' });
});

export default router;
