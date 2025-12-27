'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Users } from 'lucide-react';

import { UserCard, UserCardSkeleton } from './user-card';
import { useInfiniteFollowers, useInfiniteFollowing } from '@/lib/api/hooks/use-user';
import { cn } from '@/lib/utils';

interface FollowersListProps {
  userId: string;
  currentUserId?: string;
  type: 'followers' | 'following';
  className?: string;
}

export function FollowersList({
  userId,
  currentUserId,
  type,
  className,
}: FollowersListProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Call both hooks unconditionally to satisfy React hooks rules
  // Pass userId only when the type matches, otherwise pass undefined to disable
  const followersQuery = useInfiniteFollowers(type === 'followers' ? userId : undefined);
  const followingQuery = useInfiniteFollowing(type === 'following' ? userId : undefined);

  // Select the appropriate query based on type
  const query = type === 'followers' ? followersQuery : followingQuery;
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = query;

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  if (isLoading) {
    return (
      <div className={cn('space-y-1', className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <UserCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>Failed to load {type}</p>
      </div>
    );
  }

  const users = data?.pages.flatMap((page) => page.users) ?? [];

  if (users.length === 0) {
    return (
      <EmptyState
        type={type}
        message={
          type === 'followers'
            ? 'No followers yet'
            : 'Not following anyone yet'
        }
      />
    );
  }

  return (
    <div className={cn('space-y-1', className)}>
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          currentUserId={currentUserId}
          showBio
          showFollowButton
        />
      ))}

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="py-4">
        {isFetchingNextPage && (
          <div className="space-y-1">
            <UserCardSkeleton />
            <UserCardSkeleton />
          </div>
        )}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  type: 'followers' | 'following';
  message: string;
}

function EmptyState({ type, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Users className="mb-4 size-12 text-muted-foreground opacity-50" />
      <p className="text-lg font-medium">{message}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {type === 'followers'
          ? 'When someone follows this account, they will show up here.'
          : 'When this account follows someone, they will show up here.'}
      </p>
    </div>
  );
}
