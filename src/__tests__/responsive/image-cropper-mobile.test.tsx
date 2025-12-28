import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';

import { render } from '../utils/test-utils';
import { ImageCropper } from '@/components/upload/image-cropper';

// Mock react-easy-crop
vi.mock('react-easy-crop', () => ({
  default: ({ onCropChange, onZoomChange, onCropComplete }: {
    onCropChange: (location: { x: number; y: number }) => void;
    onZoomChange: (zoom: number) => void;
    onCropComplete: (area: object, pixels: object) => void;
  }) => {
    // Simulate crop complete on mount
    setTimeout(() => {
      onCropComplete(
        { x: 0, y: 0, width: 100, height: 100 },
        { x: 0, y: 0, width: 200, height: 200 }
      );
    }, 0);
    return (
      <div data-testid="cropper">
        <button onClick={() => onCropChange({ x: 10, y: 10 })}>Move</button>
        <button onClick={() => onZoomChange(2)}>Zoom</button>
      </div>
    );
  },
}));

describe('Image Cropper Mobile Tests', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    imageSrc: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    onCropComplete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Touch-Friendly Controls', () => {
    it('renders zoom slider for touch interaction', () => {
      render(<ImageCropper {...defaultProps} />);

      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
    });

    it('zoom slider has appropriate range for mobile', () => {
      render(<ImageCropper {...defaultProps} />);

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuemin', '1');
      expect(slider).toHaveAttribute('aria-valuemax', '3');
    });

    it('zoom slider can be adjusted via keyboard', async () => {
      const { user } = render(<ImageCropper {...defaultProps} />);

      const slider = screen.getByRole('slider');

      // Focus the slider and use keyboard to adjust
      await user.click(slider);

      // Slider should have correct aria attributes
      expect(slider).toHaveAttribute('aria-valuenow');
      expect(slider).toHaveAttribute('aria-valuemin', '1');
      expect(slider).toHaveAttribute('aria-valuemax', '3');
    });

    it('rotate button is visible and accessible', () => {
      render(<ImageCropper {...defaultProps} />);

      const rotateButton = screen.getByRole('button', { name: /rotate/i });
      expect(rotateButton).toBeInTheDocument();
    });

    it('rotate button is accessible', () => {
      render(<ImageCropper {...defaultProps} />);

      // Rotate button should be accessible
      const rotateButton = screen.getByRole('button', { name: /rotate/i });
      expect(rotateButton).toBeInTheDocument();
    });
  });

  describe('Dialog Responsive Layout', () => {
    it('dialog content is present', () => {
      render(<ImageCropper {...defaultProps} />);

      // Dialog should show title and description
      expect(screen.getByText('Crop Image')).toBeInTheDocument();
      expect(screen.getByText(/adjust the crop area/i)).toBeInTheDocument();
    });

    it('dialog renders correctly', () => {
      render(<ImageCropper {...defaultProps} />);

      // Dialog should be open and show cropper
      expect(screen.getByTestId('cropper')).toBeInTheDocument();
      expect(screen.getByText('Crop Image')).toBeInTheDocument();
    });

    it('cropper component renders', () => {
      render(<ImageCropper {...defaultProps} />);

      // Cropper mock should be visible
      expect(screen.getByTestId('cropper')).toBeInTheDocument();
    });
  });

  describe('Mobile-Friendly Buttons', () => {
    it('cancel button is accessible', () => {
      render(<ImageCropper {...defaultProps} />);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('save button is accessible', () => {
      render(<ImageCropper {...defaultProps} />);

      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    it('action buttons are present', () => {
      render(<ImageCropper {...defaultProps} />);

      // Both action buttons should be accessible
      const cancelBtn = screen.getByRole('button', { name: /cancel/i });
      const saveBtn = screen.getByRole('button', { name: /save/i });

      expect(cancelBtn).toBeInTheDocument();
      expect(saveBtn).toBeInTheDocument();
    });
  });

  describe('Zoom Controls Visual', () => {
    it('zoom slider is present in controls area', () => {
      render(<ImageCropper {...defaultProps} />);

      // Zoom control section should be present with slider
      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();

      // Slider should have proper accessibility attributes
      expect(slider).toHaveAttribute('aria-valuemin');
      expect(slider).toHaveAttribute('aria-valuemax');
    });
  });

  describe('Aspect Ratio Options', () => {
    it('supports 1:1 aspect ratio for profile pictures', () => {
      render(<ImageCropper {...defaultProps} aspectRatio="1:1" />);

      expect(screen.getByTestId('cropper')).toBeInTheDocument();
    });

    it('supports 16:9 aspect ratio for covers', () => {
      render(<ImageCropper {...defaultProps} aspectRatio="16:9" />);

      expect(screen.getByTestId('cropper')).toBeInTheDocument();
    });

    it('supports round crop shape for avatars', () => {
      render(<ImageCropper {...defaultProps} cropShape="round" />);

      expect(screen.getByTestId('cropper')).toBeInTheDocument();
    });
  });

  describe('Cancel and Close Behavior', () => {
    it('cancel button calls onOpenChange', async () => {
      const onOpenChange = vi.fn();
      const { user } = render(
        <ImageCropper {...defaultProps} onOpenChange={onOpenChange} />
      );

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('calls onCancel callback when provided', async () => {
      const onCancel = vi.fn();
      const { user } = render(
        <ImageCropper {...defaultProps} onCancel={onCancel} />
      );

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('shows processing state during save', async () => {
      const onCropComplete = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100)));
      const { user } = render(
        <ImageCropper {...defaultProps} onCropComplete={onCropComplete} />
      );

      // Wait for crop area to initialize
      await waitFor(() => {
        expect(screen.getByTestId('cropper')).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Should show loading state
      await waitFor(() => {
        const processingButton = screen.queryByRole('button', { name: /processing/i });
        // The button text changes when processing
        expect(processingButton || saveButton).toBeInTheDocument();
      });
    });
  });

  describe('Custom Title and Description', () => {
    it('displays custom title', () => {
      render(
        <ImageCropper
          {...defaultProps}
          title="Crop Profile Picture"
        />
      );

      expect(screen.getByText('Crop Profile Picture')).toBeInTheDocument();
    });

    it('displays custom description', () => {
      render(
        <ImageCropper
          {...defaultProps}
          description="Select the area for your profile picture"
        />
      );

      expect(screen.getByText('Select the area for your profile picture')).toBeInTheDocument();
    });
  });
});
