'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Camera, Trash2, Loader2, ImageIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ImageCropper } from '@/components/upload';
import { useUploadCover, useDeleteCover } from '@/lib/api/hooks/use-user';
import { createImagePreview, blobToFile } from '@/lib/upload-utils';
import { cn } from '@/lib/utils';

interface CoverUploadProps {
  currentCoverUrl?: string;
  onUploadComplete?: (url: string) => void;
  onRemoveComplete?: () => void;
  className?: string;
}

export function CoverUpload({
  currentCoverUrl,
  onUploadComplete,
  onRemoveComplete,
  className,
}: CoverUploadProps) {
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const uploadMutation = useUploadCover();
  const deleteMutation = useDeleteCover();

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview and open cropper
    const previewUrl = createImagePreview(file);
    setImageToCrop(previewUrl);
    setCropperOpen(true);

    // Reset input
    e.target.value = '';
  }, []);

  const handleCropComplete = useCallback(
    async (croppedBlob: Blob) => {
      // Clean up preview
      if (imageToCrop) {
        URL.revokeObjectURL(imageToCrop);
      }
      setImageToCrop(null);

      // Convert blob to file
      const file = blobToFile(croppedBlob, 'cover.jpg');

      try {
        const result = await uploadMutation.mutateAsync(file);
        if (result.coverUrl) {
          onUploadComplete?.(result.coverUrl);
        }
      } catch {
        // Error handled by mutation
      }
    },
    [imageToCrop, uploadMutation, onUploadComplete]
  );

  const handleCropCancel = useCallback(() => {
    if (imageToCrop) {
      URL.revokeObjectURL(imageToCrop);
    }
    setImageToCrop(null);
  }, [imageToCrop]);

  const handleRemove = async () => {
    try {
      await deleteMutation.mutateAsync();
      onRemoveComplete?.();
      setShowRemoveDialog(false);
    } catch {
      // Error handled by mutation
    }
  };

  const isProcessing = uploadMutation.isPending || deleteMutation.isPending;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="relative aspect-[3/1] w-full overflow-hidden rounded-lg border bg-muted">
        {currentCoverUrl ? (
          <Image
            src={currentCoverUrl}
            alt="Cover photo"
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageIcon className="size-12" />
            <span className="text-sm">No cover photo</span>
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="size-8 animate-spin text-white" />
          </div>
        )}

        <input
          type="file"
          id="cover-upload"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileSelect}
          disabled={isProcessing}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Recommended: 1500x500 pixels. JPG, PNG or WebP. Max 10MB.
        </p>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('cover-upload')?.click()}
            disabled={isProcessing}
          >
            <Camera className="mr-2 size-4" />
            {currentCoverUrl ? 'Change' : 'Upload'}
          </Button>

          {currentCoverUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowRemoveDialog(true)}
              disabled={isProcessing}
            >
              <Trash2 className="mr-2 size-4" />
              Remove
            </Button>
          )}
        </div>
      </div>

      {/* Image Cropper */}
      {imageToCrop && (
        <ImageCropper
          open={cropperOpen}
          onOpenChange={setCropperOpen}
          imageSrc={imageToCrop}
          aspectRatio="3:1"
          cropShape="rect"
          title="Crop Cover Photo"
          description="Adjust the crop area to set your cover photo."
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      {/* Remove Confirmation */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove cover photo?</AlertDialogTitle>
            <AlertDialogDescription>
              Your cover photo will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
