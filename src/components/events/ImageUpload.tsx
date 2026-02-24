'use client';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface CloudinaryResult {
  event: string;
  info: {
    secure_url: string;
  };
}

interface CloudinaryWidget {
  createUploadWidget: (options: unknown, callback: (error: unknown, result: CloudinaryResult | undefined) => void) => {
    open: () => void;
  };
}

declare global {
  interface Window {
    cloudinary: CloudinaryWidget;
  }
}

interface ImageUploadProps {
  onUpload: (url: string) => void;
}

export default function ImageUpload({ onUpload }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const openWidget = () => {
    setUploading(true);
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
        sources: ['local', 'camera'],
        multiple: false,
        cropping: true,
        croppingAspectRatio: 16 / 9,
        showAdvancedOptions: false,
        defaultSource: 'local',
        styles: {
          palette: {
            window: '#FFFFFF',
            windowBorder: '#90A0B3',
            tabIcon: '#0078FF',
            menuIcons: '#5A616A',
            textDark: '#000000',
            textLight: '#FFFFFF',
            link: '#0078FF',
            action: '#FF620C',
            inactiveTabIcon: '#0E2F5A',
            error: '#F44235',
            inProgress: '#0078FF',
            complete: '#20B832',
            sourceBg: '#E4EBF1',
          },
        },
      },
      (error: unknown, result: CloudinaryResult | undefined) => {
        if (!error && result && result.event === 'success') {
          onUpload(result.info.secure_url);
          setUploading(false);
        }
        if (error) {
          console.error(error);
          setUploading(false);
        }
      }
    );
    widget.open();
  };

  return (
    <Button type="button" onClick={openWidget} disabled={uploading}>
      {uploading ? 'Subiendo...' : 'Subir flyer'}
    </Button>
  );
}
