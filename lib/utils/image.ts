/**
 * Image Utilities
 * 
 * Image compression and optimization.
 * Based on Open WebUI's image compression pattern.
 */

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Compress image while maintaining aspect ratio
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      let { width, height } = img;

      // Maintain aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((maxWidth * height) / width);
          width = maxWidth;
        } else {
          width = Math.round((maxHeight * width) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        file.type || 'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Convert blob to data URL
 */
export async function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Check if image needs compression
 */
export async function shouldCompressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  maxSizeBytes: number = 1024 * 1024 // 1MB
): Promise<boolean> {
  // Check file size
  if (file.size > maxSizeBytes) {
    return true;
  }

  // Check dimensions
  try {
    const { width, height } = await getImageDimensions(file);
    return width > maxWidth || height > maxHeight;
  } catch {
    return false;
  }
}

/**
 * Process image for upload
 */
export async function processImageForUpload(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    maxSizeBytes?: number;
  } = {}
): Promise<{ blob: Blob; dataUrl: string }> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    maxSizeBytes = 1024 * 1024,
  } = options;

  const shouldCompress = await shouldCompressImage(
    file,
    maxWidth,
    maxHeight,
    maxSizeBytes
  );

  if (!shouldCompress) {
    const dataUrl = await blobToDataURL(file);
    return { blob: file, dataUrl };
  }

  const compressedBlob = await compressImage(file, maxWidth, maxHeight, quality);
  const dataUrl = await blobToDataURL(compressedBlob);

  return { blob: compressedBlob, dataUrl };
}
