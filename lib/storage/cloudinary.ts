import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary server-side
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

/**
 * Server-side helper to upload image buffer to Cloudinary.
 * Never exposes CLOUDINARY_API_SECRET to client.
 */
export async function uploadImageToCloudinary(
  imageBuffer: Buffer,
  folder = 'fixproof_evidence'
): Promise<CloudinaryUploadResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  // Fallback for local demo/testing when Cloudinary credentials are missing or placeholder
  if (!cloudName || !apiKey || !apiSecret || cloudName === 'your_cloud_name') {
    console.warn('⚠️ Cloudinary credentials not configured in environment. Using Base64 data URI fallback for local testing.');
    const base64Data = imageBuffer.toString('base64');
    const mockUrl = `data:image/jpeg;base64,${base64Data}`;
    return {
      url: mockUrl,
      publicId: `local_mock_${Date.now()}`,
    };
  }

  return new Promise((resolve) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result) {
          console.warn('⚠️ Cloudinary API upload failed (403 or invalid credentials). Using Base64 data URI fallback:', error?.message || error);
          const base64Data = imageBuffer.toString('base64');
          const fallbackUrl = `data:image/jpeg;base64,${base64Data}`;
          return resolve({
            url: fallbackUrl,
            publicId: `fallback_${Date.now()}`,
          });
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(imageBuffer);
  });
}
