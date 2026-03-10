import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary V2 SDK
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer Storage Engine to upload directly to Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'aura_fashion',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
            {
                width: 1200,
                height: 1600,
                crop: 'fill',
                gravity: 'auto',
                quality: 'auto:best',
                fetch_format: 'auto',
            }
        ],
    } as any,
});

export const upload = multer({ storage });
export { cloudinary };
