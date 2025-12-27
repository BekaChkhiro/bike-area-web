import imageCompression from 'browser-image-compression';

export interface ImageValidationOptions {
  maxSizeBytes?: number;
  allowedTypes?: string[];
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface ImageCompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  quality?: number;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const DEFAULT_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const DEFAULT_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Validates an image file against specified options
 */
export async function validateImage(
  file: File,
  options: ImageValidationOptions = {}
): Promise<ValidationResult> {
  const {
    maxSizeBytes = DEFAULT_MAX_SIZE_BYTES,
    allowedTypes = DEFAULT_ALLOWED_TYPES,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
  } = options;

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    const allowed = allowedTypes.map((t) => t.split('/')[1]).join(', ');
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${allowed}`,
    };
  }

  // Check file size
  if (file.size > maxSizeBytes) {
    const maxMB = (maxSizeBytes / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size exceeds ${maxMB}MB limit`,
    };
  }

  // Check dimensions if required
  if (minWidth || minHeight || maxWidth || maxHeight) {
    try {
      const dimensions = await getImageDimensions(file);

      if (minWidth && dimensions.width < minWidth) {
        return {
          valid: false,
          error: `Image width must be at least ${minWidth}px`,
        };
      }

      if (minHeight && dimensions.height < minHeight) {
        return {
          valid: false,
          error: `Image height must be at least ${minHeight}px`,
        };
      }

      if (maxWidth && dimensions.width > maxWidth) {
        return {
          valid: false,
          error: `Image width must be at most ${maxWidth}px`,
        };
      }

      if (maxHeight && dimensions.height > maxHeight) {
        return {
          valid: false,
          error: `Image height must be at most ${maxHeight}px`,
        };
      }
    } catch {
      return {
        valid: false,
        error: 'Failed to read image dimensions',
      };
    }
  }

  return { valid: true };
}

/**
 * Compresses an image file using browser-image-compression
 */
export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<File> {
  const {
    maxSizeMB = 1,
    maxWidthOrHeight = 1920,
    useWebWorker = true,
    quality = 0.8,
  } = options;

  const compressedFile = await imageCompression(file, {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker,
    initialQuality: quality,
  });

  // Preserve original filename
  return new File([compressedFile], file.name, {
    type: compressedFile.type,
    lastModified: Date.now(),
  });
}

/**
 * Gets the dimensions of an image file
 */
export function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Creates a preview URL for an image file
 * Remember to revoke the URL when done using URL.revokeObjectURL()
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Converts a data URL to a File object
 */
export function dataURLtoFile(dataURL: string, filename: string): File {
  const arr = dataURL.split(',');
  const header = arr[0] || '';
  const data = arr[1] || '';
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(data);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}

/**
 * Converts a Blob to a File object
 */
export function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, {
    type: blob.type,
    lastModified: Date.now(),
  });
}

/**
 * Formats bytes to a human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Generates a unique filename with timestamp
 */
export function generateUniqueFilename(originalName: string): string {
  const ext = originalName.split('.').pop() || 'jpg';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}.${ext}`;
}

/**
 * Extracts the file extension from a filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Checks if a file is an image based on its type
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}
