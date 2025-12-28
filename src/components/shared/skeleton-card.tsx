'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  className?: string;
  showImage?: boolean;
  showAvatar?: boolean;
  imageAspect?: 'square' | 'video' | 'portrait';
  lines?: number;
}

export function SkeletonCard({
  className,
  showImage = true,
  showAvatar = false,
  imageAspect = 'video',
  lines = 2,
}: SkeletonCardProps) {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
  };

  return (
    <div className={cn('rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm', className)}>
      {/* Image skeleton */}
      {showImage && (
        <Skeleton className={cn('w-full', aspectClasses[imageAspect])} />
      )}

      <div className="p-5 space-y-4">
        {/* Avatar and title */}
        {showAvatar && (
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        )}

        {/* Title if no avatar */}
        {!showAvatar && <Skeleton className="h-5 w-3/4" />}

        {/* Content lines */}
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn('h-4', i === lines - 1 ? 'w-2/3' : 'w-full')}
          />
        ))}
      </div>
    </div>
  );
}

// Post card skeleton
export function PostCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-border/50 bg-card p-6 space-y-5 shadow-sm', className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>

      {/* Image */}
      <Skeleton className="h-64 w-full rounded-xl" />

      {/* Actions */}
      <div className="flex gap-4 pt-1">
        <Skeleton className="h-9 w-20 rounded-lg" />
        <Skeleton className="h-9 w-20 rounded-lg" />
        <Skeleton className="h-9 w-20 rounded-lg" />
        <div className="flex-1" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
    </div>
  );
}

// Marketplace listing skeleton
export function ListingCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm', className)}>
      <Skeleton className="aspect-square w-full" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-28 rounded-lg" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

// User card skeleton
export function UserCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-2xl border border-border/50 bg-card p-5 shadow-sm',
        className
      )}
    >
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-10 w-24 rounded-lg" />
    </div>
  );
}

// Comment skeleton
export function CommentSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex gap-4', className)}>
      <Skeleton className="h-9 w-9 rounded-full shrink-0" />
      <div className="flex-1 space-y-2.5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

// Notification skeleton
export function NotificationSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-start gap-4 p-5', className)}>
      <Skeleton className="h-11 w-11 rounded-full shrink-0" />
      <div className="flex-1 space-y-2.5">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}
