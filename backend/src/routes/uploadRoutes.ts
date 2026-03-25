import { Router } from 'express';
import { Request, Response } from 'express';
import { protect, authorize } from '../middlewares/auth';
import { cloudinary } from '../config/cloudinary';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure local storage for temporary processing
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/temp';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadLocal = multer({ storage });

// @POST /api/upload — Protected, sellers and admins only
router.post('/', protect, authorize('seller', 'admin'), uploadLocal.single('image'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image provided.' });
        }

        const inputPath = req.file.path;
        const originalResult = await cloudinary.uploader.upload(inputPath, { folder: 'aura_fashion/original' });

        // Cleanup local file
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);

        return res.json({
            message: 'Image uploaded successfully',
            url: originalResult.secure_url,
            transparentUrl: originalResult.secure_url,
        });

    } catch (error: any) {
        console.error('Upload Process Error:', error);
        return res.status(500).json({ message: 'Processing failed.', error: error.message });
    }
});

// @POST /api/upload/avatar — Protected, any authenticated user
router.post('/avatar', protect, uploadLocal.single('image'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image provided.' });
        }

        // Avatars don't need background removal usually, just upload directly
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'aura_avatars',
            transformation: [{ width: 400, height: 400, crop: 'fill' }]
        });

        // Cleanup local file
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        return res.json({
            message: 'Avatar uploaded successfully',
            url: result.secure_url,
        });
    } catch (error: any) {
        console.error('Avatar Upload Error:', error);
        return res.status(500).json({ message: 'Avatar upload failed.', error: error.message });
    }
});

// @POST /api/upload/video — Protected, any authenticated user
router.post('/video', protect, uploadLocal.single('video'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No video provided.' });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'aura_fashion/videos',
            resource_type: 'video',
            // Increase timeout for longer videos if necessary, or rely on defaults
        });

        // Cleanup local file
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        return res.json({
            message: 'Video uploaded successfully',
            url: result.secure_url,
            // Automatically generate thumbnail URL by changing extension
            thumbnailUrl: result.secure_url.replace(/\.[^/.]+$/, '.jpg')
        });
    } catch (error: any) {
        console.error('Video Upload Error:', error);
        return res.status(500).json({ message: 'Video upload failed.', error: error.message });
    }
});

// @POST /api/upload/images — Protected, any authenticated user
router.post('/images', protect, uploadLocal.array('images', 10), async (req: Request, res: Response) => {
    try {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return res.status(400).json({ message: 'No images provided.' });
        }

        const uploadPromises = req.files.map(file => {
            return cloudinary.uploader.upload(file.path, {
                folder: 'aura_fashion/images',
                resource_type: 'image'
            });
        });

        const results = await Promise.all(uploadPromises);

        // Cleanup local files
        for (const file of req.files) {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        }

        const urls = results.map(result => result.secure_url);

        return res.json({
            message: 'Images uploaded successfully',
            urls
        });
    } catch (error: any) {
        console.error('Multiple Images Upload Error:', error);
        return res.status(500).json({ message: 'Images upload failed.', error: error.message });
    }
});

export default router;
