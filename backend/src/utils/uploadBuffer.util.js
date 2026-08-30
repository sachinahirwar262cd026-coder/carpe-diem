import cloudinary from "../config/cloudinary";

/**
 * Uploads a buffer (e.g. req.file.buffer from multer memoryStorage) to Cloudinary.
 * @param {Buffer} buffer
 * @param {string} folder - Cloudinary folder to organize uploads, e.g. "noise-complaints"
 * @returns {Promise<{secureUrl: string, publicId: string}>}
 */
const uploadBufferToCloudinary = (buffer, folder = "noise-complaints") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve({ secureUrl: result.secure_url, publicId: result.public_id });
      }
    );
    uploadStream.end(buffer);
  });
};

export default uploadBufferToCloudinary;
