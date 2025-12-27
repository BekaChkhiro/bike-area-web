'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useDropzone, type Accept } from 'react-dropzone';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import { X, Loader2, GripVertical, Plus, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { validateImage, createImagePreview } from '@/lib/upload-utils';
import type { ImageValidationOptions } from '@/lib/upload-utils';
import { BatchUploadProgress } from './upload-progress';
import type { UploadStatus } from './upload-progress';

interface ImageItem {
  id: string;
  file?: File;
  url: string;
  status: UploadStatus;
  progress: number;
  error?: string;
}

interface MultiImageUploadProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  onUpload?: (files: File[]) => Promise<string[]>;
  disabled?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  className?: string;
  accept?: Accept;
  validation?: ImageValidationOptions;
}

const DEFAULT_ACCEPT: Accept = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

export function MultiImageUpload({
  value = [],
  onChange,
  onUpload,
  disabled = false,
  maxFiles = 10,
  maxSizeMB = 10,
  className,
  accept = DEFAULT_ACCEPT,
  validation,
}: MultiImageUploadProps) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Track if initial value has been loaded
  const initializedRef = useRef(false);

  // Initialize from value
  useEffect(() => {
    if (value.length > 0 && !initializedRef.current) {
      const initialImages: ImageItem[] = value.map((url, index) => ({
        id: `initial-${index}`,
        url,
        status: 'success' as UploadStatus,
        progress: 100,
      }));
      setImages(initialImages);
      initializedRef.current = true;
    }
  }, [value]);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const canAddMore = images.length < maxFiles;

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        setImages((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over.id);

          const newItems = arrayMove(items, oldIndex, newIndex);

          // Update onChange with new order
          const urls = newItems
            .filter((item) => item.status === 'success')
            .map((item) => item.url);
          onChange?.(urls);

          return newItems;
        });
      }
    },
    [onChange]
  );

  const processFiles = useCallback(
    async (files: File[]) => {
      const availableSlots = maxFiles - images.length;
      const filesToProcess = files.slice(0, availableSlots);
      const newErrors: string[] = [];

      // Validate all files first
      const validatedFiles: File[] = [];
      for (const file of filesToProcess) {
        const validationOptions: ImageValidationOptions = {
          maxSizeBytes: maxSizeMB * 1024 * 1024,
          allowedTypes: Object.keys(accept),
          ...validation,
        };

        const result = await validateImage(file, validationOptions);
        if (result.valid) {
          validatedFiles.push(file);
        } else {
          newErrors.push(`${file.name}: ${result.error}`);
        }
      }

      if (newErrors.length > 0) {
        setErrors(newErrors);
      }

      if (validatedFiles.length === 0) return;

      // Create image items with previews
      const newItems: ImageItem[] = validatedFiles.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        file,
        url: createImagePreview(file),
        status: 'idle' as UploadStatus,
        progress: 0,
      }));

      setImages((prev) => [...prev, ...newItems]);

      // Start upload if handler provided
      if (onUpload) {
        setIsUploading(true);

        // Update status to uploading
        setImages((prev) =>
          prev.map((item) =>
            newItems.find((n) => n.id === item.id)
              ? { ...item, status: 'uploading' as UploadStatus }
              : item
          )
        );

        try {
          const urls = await onUpload(validatedFiles);

          // Update items with uploaded URLs
          setImages((prev) => {
            const updated = prev.map((item) => {
              const newItemIndex = newItems.findIndex((n) => n.id === item.id);
              if (newItemIndex !== -1 && urls[newItemIndex]) {
                // Revoke old preview URL
                URL.revokeObjectURL(item.url);
                return {
                  ...item,
                  url: urls[newItemIndex],
                  status: 'success' as UploadStatus,
                  progress: 100,
                };
              }
              return item;
            });

            // Notify onChange
            const successUrls = updated
              .filter((item) => item.status === 'success')
              .map((item) => item.url);
            onChange?.(successUrls);

            return updated;
          });
        } catch (error) {
          // Mark all new items as error
          setImages((prev) =>
            prev.map((item) =>
              newItems.find((n) => n.id === item.id)
                ? {
                    ...item,
                    status: 'error' as UploadStatus,
                    error: error instanceof Error ? error.message : 'Upload failed',
                  }
                : item
            )
          );
        } finally {
          setIsUploading(false);
        }
      } else {
        // No upload handler, just mark as success
        setImages((prev) => {
          const updated = prev.map((item) =>
            newItems.find((n) => n.id === item.id)
              ? { ...item, status: 'success' as UploadStatus, progress: 100 }
              : item
          );

          // Notify onChange
          const successUrls = updated
            .filter((item) => item.status === 'success')
            .map((item) => item.url);
          onChange?.(successUrls);

          return updated;
        });
      }
    },
    [images.length, maxFiles, maxSizeMB, accept, validation, onUpload, onChange]
  );

  const handleRemove = useCallback(
    (id: string) => {
      setImages((prev) => {
        const item = prev.find((i) => i.id === id);
        if (item && item.file) {
          URL.revokeObjectURL(item.url);
        }

        const updated = prev.filter((i) => i.id !== id);

        // Notify onChange
        const urls = updated
          .filter((item) => item.status === 'success')
          .map((item) => item.url);
        onChange?.(urls);

        return updated;
      });
    },
    [onChange]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setErrors([]);
      processFiles(acceptedFiles);
    },
    [processFiles]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    disabled: disabled || isUploading || !canAddMore,
    maxSize: maxSizeMB * 1024 * 1024,
    multiple: true,
    onDropRejected: (rejections) => {
      const newErrors = rejections.map((rejection) => {
        const error = rejection.errors[0];
        if (!error) {
          return `${rejection.file.name}: Unknown error`;
        }
        if (error.code === 'file-too-large') {
          return `${rejection.file.name}: File is too large. Maximum size is ${maxSizeMB}MB.`;
        } else if (error.code === 'file-invalid-type') {
          return `${rejection.file.name}: Invalid file type.`;
        }
        return `${rejection.file.name}: ${error.message}`;
      });
      setErrors(newErrors);
    },
  });

  // Keep ref of images for cleanup
  const imagesRef = useRef(images);
  imagesRef.current = images;

  // Clean up URLs on unmount
  useEffect(() => {
    return () => {
      imagesRef.current.forEach((item) => {
        if (item.file) {
          URL.revokeObjectURL(item.url);
        }
      });
    };
  }, []);

  const imageIds = useMemo(() => images.map((img) => img.id), [images]);

  return (
    <div className={cn('space-y-4', className)}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={imageIds} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {images.map((image) => (
              <SortableImageItem
                key={image.id}
                image={image}
                onRemove={handleRemove}
                disabled={disabled || isUploading}
              />
            ))}

            {/* Add More Button */}
            {canAddMore && (
              <div
                {...getRootProps()}
                className={cn(
                  'relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
                  isDragActive && !isDragReject && 'border-primary bg-primary/5',
                  isDragReject && 'border-destructive bg-destructive/5',
                  !isDragActive && !isDragReject && 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
                  (disabled || isUploading) && 'cursor-not-allowed opacity-50'
                )}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-1 text-center p-4">
                  {isUploading ? (
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  ) : (
                    <Plus className="size-6 text-muted-foreground" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {images.length === 0 ? 'Add images' : 'Add more'}
                  </span>
                  <span className="text-xs text-muted-foreground/70">
                    {images.length}/{maxFiles}
                  </span>
                </div>
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 size-4 text-destructive flex-shrink-0" />
            <div className="space-y-1 text-sm">
              {errors.map((error, index) => (
                <p key={index} className="text-destructive">
                  {error}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <BatchUploadProgress
          uploads={images
            .filter((img) => img.status === 'uploading' || img.status === 'error')
            .map((img) => ({
              id: img.id,
              fileName: img.file?.name || 'Image',
              progress: img.progress,
              status: img.status,
              error: img.error,
            }))}
        />
      )}

      {/* Helper Text */}
      <p className="text-xs text-muted-foreground">
        Drag images to reorder. JPG, PNG or WebP (max {maxSizeMB}MB each, up to {maxFiles} images)
      </p>
    </div>
  );
}

interface SortableImageItemProps {
  image: ImageItem;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

function SortableImageItem({ image, onRemove, disabled }: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative aspect-square overflow-hidden rounded-lg border bg-muted',
        isDragging && 'z-50 ring-2 ring-primary'
      )}
    >
      <Image
        src={image.url}
        alt="Upload preview"
        fill
        className="object-cover"
        unoptimized={image.url.startsWith('blob:')}
      />

      {/* Drag Handle */}
      {!disabled && image.status === 'success' && (
        <div
          {...attributes}
          {...listeners}
          className="absolute left-1 top-1 cursor-grab rounded bg-black/50 p-1 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <GripVertical className="size-4 text-white" />
        </div>
      )}

      {/* Remove Button */}
      {!disabled && (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute right-1 top-1 size-6 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={() => onRemove(image.id)}
        >
          <X className="size-3" />
        </Button>
      )}

      {/* Loading Overlay */}
      {image.status === 'uploading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="size-6 animate-spin text-white" />
        </div>
      )}

      {/* Error Overlay */}
      {image.status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-destructive/50">
          <AlertCircle className="size-6 text-white" />
        </div>
      )}
    </div>
  );
}
