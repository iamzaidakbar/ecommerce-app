import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import env from '../config/env';

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (_req: Express.Request, file: Express.Multer.File) => ({
    folder: 'ecommerce',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    transformation: [
      { width: 500, height: 500, crop: 'limit' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ],
  }),
});

// Create multer upload middleware
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload only images.'));
    }
  },
});

// Function to delete image from Cloudinary
export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw new Error('Failed to delete image');
  }
};

// Function to get public ID from URL
export const getPublicIdFromUrl = (url: string): string => {
  const splits = url.split('/');
  const publicIdWithExtension = splits[splits.length - 1];
  return publicIdWithExtension.split('.')[0];
};   