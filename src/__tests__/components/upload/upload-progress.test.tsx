import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';

import { UploadProgress, BatchUploadProgress } from '@/components/upload/upload-progress';
import { render } from '../../utils/test-utils';

describe('UploadProgress', () => {
  describe('Status Display', () => {
    it('renders nothing when status is idle', () => {
      const { container } = render(
        <UploadProgress progress={0} status="idle" />
      );

      expect(container.firstChild).toBeNull();
    });

    it('shows uploading state with progress', () => {
      render(
        <UploadProgress progress={45} status="uploading" fileName="photo.jpg" />
      );

      expect(screen.getByText('photo.jpg')).toBeInTheDocument();
      expect(screen.getByText('45% uploaded')).toBeInTheDocument();
    });

    it('shows success state', () => {
      render(<UploadProgress progress={100} status="success" />);

      expect(screen.getByText('Upload complete')).toBeInTheDocument();
    });

    it('shows error state with message', () => {
      render(
        <UploadProgress
          progress={0}
          status="error"
          error="File size too large"
        />
      );

      expect(screen.getByText('File size too large')).toBeInTheDocument();
    });

    it('shows default error message when error is not provided', () => {
      render(<UploadProgress progress={0} status="error" />);

      expect(screen.getByText('Upload failed')).toBeInTheDocument();
    });
  });

  describe('Progress Bar', () => {
    it('displays progress bar during upload', () => {
      render(<UploadProgress progress={60} status="uploading" />);

      const progressBar = document.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('does not show progress bar on success', () => {
      render(<UploadProgress progress={100} status="success" />);

      const progressBar = document.querySelector('[role="progressbar"]');
      expect(progressBar).not.toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('shows cancel button during upload when onCancel provided', () => {
      const onCancel = vi.fn();

      render(
        <UploadProgress progress={50} status="uploading" onCancel={onCancel} />
      );

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('calls onCancel when cancel button is clicked', async () => {
      const onCancel = vi.fn();
      const { user } = render(
        <UploadProgress progress={50} status="uploading" onCancel={onCancel} />
      );

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onCancel).toHaveBeenCalled();
    });

    it('shows retry button on error when onRetry provided', () => {
      const onRetry = vi.fn();

      render(
        <UploadProgress progress={0} status="error" onRetry={onRetry} />
      );

      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('calls onRetry when retry button is clicked', async () => {
      const onRetry = vi.fn();
      const { user } = render(
        <UploadProgress progress={0} status="error" onRetry={onRetry} />
      );

      await user.click(screen.getByRole('button', { name: /retry/i }));

      expect(onRetry).toHaveBeenCalled();
    });

    it('does not show cancel button without onCancel', () => {
      render(<UploadProgress progress={50} status="uploading" />);

      expect(
        screen.queryByRole('button', { name: /cancel/i })
      ).not.toBeInTheDocument();
    });

    it('does not show retry button without onRetry', () => {
      render(<UploadProgress progress={0} status="error" />);

      expect(
        screen.queryByRole('button', { name: /retry/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies error styling on error status', () => {
      const { container } = render(
        <UploadProgress progress={0} status="error" />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('border-destructive');
    });

    it('applies success styling on success status', () => {
      const { container } = render(
        <UploadProgress progress={100} status="success" />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('border-green');
    });

    it('accepts custom className', () => {
      const { container } = render(
        <UploadProgress
          progress={50}
          status="uploading"
          className="custom-class"
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('custom-class');
    });
  });
});

describe('BatchUploadProgress', () => {
  const createMockUploads = () => [
    { id: '1', fileName: 'photo1.jpg', progress: 100, status: 'success' as const },
    { id: '2', fileName: 'photo2.jpg', progress: 50, status: 'uploading' as const },
    { id: '3', fileName: 'photo3.jpg', progress: 0, status: 'error' as const, error: 'Failed' },
  ];

  describe('Overall Progress', () => {
    it('renders empty space when no uploads', () => {
      render(<BatchUploadProgress uploads={[]} />);

      // When there are no uploads, there should be no progress indicators
      expect(screen.queryByText(/uploading/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/uploaded/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/failed/i)).not.toBeInTheDocument();
    });

    it('shows overall progress during upload', () => {
      const uploads = [
        { id: '1', fileName: 'photo1.jpg', progress: 60, status: 'uploading' as const },
        { id: '2', fileName: 'photo2.jpg', progress: 40, status: 'uploading' as const },
      ];

      render(<BatchUploadProgress uploads={uploads} />);

      expect(screen.getByText(/uploading 2 of 2 files/i)).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('shows cancel all button when onCancelAll provided', () => {
      const uploads = [
        { id: '1', fileName: 'photo1.jpg', progress: 50, status: 'uploading' as const },
      ];

      render(
        <BatchUploadProgress uploads={uploads} onCancelAll={() => {}} />
      );

      expect(
        screen.getByRole('button', { name: /cancel all/i })
      ).toBeInTheDocument();
    });
  });

  describe('Completion Summary', () => {
    it('shows success count when uploads complete', () => {
      const uploads = [
        { id: '1', fileName: 'photo1.jpg', progress: 100, status: 'success' as const },
        { id: '2', fileName: 'photo2.jpg', progress: 100, status: 'success' as const },
      ];

      render(<BatchUploadProgress uploads={uploads} />);

      expect(screen.getByText('2 uploaded')).toBeInTheDocument();
    });

    it('shows failed count when uploads fail', () => {
      const uploads = [
        { id: '1', fileName: 'photo1.jpg', progress: 0, status: 'error' as const },
        { id: '2', fileName: 'photo2.jpg', progress: 0, status: 'error' as const },
      ];

      render(<BatchUploadProgress uploads={uploads} />);

      expect(screen.getByText('2 failed')).toBeInTheDocument();
    });

    it('shows both success and failed counts', () => {
      const uploads = [
        { id: '1', fileName: 'photo1.jpg', progress: 100, status: 'success' as const },
        { id: '2', fileName: 'photo2.jpg', progress: 0, status: 'error' as const },
      ];

      render(<BatchUploadProgress uploads={uploads} />);

      expect(screen.getByText('1 uploaded')).toBeInTheDocument();
      expect(screen.getByText('1 failed')).toBeInTheDocument();
    });
  });

  describe('Failed Upload Details', () => {
    it('shows individual failed uploads', () => {
      const uploads = [
        {
          id: '1',
          fileName: 'photo1.jpg',
          progress: 0,
          status: 'error' as const,
          error: 'Network error',
        },
      ];

      render(<BatchUploadProgress uploads={uploads} />);

      expect(screen.getByText('photo1.jpg')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    it('shows retry button for failed uploads when onRetry provided', () => {
      const uploads = [
        { id: '1', fileName: 'photo1.jpg', progress: 0, status: 'error' as const },
      ];
      const onRetry = vi.fn();

      render(<BatchUploadProgress uploads={uploads} onRetry={onRetry} />);

      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('calls onRetry with correct id when retry clicked', async () => {
      const uploads = [
        { id: 'upload-123', fileName: 'photo1.jpg', progress: 0, status: 'error' as const },
      ];
      const onRetry = vi.fn();
      const { user } = render(
        <BatchUploadProgress uploads={uploads} onRetry={onRetry} />
      );

      await user.click(screen.getByRole('button', { name: /retry/i }));

      expect(onRetry).toHaveBeenCalledWith('upload-123');
    });
  });

  describe('Mixed States', () => {
    it('handles mix of uploading, success, and error states', () => {
      const uploads = createMockUploads();

      render(<BatchUploadProgress uploads={uploads} />);

      // Should show uploading status since one is still uploading
      expect(screen.getByText(/uploading 1 of 3 files/i)).toBeInTheDocument();
    });
  });
});
