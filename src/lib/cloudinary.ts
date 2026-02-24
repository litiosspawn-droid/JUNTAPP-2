// Cloudinary configuration
// TODO: Add your Cloudinary config here

export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
}

export const uploadImage = async (file: File) => {
  // TODO: Implement image upload to Cloudinary
  throw new Error('Not implemented')
}
