import {
  v2 as cloudinary,
  type UploadApiErrorResponse,
  type UploadApiOptions,
  type UploadApiResponse,
} from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadBufferToCloudinary = (
  fileBuffer: Buffer,
  options: UploadApiOptions = {}
) =>
  new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        return reject(error as UploadApiErrorResponse);
      }

      if (!result) {
        return reject(new Error("Cloudinary upload did not return a result"));
      }

      resolve(result);
    });

    stream.end(fileBuffer);
  });

export const uploadSingleImage = (
  file: Express.Multer.File,
  folder: string
) =>
  uploadBufferToCloudinary(file.buffer, {
    folder,
    resource_type: "image",
  });

export const uploadMultipleImages = (
  files: Express.Multer.File[],
  folder: string
) =>
  Promise.all(
    files.map((file) =>
      uploadBufferToCloudinary(file.buffer, {
        folder,
        resource_type: "image",
      })
    )
  );

export default cloudinary;
