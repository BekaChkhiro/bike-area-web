import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';

import { ImageUpload } from '@/components/upload/image-upload';
import { render } from '../../utils/test-utils';

// Mock URL.createObjectURL and revokeObjectURL
const mockCreateObjectURL = vi.fn(() => 'blob:test-preview-url');
const mockRevokeObjectURL = vi.fn();

beforeEach(() => {
  URL.createObjectURL = mockCreateObjectURL;
  URL.revokeObjectURL = mockRevokeObjectURL;
  mockCreateObjectURL.mockClear();
  mockRevokeObjectURL.mockClear();
});

afterEach(() => {
  vi.clearAllMocks();
});

// Helper to create mock files
function createMockFile(
  name: string,
  size: number,
  type: string
): File {
  const buffer = new ArrayBuffer(size);
  return new File([buffer], name, { type });
}

describe('ImageUpload', () => {
  describe('Initial Display', () => {
    it('renders dropzone when no value provided', () => {
      render(<ImageUpload />);

      expect(
        screen.getByText(/drag & drop or click to upload/i)
      ).toBeInTheDocument();
    });

    it('shows file type and size hints', () => {
      render(<ImageUpload maxSizeMB={5} />);

      expect(screen.getByText(/jpg, png or webp/i)).toBeInTheDocument();
      expect(screen.getByText(/max 5mb/i)).toBeInTheDocument();
    });

    it('shows default 10MB limit', () => {
      render(<ImageUpload />);

      expect(screen.getByText(/max 10mb/i)).toBeInTheDocument();
    });

    it('renders custom placeholder when provided', () => {
      render(
        <ImageUpload
          placeholder={<div data-testid="custom-placeholder">Custom Upload</div>}
        />
      );

      expect(screen.getByTestId('custom-placeholder')).toBeInTheDocument();
    });
  });

  describe('Preview Display', () => {
    it('shows preview when value is provided', () => {
      render(<ImageUpload value="https://example.com/image.jpg" showPreview />);

      const image = screen.getByRole('img', { name: /preview/i });
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src');
    });

    it('shows remove button on preview', () => {
      render(<ImageUpload value="https://example.com/image.jpg" showPreview />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('hides remove button when disabled', () => {
      render(
        <ImageUpload
          value="https://example.com/image.jpg"
          showPreview
          disabled
        />
      );

      // Should not show a remove button when disabled
      const buttons = screen.queryAllByRole('button');
      expect(buttons.length).toBe(0);
    });
  });

  describe('File Selection', () => {
    it('accepts file via input', async () => {
      const onChange = vi.fn();
      render(<ImageUpload onChange={onChange} />);

      const input = document.querySelector('input[type="file"]');
      const file = createMockFile('photo.jpg', 1024, 'image/jpeg');

      if (input) {
        fireEvent.change(input, { target: { files: [file] } });
      }

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });

    it('accepts file input selection', async () => {
      const onFileSelect = vi.fn();
      render(<ImageUpload onFileSelect={onFileSelect} />);

      const input = document.querySelector('input[type="file"]');
      const file = createMockFile('photo.jpg', 1024, 'image/jpeg');

      if (input) {
        fireEvent.change(input, { target: { files: [file] } });
      }

      await waitFor(() => {
        expect(onFileSelect).toHaveBeenCalledWith(expect.any(File));
      });
    });

    it('processes single file selection correctly', async () => {
      const onFileSelect = vi.fn();
      render(<ImageUpload onFileSelect={onFileSelect} />);

      const input = document.querySelector('input[type="file"]');
      const file = createMockFile('photo.jpg', 1024, 'image/jpeg');

      if (input) {
        fireEvent.change(input, { target: { files: [file] } });
      }

      await waitFor(() => {
        expect(onFileSelect).toHaveBeenCalledTimes(1);
        expect(onFileSelect).toHaveBeenCalledWith(expect.any(File));
      });
    });

    it('creates preview URL for selected file', async () => {
      render(<ImageUpload showPreview />);

      const input = document.querySelector('input[type="file"]');
      const file = createMockFile('photo.jpg', 1024, 'image/jpeg');

      if (input) {
        fireEvent.change(input, { target: { files: [file] } });
      }

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(File));
      });
    });
  });

  describe('File Validation', () => {
    it('rejects files exceeding size limit', async () => {
      render(<ImageUpload maxSizeMB={1} />);

      const input = document.querySelector('input[type="file"]');

      // 2MB file when limit is 1MB
      const file = createMockFile('large.jpg', 2 * 1024 * 1024, 'image/jpeg');

      if (input) {
        fireEvent.change(input, { target: { files: [file] } });
      }

      await waitFor(() => {
        // React-dropzone shows "File is too large" message
        expect(screen.getByText(/too large/i)).toBeInTheDocument();
      });
    });

    it('rejects invalid file types', async () => {
      render(<ImageUpload />);

      const input = document.querySelector('input[type="file"]');
      const file = createMockFile('document.pdf', 1024, 'application/pdf');

      if (input) {
        fireEvent.change(input, { target: { files: [file] } });
      }

      await waitFor(() => {
        // React-dropzone shows "Invalid file type" message
        expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
      });
    });

    it('accepts valid files', async () => {
      const onFileSelect = vi.fn();
      render(<ImageUpload onFileSelect={onFileSelect} />);

      const input = document.querySelector('input[type="file"]');
      const file = createMockFile('photo.jpg', 1024, 'image/jpeg');

      if (input) {
        fireEvent.change(input, { target: { files: [file] } });
      }

      await waitFor(() => {
        expect(onFileSelect).toHaveBeenCalled();
      });
    });
  });

  describe('Upload Process', () => {
    it('calls onUpload with file when upload handler provided', async () => {
      const onUpload = vi.fn().mockResolvedValue('https://example.com/uploaded.jpg');
      render(<ImageUpload onUpload={onUpload} />);

      const input = document.querySelector('input[type="file"]');
      const file = createMockFile('photo.jpg', 1024, 'image/jpeg');

      if (input) {
        fireEvent.change(input, { target: { files: [file] } });
      }

      await waitFor(() => {
        expect(onUpload).toHaveBeenCalledWith(expect.any(File));
      });
    });

    it('updates value with uploaded URL on success', async () => {
      const onChange = vi.fn();
      const onUpload = vi.fn().mockResolvedValue('https://example.com/uploaded.jpg');
      render(<ImageUpload onChange={onChange} onUpload={onUpload} />);

      const input = document.querySelector('input[type="file"]');
      const file = createMockFile('photo.jpg', 1024, 'image/jpeg');

      if (input) {
        fireEvent.change(input, { target: { files: [file] } });
      }

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('https://example.com/uploaded.jpg');
      });
    });

    it('shows error on upload failure', async () => {
      const onUpload = vi.fn().mockRejectedValue(new Error('Network error'));
      render(<ImageUpload onUpload={onUpload} />);

      const input = document.querySelector('input[type="file"]');
      const file = createMockFile('photo.jpg', 1024, 'image/jpeg');

      if (input) {
        fireEvent.change(input, { target: { files: [file] } });
      }

      await waitFor(() => {
        // The UploadProgress component shows the error - look for error styling
        const errorElement = document.querySelector('[class*="destructive"]');
        expect(errorElement).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('shows progress during upload', async () => {
      const onUpload = vi.fn(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve('https://example.com/uploaded.jpg'), 500);
          })
      );
      render(<ImageUpload onUpload={onUpload} showPreview />);

      const input = document.querySelector('input[type="file"]');
      const file = createMockFile('photo.jpg', 1024, 'image/jpeg');

      if (input) {
        fireEvent.change(input, { target: { files: [file] } });
      }

      // Should show loading indicator
      await waitFor(() => {
        const loadingIndicator = document.querySelector('.animate-spin');
        expect(loadingIndicator).toBeInTheDocument();
      });
    });
  });

  describe('Remove Image', () => {
    it('removes preview when remove button clicked', async () => {
      const onChange = vi.fn();
      const { user } = render(
        <ImageUpload
          value="https://example.com/image.jpg"
          onChange={onChange}
          showPreview
        />
      );

      const removeButton = screen.getByRole('button');
      await user.click(removeButton);

      expect(onChange).toHaveBeenCalledWith(null);
    });

    it('revokes blob URL when removing preview', async () => {
      const { user } = render(<ImageUpload showPreview />);

      const input = document.querySelector('input[type="file"]');
      const file = createMockFile('photo.jpg', 1024, 'image/jpeg');

      if (input) {
        fireEvent.change(input, { target: { files: [file] } });
      }

      await waitFor(() => {
        expect(screen.getByRole('img', { name: /preview/i })).toBeInTheDocument();
      });

      const removeButton = screen.getByRole('button');
      await user.click(removeButton);

      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('disables dropzone when disabled prop is true', () => {
      render(<ImageUpload disabled />);

      const dropzone = screen.getByText(/drag & drop or click to upload/i)
        .closest('div[class*="border-dashed"]');

      expect(dropzone?.className).toContain('cursor-not-allowed');
      expect(dropzone?.className).toContain('opacity-50');
    });

    it('applies disabled styling when disabled', () => {
      render(<ImageUpload disabled />);

      // React-dropzone applies disabled state via the wrapper div's styling
      const dropzone = screen.getByText(/drag & drop or click to upload/i)
        .closest('div[class*="border-dashed"]');

      expect(dropzone?.className).toContain('cursor-not-allowed');
    });
  });

  describe('Drag States', () => {
    it('shows drag instruction text', () => {
      render(<ImageUpload />);

      // Verify the base drag & drop instruction is shown
      expect(
        screen.getByText(/drag & drop or click to upload/i)
      ).toBeInTheDocument();
    });
  });

  describe('Custom Accept Types', () => {
    it('accepts custom file types', async () => {
      const onFileSelect = vi.fn();
      render(
        <ImageUpload
          onFileSelect={onFileSelect}
          accept={{ 'image/gif': ['.gif'] }}
        />
      );

      const input = document.querySelector('input[type="file"]');
      const file = createMockFile('animation.gif', 1024, 'image/gif');

      if (input) {
        fireEvent.change(input, { target: { files: [file] } });
      }

      await waitFor(() => {
        expect(onFileSelect).toHaveBeenCalled();
      });
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className to wrapper', () => {
      const { container } = render(<ImageUpload className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('applies custom previewClassName', () => {
      const { container } = render(
        <ImageUpload
          value="https://example.com/image.jpg"
          showPreview
          previewClassName="preview-custom"
        />
      );

      const preview = container.querySelector('.preview-custom');
      expect(preview).toBeInTheDocument();
    });
  });
});
