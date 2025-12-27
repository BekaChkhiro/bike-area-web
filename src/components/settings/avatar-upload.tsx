'use client';

import { useState, useCallback } from 'react';
import { Camera, Trash2, Loader2 } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { useUploadAvatar, useDeleteAvatar } from '@/lib/api/hooks/use-user';
import { createImagePreview, blobToFile } from '@/lib/upload-utils';
import { cn } from '@/lib/utils';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  fullName: string;
  onUploadComplete?: (url: string) => void;
  onRemoveComplete?: () => void;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function AvatarUpload({
  currentAvatarUrl,
  fullName,
  onUploadComplete,
  onRemoveComplete,
  className,
}: AvatarUploadProps) {
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const uploadMutation = useUploadAvatar();
  const deleteMutation = useDeleteAvatar();


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
      const file = blobToFile(croppedBlob, 'avatar.jpg');

      try {
        const result = await uploadMutation.mutateAsync(file);
        if (result.avatarUrl) {
          onUploadComplete?.(result.avatarUrl);
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
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <div className="relative">
        <Avatar className="size-32 border-4 border-background shadow-lg">
          <AvatarImage src={currentAvatarUrl} alt={fullName} />
          <AvatarFallback className="text-3xl">
            {getInitials(fullName)}
          </AvatarFallback>
        </Avatar>

        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
            <Loader2 className="size-8 animate-spin text-white" />
          </div>
        )}

        <input
          type="file"
          id="avatar-upload"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileSelect}
          disabled={isProcessing}
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('avatar-upload')?.click()}
          disabled={isProcessing}
        >
          <Camera className="mr-2 size-4" />
          {currentAvatarUrl ? 'Change' : 'Upload'}
        </Button>

        {currentAvatarUrl && (
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

      <p className="text-xs text-muted-foreground">
        JPG, PNG or WebP. Max 5MB.
      </p>

      {/* Image Cropper */}
      {imageToCrop && (
        <ImageCropper
          open={cropperOpen}
          onOpenChange={setCropperOpen}
          imageSrc={imageToCrop}
          aspectRatio="1:1"
          cropShape="round"
          title="Crop Profile Photo"
          description="Adjust the crop area to set your profile photo."
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      {/* Remove Confirmation */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove profile photo?</AlertDialogTitle>
            <AlertDialogDescription>
              Your profile photo will be removed and replaced with your initials.
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
