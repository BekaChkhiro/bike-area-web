'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone, type Accept } from 'react-dropzone';
import Image from 'next/image';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { validateImage, createImagePreview } from '@/lib/upload-utils';
import type { ImageValidationOptions } from '@/lib/upload-utils';
import { ImageCropper, type AspectRatio, type CropShape } from './image-cropper';
import { UploadProgress, type UploadStatus } from './upload-progress';

interface ImageUploadProps {
  value?: string | null;
  onChange?: (url: string | null) => void;
  onFileSelect?: (file: File) => void;
  onUpload?: (file: File) => Promise<string>;
  disabled?: boolean;
  maxSizeMB?: number;
  aspectRatio?: AspectRatio;
  cropShape?: CropShape;
  enableCrop?: boolean;
  showPreview?: boolean;
  placeholder?: React.ReactNode;
  className?: string;
  previewClassName?: string;
  accept?: Accept;
  validation?: ImageValidationOptions;
}

const DEFAULT_ACCEPT: Accept = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

export function ImageUpload({
  value,
  onChange,
  onFileSelect,
  onUpload,
  disabled = false,
  maxSizeMB = 10,
  aspectRatio = '1:1',
  cropShape = 'rect',
  enableCrop = false,
  showPreview = true,
  placeholder,
  className,
  previewClassName,
  accept = DEFAULT_ACCEPT,
  validation,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [fileToCrop, setFileToCrop] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Process file and handle upload
  const processFile = useCallback(
    async (file: File | Blob, fileName?: string) => {
      const fileToProcess = file instanceof File
        ? file
        : new File([file], fileName || 'image.jpg', { type: file.type });

      // Create preview
      const previewUrl = createImagePreview(fileToProcess);
      setPreview(previewUrl);

      // Notify file select
      onFileSelect?.(fileToProcess);

      // Upload if handler provided
      if (onUpload) {
        setUploadStatus('uploading');
        setUploadProgress(0);
        setUploadError(null);

        try {
          // Simulate progress updates
          const progressInterval = setInterval(() => {
            setUploadProgress((prev) => Math.min(prev + 10, 90));
          }, 200);

          const url = await onUpload(fileToProcess);

          clearInterval(progressInterval);
          setUploadProgress(100);
          setUploadStatus('success');
          onChange?.(url);
        } catch (error) {
          setUploadStatus('error');
          setUploadError(error instanceof Error ? error.message : 'Upload failed');
        }
      } else {
        // Just update value with preview URL (for form handling)
        onChange?.(previewUrl);
      }
    },
    [onChange, onFileSelect, onUpload]
  );

  // Handle initial file selection and validation
  const handleFileProcess = useCallback(
    async (file: File) => {
      // Validate file
      const validationOptions: ImageValidationOptions = {
        maxSizeBytes: maxSizeMB * 1024 * 1024,
        allowedTypes: Object.keys(accept),
        ...validation,
      };

      const result = await validateImage(file, validationOptions);
      if (!result.valid) {
        setUploadError(result.error || 'Invalid file');
        setUploadStatus('error');
        return;
      }

      setOriginalFile(file);

      if (enableCrop) {
        // Open cropper
        const previewUrl = createImagePreview(file);
        setFileToCrop(previewUrl);
        setCropperOpen(true);
      } else {
        // Use file directly
        await processFile(file);
      }
    },
    [maxSizeMB, accept, validation, enableCrop, processFile]
  );

  const handleCropComplete = useCallback(
    async (croppedBlob: Blob) => {
      // Clean up the cropper preview URL
      if (fileToCrop) {
        URL.revokeObjectURL(fileToCrop);
      }
      setFileToCrop(null);

      await processFile(croppedBlob, originalFile?.name || 'cropped.jpg');
    },
    [fileToCrop, originalFile, processFile]
  );

  const handleCropCancel = useCallback(() => {
    if (fileToCrop) {
      URL.revokeObjectURL(fileToCrop);
    }
    setFileToCrop(null);
    setOriginalFile(null);
  }, [fileToCrop]);

  const handleRemove = useCallback(() => {
    if (preview && preview !== value) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setOriginalFile(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    setUploadError(null);
    onChange?.(null);
  }, [preview, value, onChange]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        handleFileProcess(file);
      }
    },
    [handleFileProcess]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    disabled: disabled || uploadStatus === 'uploading',
    maxSize: maxSizeMB * 1024 * 1024,
    onDropRejected: (rejections) => {
      const error = rejections[0]?.errors[0];
      if (error) {
        if (error.code === 'file-too-large') {
          setUploadError(`File is too large. Maximum size is ${maxSizeMB}MB.`);
        } else if (error.code === 'file-invalid-type') {
          setUploadError('Invalid file type. Please upload an image.');
        } else {
          setUploadError(error.message);
        }
        setUploadStatus('error');
      }
    },
  });

  // Clean up preview URL on unmount
  useEffect(() => {
    const currentPreview = preview;
    const currentFileToCrop = fileToCrop;

    return () => {
      if (currentPreview && currentPreview !== value) {
        URL.revokeObjectURL(currentPreview);
      }
      if (currentFileToCrop) {
        URL.revokeObjectURL(currentFileToCrop);
      }
    };
  }, [preview, fileToCrop, value]);

  const hasPreview = showPreview && preview;

  return (
    <div className={cn('relative', className)}>
      {hasPreview ? (
        <div className={cn('relative overflow-hidden', previewClassName)}>
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-cover"
            unoptimized={preview.startsWith('blob:')}
          />
          {!disabled && uploadStatus !== 'uploading' && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2 size-8"
              onClick={handleRemove}
            >
              <X className="size-4" />
            </Button>
          )}
          {uploadStatus === 'uploading' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="flex flex-col items-center gap-2 text-white">
                <Loader2 className="size-8 animate-spin" />
                <span className="text-sm">{uploadProgress}%</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            'relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
            isDragActive && !isDragReject && 'border-primary bg-primary/5',
            isDragReject && 'border-destructive bg-destructive/5',
            !isDragActive && !isDragReject && 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
            disabled && 'cursor-not-allowed opacity-50',
            previewClassName
          )}
        >
          <input {...getInputProps()} />

          {placeholder || (
            <div className="flex flex-col items-center gap-2 text-center">
              {uploadStatus === 'uploading' ? (
                <Loader2 className="size-10 animate-spin text-muted-foreground" />
              ) : (
                <div className="rounded-full bg-muted p-3">
                  {isDragActive ? (
                    <Upload className="size-6 text-primary" />
                  ) : (
                    <ImageIcon className="size-6 text-muted-foreground" />
                  )}
                </div>
              )}

              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {isDragActive
                    ? 'Drop image here'
                    : 'Drag & drop or click to upload'}
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG or WebP (max {maxSizeMB}MB)
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Progress/Error */}
      {(uploadStatus === 'uploading' || uploadStatus === 'error') && !hasPreview && (
        <div className="mt-3">
          <UploadProgress
            progress={uploadProgress}
            status={uploadStatus}
            error={uploadError || undefined}
            onRetry={() => {
              if (originalFile) {
                handleFileProcess(originalFile);
              }
            }}
          />
        </div>
      )}

      {/* Image Cropper */}
      {enableCrop && fileToCrop && (
        <ImageCropper
          open={cropperOpen}
          onOpenChange={setCropperOpen}
          imageSrc={fileToCrop}
          aspectRatio={aspectRatio}
          cropShape={cropShape}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
