'use client';

import { X, Check, AlertCircle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface UploadProgressProps {
  progress: number;
  status: UploadStatus;
  fileName?: string;
  error?: string;
  onCancel?: () => void;
  onRetry?: () => void;
  className?: string;
}

export function UploadProgress({
  progress,
  status,
  fileName,
  error,
  onCancel,
  onRetry,
  className,
}: UploadProgressProps) {
  if (status === 'idle') {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border p-3',
        status === 'error' && 'border-destructive/50 bg-destructive/5',
        status === 'success' && 'border-green-500/50 bg-green-50 dark:bg-green-950/20',
        className
      )}
    >
      {/* Status Icon */}
      <div className="flex-shrink-0">
        {status === 'uploading' && (
          <Loader2 className="size-5 animate-spin text-primary" />
        )}
        {status === 'success' && (
          <Check className="size-5 text-green-600" />
        )}
        {status === 'error' && (
          <AlertCircle className="size-5 text-destructive" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {fileName && (
          <p className="text-sm font-medium truncate">{fileName}</p>
        )}

        {status === 'uploading' && (
          <div className="mt-1.5 space-y-1">
            <Progress value={progress} className="h-1.5" />
            <p className="text-xs text-muted-foreground">
              {progress}% uploaded
            </p>
          </div>
        )}

        {status === 'success' && (
          <p className="text-xs text-green-600">Upload complete</p>
        )}

        {status === 'error' && (
          <p className="text-xs text-destructive">
            {error || 'Upload failed'}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0">
        {status === 'uploading' && onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={onCancel}
          >
            <X className="size-4" />
            <span className="sr-only">Cancel upload</span>
          </Button>
        )}

        {status === 'error' && onRetry && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
          >
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}

interface BatchUploadProgressProps {
  uploads: Array<{
    id: string;
    fileName: string;
    progress: number;
    status: UploadStatus;
    error?: string;
  }>;
  onCancel?: (id: string) => void;
  onRetry?: (id: string) => void;
  onCancelAll?: () => void;
  className?: string;
}

export function BatchUploadProgress({
  uploads,
  onCancel: _onCancel,
  onRetry,
  onCancelAll,
  className,
}: BatchUploadProgressProps) {
  const uploading = uploads.filter((u) => u.status === 'uploading');
  const completed = uploads.filter((u) => u.status === 'success').length;
  const failed = uploads.filter((u) => u.status === 'error').length;
  const total = uploads.length;

  const overallProgress = total > 0
    ? Math.round(uploads.reduce((acc, u) => acc + u.progress, 0) / total)
    : 0;

  if (uploads.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Overall Progress */}
      {uploading.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <Loader2 className="size-5 animate-spin text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                Uploading {uploading.length} of {total} files
              </span>
              <span className="text-muted-foreground">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="mt-1.5 h-1.5" />
          </div>
          {onCancelAll && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancelAll}
            >
              Cancel All
            </Button>
          )}
        </div>
      )}

      {/* Summary when all done */}
      {uploading.length === 0 && (completed > 0 || failed > 0) && (
        <div className="flex items-center gap-2 text-sm">
          {completed > 0 && (
            <span className="flex items-center gap-1 text-green-600">
              <Check className="size-4" />
              {completed} uploaded
            </span>
          )}
          {failed > 0 && (
            <span className="flex items-center gap-1 text-destructive">
              <AlertCircle className="size-4" />
              {failed} failed
            </span>
          )}
        </div>
      )}

      {/* Individual failed uploads */}
      {failed > 0 && (
        <div className="space-y-2">
          {uploads
            .filter((u) => u.status === 'error')
            .map((upload) => (
              <UploadProgress
                key={upload.id}
                progress={upload.progress}
                status={upload.status}
                fileName={upload.fileName}
                error={upload.error}
                onRetry={onRetry ? () => onRetry(upload.id) : undefined}
              />
            ))}
        </div>
      )}
    </div>
  );
}
