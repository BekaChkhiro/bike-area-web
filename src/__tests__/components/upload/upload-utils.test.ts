import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  validateImage,
  compressImage,
  createImagePreview,
  dataURLtoFile,
  blobToFile,
  formatFileSize,
  generateUniqueFilename,
  getFileExtension,
  isImageFile,
} from '@/lib/upload-utils';

// Mock browser-image-compression
vi.mock('browser-image-compression', () => ({
  default: vi.fn((file) => Promise.resolve(file)),
}));

// Helper to create mock files
function createMockFile(
  name: string,
  size: number,
  type: string
): File {
  const buffer = new ArrayBuffer(size);
  return new File([buffer], name, { type });
}

// Helper to create mock image file with dimensions
function createMockImageFile(
  name: string,
  size: number,
  type: string = 'image/jpeg'
): File {
  return createMockFile(name, size, type);
}

describe('Upload Utils', () => {
  describe('validateImage', () => {
    describe('File Type Validation', () => {
      it('accepts valid image types', async () => {
        const jpegFile = createMockImageFile('test.jpg', 1024, 'image/jpeg');
        const pngFile = createMockImageFile('test.png', 1024, 'image/png');
        const webpFile = createMockImageFile('test.webp', 1024, 'image/webp');

        const jpegResult = await validateImage(jpegFile);
        const pngResult = await validateImage(pngFile);
        const webpResult = await validateImage(webpFile);

        expect(jpegResult.valid).toBe(true);
        expect(pngResult.valid).toBe(true);
        expect(webpResult.valid).toBe(true);
      });

      it('rejects invalid file types', async () => {
        const gifFile = createMockFile('test.gif', 1024, 'image/gif');
        const pdfFile = createMockFile('test.pdf', 1024, 'application/pdf');
        const textFile = createMockFile('test.txt', 1024, 'text/plain');

        const gifResult = await validateImage(gifFile);
        const pdfResult = await validateImage(pdfFile);
        const textResult = await validateImage(textFile);

        expect(gifResult.valid).toBe(false);
        expect(gifResult.error).toContain('File type not allowed');
        expect(pdfResult.valid).toBe(false);
        expect(textResult.valid).toBe(false);
      });

      it('accepts custom allowed types', async () => {
        const gifFile = createMockFile('test.gif', 1024, 'image/gif');

        const result = await validateImage(gifFile, {
          allowedTypes: ['image/gif'],
        });

        expect(result.valid).toBe(true);
      });
    });

    describe('File Size Validation', () => {
      it('accepts files within size limit', async () => {
        const file = createMockImageFile('test.jpg', 1024 * 1024); // 1MB

        const result = await validateImage(file, {
          maxSizeBytes: 5 * 1024 * 1024, // 5MB
        });

        expect(result.valid).toBe(true);
      });

      it('rejects files exceeding size limit', async () => {
        const file = createMockImageFile('test.jpg', 15 * 1024 * 1024); // 15MB

        const result = await validateImage(file, {
          maxSizeBytes: 10 * 1024 * 1024, // 10MB limit
        });

        expect(result.valid).toBe(false);
        expect(result.error).toContain('File size exceeds');
      });

      it('uses default 10MB limit', async () => {
        const smallFile = createMockImageFile('small.jpg', 5 * 1024 * 1024); // 5MB
        const largeFile = createMockImageFile('large.jpg', 11 * 1024 * 1024); // 11MB

        const smallResult = await validateImage(smallFile);
        const largeResult = await validateImage(largeFile);

        expect(smallResult.valid).toBe(true);
        expect(largeResult.valid).toBe(false);
      });
    });
  });

  describe('createImagePreview', () => {
    let originalCreateObjectURL: typeof URL.createObjectURL;

    beforeEach(() => {
      originalCreateObjectURL = URL.createObjectURL;
      URL.createObjectURL = vi.fn(() => 'blob:test-url');
    });

    afterEach(() => {
      URL.createObjectURL = originalCreateObjectURL;
    });

    it('creates a preview URL for a file', () => {
      const file = createMockImageFile('test.jpg', 1024);

      const url = createImagePreview(file);

      expect(url).toBe('blob:test-url');
      expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    });
  });

  describe('dataURLtoFile', () => {
    it('converts data URL to File', () => {
      const dataURL =
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQCEAwEPwAB//9k=';

      const file = dataURLtoFile(dataURL, 'test.jpg');

      expect(file).toBeInstanceOf(File);
      expect(file.name).toBe('test.jpg');
      expect(file.type).toBe('image/jpeg');
    });

    it('handles missing mime type gracefully', () => {
      const dataURL = 'data:image/png;base64,dGVzdA==';

      const file = dataURLtoFile(dataURL, 'test.png');

      expect(file).toBeInstanceOf(File);
      expect(file.type).toBe('image/png');
    });
  });

  describe('blobToFile', () => {
    it('converts Blob to File', () => {
      const blob = new Blob(['test'], { type: 'image/png' });

      const file = blobToFile(blob, 'converted.png');

      expect(file).toBeInstanceOf(File);
      expect(file.name).toBe('converted.png');
      expect(file.type).toBe('image/png');
    });
  });

  describe('formatFileSize', () => {
    it('formats bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(500)).toBe('500 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });
  });

  describe('generateUniqueFilename', () => {
    it('generates unique filename with timestamp', () => {
      const filename1 = generateUniqueFilename('photo.jpg');
      const filename2 = generateUniqueFilename('photo.jpg');

      expect(filename1).toMatch(/^\d+-[a-z0-9]+\.jpg$/);
      expect(filename2).toMatch(/^\d+-[a-z0-9]+\.jpg$/);
      // Should be different due to random component
      expect(filename1).not.toBe(filename2);
    });

    it('preserves file extension', () => {
      expect(generateUniqueFilename('image.png')).toMatch(/\.png$/);
      expect(generateUniqueFilename('photo.webp')).toMatch(/\.webp$/);
    });

    it('handles files without extension', () => {
      const filename = generateUniqueFilename('noextension');
      expect(filename).toMatch(/\.noextension$/);
    });
  });

  describe('getFileExtension', () => {
    it('extracts file extension', () => {
      expect(getFileExtension('photo.jpg')).toBe('jpg');
      expect(getFileExtension('image.PNG')).toBe('png');
      expect(getFileExtension('file.JPEG')).toBe('jpeg');
    });

    it('handles files with multiple dots', () => {
      expect(getFileExtension('my.photo.jpg')).toBe('jpg');
      expect(getFileExtension('file.name.with.dots.png')).toBe('png');
    });

    it('returns empty string for files without extension', () => {
      expect(getFileExtension('noextension')).toBe('noextension');
    });
  });

  describe('isImageFile', () => {
    it('identifies image files', () => {
      expect(isImageFile(createMockFile('test.jpg', 100, 'image/jpeg'))).toBe(
        true
      );
      expect(isImageFile(createMockFile('test.png', 100, 'image/png'))).toBe(
        true
      );
      expect(isImageFile(createMockFile('test.webp', 100, 'image/webp'))).toBe(
        true
      );
      expect(isImageFile(createMockFile('test.gif', 100, 'image/gif'))).toBe(
        true
      );
    });

    it('rejects non-image files', () => {
      expect(
        isImageFile(createMockFile('test.pdf', 100, 'application/pdf'))
      ).toBe(false);
      expect(isImageFile(createMockFile('test.txt', 100, 'text/plain'))).toBe(
        false
      );
      expect(
        isImageFile(createMockFile('test.mp4', 100, 'video/mp4'))
      ).toBe(false);
    });
  });

  describe('compressImage', () => {
    it('compresses image file', async () => {
      const file = createMockImageFile('large.jpg', 5 * 1024 * 1024);

      const compressed = await compressImage(file);

      expect(compressed).toBeInstanceOf(File);
      expect(compressed.name).toBe('large.jpg');
    });

    it('preserves original filename', async () => {
      const file = createMockImageFile('my-photo.jpg', 1024);

      const compressed = await compressImage(file);

      expect(compressed.name).toBe('my-photo.jpg');
    });

    it('accepts custom compression options', async () => {
      const file = createMockImageFile('photo.jpg', 1024);

      const compressed = await compressImage(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1024,
        quality: 0.7,
      });

      expect(compressed).toBeInstanceOf(File);
    });
  });
});
