import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';

import { MultiImageUpload } from '@/components/upload/multi-image-upload';
import { render } from '../../utils/test-utils';

// Mock URL APIs
const mockCreateObjectURL = vi.fn(() => 'blob:test-preview-url');
const mockRevokeObjectURL = vi.fn();

// Mock @dnd-kit
vi.mock('@dnd-kit/core', async () => {
  const actual = await vi.importActual('@dnd-kit/core');
  return {
    ...actual,
    DndContext: ({ children }: { children: React.ReactNode }) => <div data-testid="dnd-context">{children}</div>,
  };
});

vi.mock('@dnd-kit/sortable', async () => {
  const actual = await vi.importActual('@dnd-kit/sortable');
  return {
    ...actual,
    SortableContext: ({ children }: { children: React.ReactNode }) => <div data-testid="sortable-context">{children}</div>,
    useSortable: () => ({
      attributes: {},
      listeners: {},
      setNodeRef: vi.fn(),
      transform: null,
      transition: null,
      isDragging: false,
    }),
  };
});

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

describe('MultiImageUpload', () => {
  describe('Initial Display', () => {
    it('renders add images button when empty', () => {
      render(<MultiImageUpload />);

      expect(screen.getByText(/add images/i)).toBeInTheDocument();
    });

    it('shows file count 0/10 by default', () => {
      render(<MultiImageUpload />);

      expect(screen.getByText('0/10')).toBeInTheDocument();
    });

    it('shows custom max files count', () => {
      render(<MultiImageUpload maxFiles={5} />);

      expect(screen.getByText('0/5')).toBeInTheDocument();
    });

    it('shows helper text with limits', () => {
      render(<MultiImageUpload maxSizeMB={5} maxFiles={8} />);

      expect(screen.getByText(/max 5mb each/i)).toBeInTheDocument();
      expect(screen.getByText(/up to 8 images/i)).toBeInTheDocument();
    });

    it('shows drag to reorder hint', () => {
      render(<MultiImageUpload />);

      expect(screen.getByText(/drag images to reorder/i)).toBeInTheDocument();
    });
  });

  describe('Initial Value', () => {
    it('displays images from initial value', () => {
      render(
        <MultiImageUpload
          value={[
            'https://example.com/image1.jpg',
            'https://example.com/image2.jpg',
          ]}
        />
      );

      const images = screen.getAllByRole('img', { name: /preview/i });
      expect(images).toHaveLength(2);
    });

    it('shows correct count with initial value', () => {
      render(
        <MultiImageUpload
          value={[
            'https://example.com/image1.jpg',
            'https://example.com/image2.jpg',
          ]}
          maxFiles={10}
        />
      );

      expect(screen.getByText('2/10')).toBeInTheDocument();
    });
  });

  describe('File Selection', () => {
    it('accepts multiple files via input', async () => {
      const onChange = vi.fn();
      render(<MultiImageUpload onChange={onChange} />);

      const input = document.querySelector('input[type="file"]');
      const files = [
        createMockFile('photo1.jpg', 1024, 'image/jpeg'),
        createMockFile('photo2.jpg', 1024, 'image/jpeg'),
      ];

      if (input) {
        fireEvent.change(input, { target: { files } });
      }

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });

    it('creates preview for each selected file', async () => {
      render(<MultiImageUpload />);

      const input = document.querySelector('input[type="file"]');
      const files = [
        createMockFile('photo1.jpg', 1024, 'image/jpeg'),
        createMockFile('photo2.jpg', 1024, 'image/jpeg'),
      ];

      if (input) {
        fireEvent.change(input, { target: { files } });
      }

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalledTimes(2);
      });
    });

    it('limits files to maxFiles', async () => {
      const onChange = vi.fn();
      render(<MultiImageUpload maxFiles={2} onChange={onChange} />);

      const input = document.querySelector('input[type="file"]');
      const files = [
        createMockFile('photo1.jpg', 1024, 'image/jpeg'),
        createMockFile('photo2.jpg', 1024, 'image/jpeg'),
        createMockFile('photo3.jpg', 1024, 'image/jpeg'),
      ];

      if (input) {
        fireEvent.change(input, { target: { files } });
      }

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
        const calledWith = onChange.mock.calls[0][0];
        expect(calledWith.length).toBeLessThanOrEqual(2);
      });
    });

    it('respects remaining slots when adding to existing images', async () => {
      const onChange = vi.fn();
      render(
        <MultiImageUpload
          value={['https://example.com/existing.jpg']}
          maxFiles={2}
          onChange={onChange}
        />
      );

      const input = document.querySelector('input[type="file"]');
      const files = [
        createMockFile('photo1.jpg', 1024, 'image/jpeg'),
        createMockFile('photo2.jpg', 1024, 'image/jpeg'),
      ];

      if (input) {
        fireEvent.change(input, { target: { files } });
      }

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
        const calledWith = onChange.mock.calls[0][0];
        // Should only add 1 (max 2 - 1 existing = 1 slot)
        expect(calledWith.length).toBeLessThanOrEqual(2);
      });
    });

    it('shows "Add more" when images exist', async () => {
      render(
        <MultiImageUpload value={['https://example.com/existing.jpg']} />
      );

      expect(screen.getByText(/add more/i)).toBeInTheDocument();
    });
  });

  describe('File Validation', () => {
    it('shows error for oversized files', async () => {
      render(<MultiImageUpload maxSizeMB={1} />);

      const input = document.querySelector('input[type="file"]');
      const file = createMockFile('large.jpg', 2 * 1024 * 1024, 'image/jpeg');

      if (input) {
        fireEvent.change(input, { target: { files: [file] } });
      }

      await waitFor(() => {
        // React-dropzone shows "File is too large" message
        expect(screen.getByText(/too large/i)).toBeInTheDocument();
      });
    });

    it('shows error for invalid file types', async () => {
      render(<MultiImageUpload />);

      const input = document.querySelector('input[type="file"]');
      const file = createMockFile('document.pdf', 1024, 'application/pdf');

      if (input) {
        fireEvent.change(input, { target: { files: [file] } });
      }

      await waitFor(() => {
        // The error message includes the filename and "Invalid file type"
        expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
      });
    });

    it('shows filename in error message', async () => {
      render(<MultiImageUpload maxSizeMB={1} />);

      const input = document.querySelector('input[type="file"]');
      const file = createMockFile('my-photo.jpg', 2 * 1024 * 1024, 'image/jpeg');

      if (input) {
        fireEvent.change(input, { target: { files: [file] } });
      }

      await waitFor(() => {
        expect(screen.getByText(/my-photo\.jpg/i)).toBeInTheDocument();
      });
    });

    it('validates each file individually', async () => {
      render(<MultiImageUpload maxSizeMB={1} />);

      const input = document.querySelector('input[type="file"]');
      const files = [
        createMockFile('valid.jpg', 500 * 1024, 'image/jpeg'), // 500KB - valid
        createMockFile('invalid.jpg', 2 * 1024 * 1024, 'image/jpeg'), // 2MB - invalid
      ];

      if (input) {
        fireEvent.change(input, { target: { files } });
      }

      await waitFor(() => {
        // Should show error for invalid file
        expect(screen.getByText(/invalid\.jpg/i)).toBeInTheDocument();
      });
    });
  });

  describe('Remove Image', () => {
    it('removes image when remove button clicked', async () => {
      const onChange = vi.fn();
      const { user } = render(
        <MultiImageUpload
          value={[
            'https://example.com/image1.jpg',
            'https://example.com/image2.jpg',
          ]}
          onChange={onChange}
        />
      );

      // Find and hover over image to show remove button
      const images = screen.getAllByRole('img', { name: /preview/i });
      expect(images).toHaveLength(2);

      // Get the remove buttons (they become visible on hover)
      const removeButtons = document.querySelectorAll('button[class*="destructive"]');
      expect(removeButtons.length).toBeGreaterThan(0);

      await user.click(removeButtons[0] as HTMLElement);

      expect(onChange).toHaveBeenCalledWith(['https://example.com/image2.jpg']);
    });

    it('revokes blob URL when removing uploaded image', async () => {
      const { user } = render(<MultiImageUpload />);

      const input = document.querySelector('input[type="file"]');
      const file = createMockFile('photo.jpg', 1024, 'image/jpeg');

      if (input) {
        fireEvent.change(input, { target: { files: [file] } });
      }

      await waitFor(() => {
        const images = screen.getAllByRole('img', { name: /preview/i });
        expect(images).toHaveLength(1);
      });

      const removeButtons = document.querySelectorAll('button[class*="destructive"]');
      await user.click(removeButtons[0] as HTMLElement);

      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });
  });

  describe('Upload Process', () => {
    it('calls onUpload with files', async () => {
      const onUpload = vi.fn().mockResolvedValue(['https://example.com/uploaded.jpg']);
      render(<MultiImageUpload onUpload={onUpload} />);

      const input = document.querySelector('input[type="file"]');
      const file = createMockFile('photo.jpg', 1024, 'image/jpeg');

      if (input) {
        fireEvent.change(input, { target: { files: [file] } });
      }

      await waitFor(() => {
        expect(onUpload).toHaveBeenCalledWith([expect.any(File)]);
      });
    });

    it('shows uploading state during upload', async () => {
      const onUpload = vi.fn(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(['https://example.com/uploaded.jpg']), 500);
          })
      );
      render(<MultiImageUpload onUpload={onUpload} />);

      const input = document.querySelector('input[type="file"]');
      const file = createMockFile('photo.jpg', 1024, 'image/jpeg');

      if (input) {
        fireEvent.change(input, { target: { files: [file] } });
      }

      await waitFor(() => {
        const loadingIndicators = document.querySelectorAll('.animate-spin');
        expect(loadingIndicators.length).toBeGreaterThan(0);
      });
    });

    it('shows batch progress during multi-file upload', async () => {
      const onUpload = vi.fn(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve([
                  'https://example.com/1.jpg',
                  'https://example.com/2.jpg',
                ]),
              500
            );
          })
      );
      render(<MultiImageUpload onUpload={onUpload} />);

      const input = document.querySelector('input[type="file"]');
      const files = [
        createMockFile('photo1.jpg', 1024, 'image/jpeg'),
        createMockFile('photo2.jpg', 1024, 'image/jpeg'),
      ];

      if (input) {
        fireEvent.change(input, { target: { files } });
      }

      await waitFor(() => {
        expect(
          screen.getByText(/uploading/i) || document.querySelector('.animate-spin')
        ).toBeTruthy();
      });
    });

    it('updates onChange with uploaded URLs on success', async () => {
      const onChange = vi.fn();
      const onUpload = vi.fn().mockResolvedValue(['https://example.com/uploaded.jpg']);
      render(<MultiImageUpload onChange={onChange} onUpload={onUpload} />);

      const input = document.querySelector('input[type="file"]');
      const file = createMockFile('photo.jpg', 1024, 'image/jpeg');

      if (input) {
        fireEvent.change(input, { target: { files: [file] } });
      }

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(['https://example.com/uploaded.jpg']);
      });
    });

    it('shows error state on upload failure', async () => {
      const onUpload = vi.fn().mockRejectedValue(new Error('Upload failed'));
      render(<MultiImageUpload onUpload={onUpload} />);

      const input = document.querySelector('input[type="file"]');
      const file = createMockFile('photo.jpg', 1024, 'image/jpeg');

      if (input) {
        fireEvent.change(input, { target: { files: [file] } });
      }

      await waitFor(() => {
        // Should show error indicator
        const errorIndicator = document.querySelector('[class*="destructive"]');
        expect(errorIndicator).toBeInTheDocument();
      });
    });
  });

  describe('Disabled State', () => {
    it('disables dropzone when disabled prop is true', () => {
      render(<MultiImageUpload disabled />);

      const dropzone = screen.getByText(/add images/i)
        .closest('div[class*="border-dashed"]');

      expect(dropzone?.className).toContain('cursor-not-allowed');
      expect(dropzone?.className).toContain('opacity-50');
    });

    it('prevents file selection when disabled', () => {
      render(<MultiImageUpload disabled />);

      // The dropzone should show disabled styling
      const dropzone = screen.getByText(/add images/i)
        .closest('div[class*="border-dashed"]');
      expect(dropzone?.className).toContain('cursor-not-allowed');
    });

    it('hides remove buttons when disabled', async () => {
      render(
        <MultiImageUpload
          value={['https://example.com/image.jpg']}
          disabled
        />
      );

      // Remove buttons should not be present when disabled
      const removeButtons = document.querySelectorAll('button[class*="destructive"]');
      expect(removeButtons.length).toBe(0);
    });
  });

  describe('Max Files Limit', () => {
    it('hides add button when at max files', () => {
      render(
        <MultiImageUpload
          value={[
            'https://example.com/image1.jpg',
            'https://example.com/image2.jpg',
          ]}
          maxFiles={2}
        />
      );

      expect(screen.queryByText(/add more/i)).not.toBeInTheDocument();
    });

    it('shows add button when below max files', () => {
      render(
        <MultiImageUpload
          value={['https://example.com/image1.jpg']}
          maxFiles={3}
        />
      );

      expect(screen.getByText(/add more/i)).toBeInTheDocument();
    });
  });

  describe('Custom Accept Types', () => {
    it('accepts custom file types', async () => {
      const onChange = vi.fn();
      render(
        <MultiImageUpload
          onChange={onChange}
          accept={{ 'image/gif': ['.gif'] }}
        />
      );

      const input = document.querySelector('input[type="file"]');
      const file = createMockFile('animation.gif', 1024, 'image/gif');

      if (input) {
        fireEvent.change(input, { target: { files: [file] } });
      }

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(<MultiImageUpload className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('DnD Context', () => {
    it('renders sortable context', () => {
      render(
        <MultiImageUpload value={['https://example.com/image.jpg']} />
      );

      expect(screen.getByTestId('dnd-context')).toBeInTheDocument();
      expect(screen.getByTestId('sortable-context')).toBeInTheDocument();
    });
  });
});
