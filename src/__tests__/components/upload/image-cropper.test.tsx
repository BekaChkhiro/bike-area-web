import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';

import { ImageCropper } from '@/components/upload/image-cropper';
import { render } from '../../utils/test-utils';

// Mock react-easy-crop completely
vi.mock('react-easy-crop', () => ({
  default: ({ onCropComplete }: { onCropComplete: (area: unknown, pixels: unknown) => void }) => {
    // Simulate crop area being set immediately
    if (onCropComplete) {
      setTimeout(() => {
        onCropComplete(
          { x: 0, y: 0, width: 100, height: 100 },
          { x: 0, y: 0, width: 200, height: 200 }
        );
      }, 10);
    }

    return (
      <div data-testid="mock-cropper" role="img" aria-label="crop area">
        Mock Cropper
      </div>
    );
  },
}));

describe('ImageCropper', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    imageSrc: 'https://example.com/test-image.jpg',
    onCropComplete: vi.fn(),
  };

  describe('Dialog Display', () => {
    it('renders when open is true', () => {
      render(<ImageCropper {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('shows default title', () => {
      render(<ImageCropper {...defaultProps} />);

      expect(screen.getByText('Crop Image')).toBeInTheDocument();
    });

    it('shows default description', () => {
      render(<ImageCropper {...defaultProps} />);

      expect(
        screen.getByText(/adjust the crop area to select/i)
      ).toBeInTheDocument();
    });

    it('shows custom title and description', () => {
      render(
        <ImageCropper
          {...defaultProps}
          title="Edit Avatar"
          description="Crop your profile picture"
        />
      );

      expect(screen.getByText('Edit Avatar')).toBeInTheDocument();
      expect(screen.getByText('Crop your profile picture')).toBeInTheDocument();
    });

    it('renders cropper component', () => {
      render(<ImageCropper {...defaultProps} />);

      expect(screen.getByTestId('mock-cropper')).toBeInTheDocument();
    });
  });

  describe('Controls', () => {
    it('renders zoom slider', () => {
      render(<ImageCropper {...defaultProps} />);

      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('renders rotate button', () => {
      render(<ImageCropper {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /rotate/i })
      ).toBeInTheDocument();
    });

    it('can interact with rotate button', async () => {
      const { user } = render(<ImageCropper {...defaultProps} />);

      const rotateButton = screen.getByRole('button', { name: /rotate/i });

      // Should not throw when clicking rotate
      await user.click(rotateButton);
      expect(rotateButton).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('renders Cancel button', () => {
      render(<ImageCropper {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument();
    });

    it('renders Save button', () => {
      render(<ImageCropper {...defaultProps} />);

      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    it('calls onCancel and closes dialog when Cancel clicked', async () => {
      const onCancel = vi.fn();
      const onOpenChange = vi.fn();
      const { user } = render(
        <ImageCropper
          {...defaultProps}
          onCancel={onCancel}
          onOpenChange={onOpenChange}
        />
      );

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onCancel).toHaveBeenCalled();
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Aspect Ratios', () => {
    it('accepts 1:1 aspect ratio', () => {
      render(<ImageCropper {...defaultProps} aspectRatio="1:1" />);

      expect(screen.getByTestId('mock-cropper')).toBeInTheDocument();
    });

    it('accepts 16:9 aspect ratio', () => {
      render(<ImageCropper {...defaultProps} aspectRatio="16:9" />);

      expect(screen.getByTestId('mock-cropper')).toBeInTheDocument();
    });

    it('accepts 4:3 aspect ratio', () => {
      render(<ImageCropper {...defaultProps} aspectRatio="4:3" />);

      expect(screen.getByTestId('mock-cropper')).toBeInTheDocument();
    });

    it('accepts free aspect ratio', () => {
      render(<ImageCropper {...defaultProps} aspectRatio="free" />);

      expect(screen.getByTestId('mock-cropper')).toBeInTheDocument();
    });
  });

  describe('Crop Shapes', () => {
    it('accepts rect crop shape', () => {
      render(<ImageCropper {...defaultProps} cropShape="rect" />);

      expect(screen.getByTestId('mock-cropper')).toBeInTheDocument();
    });

    it('accepts round crop shape', () => {
      render(<ImageCropper {...defaultProps} cropShape="round" />);

      expect(screen.getByTestId('mock-cropper')).toBeInTheDocument();
    });
  });

  describe('Dialog State', () => {
    it('does not render when open is false', () => {
      render(<ImageCropper {...defaultProps} open={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('calls onOpenChange when Cancel clicked', async () => {
      const onOpenChange = vi.fn();
      const { user } = render(
        <ImageCropper {...defaultProps} onOpenChange={onOpenChange} />
      );

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
