'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface PageLoadingProps {
  className?: string;
  variant?: 'feed' | 'profile' | 'list' | 'detail' | 'form';
}

export function PageLoading({ className, variant = 'feed' }: PageLoadingProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {variant === 'feed' && <FeedSkeleton />}
      {variant === 'profile' && <ProfileSkeleton />}
      {variant === 'list' && <ListSkeleton />}
      {variant === 'detail' && <DetailSkeleton />}
      {variant === 'form' && <FormSkeleton />}
    </div>
  );
}

// Feed skeleton (posts)
function FeedSkeleton() {
  return (
    <>
      {/* Create post card */}
      <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
        <div className="flex gap-4">
          <Skeleton className="h-11 w-11 rounded-full" />
          <Skeleton className="h-11 flex-1 rounded-full" />
        </div>
      </div>

      {/* Post cards */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/50 bg-card p-6 space-y-5 shadow-sm">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>

          {/* Image */}
          {i % 2 === 0 && <Skeleton className="h-64 w-full rounded-xl" />}

          {/* Actions */}
          <div className="flex gap-4 pt-1">
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-9 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </>
  );
}

// Profile skeleton
function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Cover and avatar */}
      <div className="relative">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="absolute -bottom-16 left-6 h-32 w-32 rounded-full border-4 border-background shadow-lg" />
      </div>

      {/* Profile info */}
      <div className="mt-20 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2.5">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-11 w-28 rounded-lg" />
        </div>

        <Skeleton className="h-4 w-full max-w-lg" />
        <Skeleton className="h-4 w-3/4 max-w-md" />

        <div className="flex gap-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border/40 pb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-lg" />
        ))}
      </div>

      {/* Content */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// List skeleton (marketplace, forum, etc.)
function ListSkeleton() {
  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-28 rounded-full" />
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
            <Skeleton className="aspect-video w-full" />
            <div className="p-5 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-6 w-28 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// Detail skeleton (single item view)
function DetailSkeleton() {
  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Main content */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image */}
        <Skeleton className="aspect-square rounded-2xl" />

        {/* Details */}
        <div className="space-y-5">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-32" />
          <div className="space-y-2.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-11 flex-1 rounded-lg" />
            <Skeleton className="h-11 w-11 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="space-y-5">
        <Skeleton className="h-6 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="flex-1 space-y-2.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Form skeleton
function FormSkeleton() {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <Skeleton className="h-8 w-48" />

      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      ))}

      <div className="space-y-2.5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>

      <div className="flex gap-4 justify-end pt-2">
        <Skeleton className="h-11 w-28 rounded-lg" />
        <Skeleton className="h-11 w-28 rounded-lg" />
      </div>
    </div>
  );
}
