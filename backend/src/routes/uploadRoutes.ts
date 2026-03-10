import { Router } from 'express';
import { Request, Response } from 'express';
import { protect, authorize } from '../middlewares/auth';
import { upload } from '../config/cloudinary';

const router = Router();

// @POST /api/upload — Protected, sellers and admins only
router.post('/', protect, authorize('seller', 'admin'), (req: Request, res: Response) => {
    upload.single('image')(req, res, (err: any) => {
        if (err) {
            console.error('Cloudinary Upload Error:', err);
            return res.status(500).json({ message: 'Image upload failed. Please check your Cloudinary credentials.' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No image provided.' });
        }

        const originalUrl = req.file.path;

        // Generate transparent URL using Cloudinary AI Background Removal
        // Example original: https://res.cloudinary.com/<cloud-name>/image/upload/v1234/<public-id>.jpg
        // Example transparent: https://res.cloudinary.com/<cloud-name>/image/upload/e_background_removal/v1234/<public-id>.png

        let transparentUrl = originalUrl;

        // Insert e_background_removal after '/upload/'
        const uploadIndex = transparentUrl.indexOf('/upload/');
        if (uploadIndex !== -1) {
            const prefix = transparentUrl.substring(0, uploadIndex + 8);
            const suffix = transparentUrl.substring(uploadIndex + 8);

            // Replace extension with .png to support transparency
            const suffixPng = suffix.replace(/\.(jpg|jpeg|webp)$/i, '.png');

            // Add background removal and 3:4 smart crop
            transparentUrl = `${prefix}e_background_removal,c_fill,g_auto,w_1200,h_1600/${suffixPng}`;
        }


        // multer-storage-cloudinary attaches the secure cloudinary URL to `req.file.path`
        return res.json({
            message: 'Image uploaded successfully',
            url: originalUrl,
            transparentUrl: transparentUrl,
        });
    });
});

// @POST /api/upload/avatar — Protected, any authenticated user
router.post('/avatar', protect, (req: Request, res: Response) => {
    upload.single('image')(req, res, (err: any) => {
        if (err) {
            console.error('Cloudinary Upload Error:', err);
            return res.status(500).json({ message: 'Avatar upload failed. Please check your image size or format.' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No image provided.' });
        }

        return res.json({
            message: 'Avatar uploaded successfully',
            url: req.file.path,
        });
    });
});

export default router;
