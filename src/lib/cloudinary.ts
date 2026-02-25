// Cloudinary upload utility for images
export const uploadToCloudinary = async (file: File, folder: string = 'events'): Promise<string> => {
  const formData = new FormData();

  // Use the upload preset from environment variables
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!uploadPreset) {
    throw new Error('Cloudinary upload preset not configured');
  }

  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  // Generate a unique public_id to avoid conflicts
  const publicId = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  formData.append('public_id', publicId);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error('Cloudinary cloud name not configured');
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Cloudinary upload failed: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();

  // Return the secure URL for the uploaded image
  return data.secure_url;
};

// Alternative: Upload via unsigned upload (if needed)
export const uploadToCloudinaryUnsigned = async (file: File, folder: string = 'events'): Promise<string> => {
  const formData = new FormData();

  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
  formData.append('folder', folder);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Upload to Cloudinary failed');
  }

  const data = await response.json();
  return data.secure_url;
};
