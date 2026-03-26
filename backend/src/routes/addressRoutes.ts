import { Router, Response } from 'express';
import { protect } from '../middlewares/auth';
import User from '../models/User';

const router = Router();
router.use(protect as any);

// @GET /api/addresses
router.get('/', async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user.id).select('addresses');
        return res.json(user?.addresses ?? []);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
});

// @POST /api/addresses
router.post('/', async (req: any, res: Response) => {
    try {
        const { label, fullName, phone, line1, line2, pincode, city, state, isDefault } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        if (!user.addresses) user.addresses = [];

        // If new address is default, unset existing defaults
        if (isDefault) {
            user.addresses.forEach(a => { a.isDefault = false; });
        }

        // Auto-set as default if it's the first address
        const setDefault = isDefault || user.addresses.length === 0;

        user.addresses.push({ label: label || 'Home', fullName, phone, line1, line2, pincode, city, state, isDefault: setDefault });
        await user.save();
        return res.status(201).json(user.addresses);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
});

// @PUT /api/addresses/:id
router.put('/:id', async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        const addr = user.addresses?.find(a => (a as any)._id.toString() === req.params.id);
        if (!addr) return res.status(404).json({ message: 'Address not found.' });

        const { label, fullName, phone, line1, line2, pincode, city, state, isDefault } = req.body;
        if (isDefault) user.addresses?.forEach(a => { a.isDefault = false; });

        Object.assign(addr, { label, fullName, phone, line1, line2, pincode, city, state, isDefault });
        await user.save();
        return res.json(user.addresses);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
});

// @DELETE /api/addresses/:id
router.delete('/:id', async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        user.addresses = user.addresses?.filter(a => (a as any)._id.toString() !== req.params.id) as any;
        await user.save();
        return res.json(user.addresses);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
});

// @PUT /api/addresses/:id/default
router.put('/:id/default', async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        user.addresses?.forEach(a => {
            a.isDefault = (a as any)._id.toString() === req.params.id;
        });
        await user.save();
        return res.json(user.addresses);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
});

export default router;
