'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  SkeletonCard,
  PostCardSkeleton,
  ListingCardSkeleton,
  UserCardSkeleton,
  CommentSkeleton,
  NotificationSkeleton,
} from './skeleton-card';

interface SkeletonListProps {
  count?: number;
  className?: string;
  itemClassName?: string;
}

// Generic list skeleton
export function SkeletonList({
  count = 5,
  className,
  itemClassName,
}: SkeletonListProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn('flex items-center gap-4 p-4 rounded-xl bg-card/50', itemClassName)}>
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Post feed skeleton
export function PostFeedSkeleton({
  count = 3,
  className,
}: SkeletonListProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Create post card */}
      <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
        <div className="flex gap-4">
          <Skeleton className="h-11 w-11 rounded-full" />
          <Skeleton className="h-11 flex-1 rounded-full" />
        </div>
      </div>

      {/* Post cards */}
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Grid skeleton (for marketplace, gallery, etc.)
interface GridSkeletonProps extends SkeletonListProps {
  columns?: 2 | 3 | 4;
  variant?: 'card' | 'listing' | 'square';
}

export function GridSkeleton({
  count = 6,
  columns = 3,
  variant = 'card',
  className,
}: GridSkeletonProps) {
  const gridClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridClasses[columns], className)}>
      {Array.from({ length: count }).map((_, i) => {
        if (variant === 'listing') {
          return <ListingCardSkeleton key={i} />;
        }
        if (variant === 'square') {
          return <Skeleton key={i} className="aspect-square rounded-xl" />;
        }
        return <SkeletonCard key={i} />;
      })}
    </div>
  );
}

// User list skeleton
export function UserListSkeleton({
  count = 5,
  className,
}: SkeletonListProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <UserCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Comment list skeleton
export function CommentListSkeleton({
  count = 3,
  className,
}: SkeletonListProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <CommentSkeleton key={i} />
      ))}
    </div>
  );
}

// Notification list skeleton
export function NotificationListSkeleton({
  count = 5,
  className,
}: SkeletonListProps) {
  return (
    <div className={cn('divide-y', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <NotificationSkeleton key={i} />
      ))}
    </div>
  );
}

// Table skeleton
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
}: TableSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex gap-4 border-b pb-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Message list skeleton
export function MessageListSkeleton({
  count = 5,
  className,
}: SkeletonListProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'flex items-center gap-4 rounded-xl p-4',
            i === 0 && 'bg-muted/50'
          )}
        >
          <Skeleton className="h-12 w-12 rounded-full shrink-0" />
          <div className="flex-1 min-w-0 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
