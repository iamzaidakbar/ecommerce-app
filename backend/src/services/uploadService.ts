import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import env from '../config/env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (file: Express.Multer.File) => ({
    folder: 'ecommerce',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
    public_id: `${Date.now()}-${file.originalname}`,
  }),
});

export const upload = multer({ storage: storage });

export const deleteImage = async (publicId: string) => {
  await cloudinary.uploader.destroy(publicId);
};   