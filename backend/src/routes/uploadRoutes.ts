import { Router } from 'express';
import { Request, Response } from 'express';
import { protect, authorize } from '../middlewares/auth';
import { cloudinary } from '../config/cloudinary';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';

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
        const outputPath = inputPath.replace(path.extname(inputPath), '-no-bg.png');

        // 1. Run rembg via Python script
        const pythonProcess = spawn('python3', [
            path.join(process.cwd(), 'bg_remover.py'),
            inputPath,
            outputPath
        ]);

        let errorOutput = '';
        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        const exitCode = await new Promise((resolve) => {
            pythonProcess.on('close', resolve);
        });

        if (exitCode !== 0) {
            console.error('rembg Error:', errorOutput);
            // Cleanup input on failure
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            return res.status(500).json({ message: 'Background removal failed.', error: errorOutput });
        }

        // 2. Upload both to Cloudinary
        const [originalResult, transparentResult] = await Promise.all([
            cloudinary.uploader.upload(inputPath, { folder: 'aura_fashion/original' }),
            cloudinary.uploader.upload(outputPath, { folder: 'aura_fashion/transparent' })
        ]);

        // 3. Cleanup local files
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

        return res.json({
            message: 'Image processed and uploaded successfully',
            url: originalResult.secure_url,
            transparentUrl: transparentResult.secure_url,
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

export default router;
