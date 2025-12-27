'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { useFollowUser, useUnfollowUser } from '@/lib/api/hooks/use-user';
import { QUERY_KEYS } from '@/lib/api/endpoints';
import { cn } from '@/lib/utils';
import type { User } from '@/types/auth';

interface FollowButtonProps {
  user: User;
  currentUserId?: string;
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function FollowButton({
  user,
  currentUserId,
  size = 'default',
  className,
}: FollowButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const queryClient = useQueryClient();

  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const isLoading = followMutation.isPending || unfollowMutation.isPending;
  const isFollowing = user.isFollowing;
  const isFollowedBy = user.isFollowedBy;

  // Don't show button if viewing own profile
  if (currentUserId === user.id) {
    return null;
  }

  const handleClick = async () => {
    // Optimistic update
    const previousUser = queryClient.getQueryData<User>(
      QUERY_KEYS.userByUsername(user.username)
    );

    queryClient.setQueryData(QUERY_KEYS.userByUsername(user.username), {
      ...user,
      isFollowing: !isFollowing,
      followersCount: isFollowing
        ? (user.followersCount ?? 0) - 1
        : (user.followersCount ?? 0) + 1,
    });

    try {
      if (isFollowing) {
        await unfollowMutation.mutateAsync(user.id);
      } else {
        await followMutation.mutateAsync(user.id);
      }
    } catch {
      // Rollback on error
      if (previousUser) {
        queryClient.setQueryData(
          QUERY_KEYS.userByUsername(user.username),
          previousUser
        );
      }
    }
  };

  const getButtonText = () => {
    if (isFollowing) {
      return isHovered ? 'Unfollow' : 'Following';
    }
    if (isFollowedBy) {
      return 'Follow Back';
    }
    return 'Follow';
  };

  const getButtonVariant = () => {
    if (isFollowing) {
      return isHovered ? 'destructive' : 'outline';
    }
    return 'default';
  };

  return (
    <Button
      variant={getButtonVariant()}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn('min-w-[100px] transition-all', className)}
    >
      {isLoading ? (
        <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        getButtonText()
      )}
    </Button>
  );
}
