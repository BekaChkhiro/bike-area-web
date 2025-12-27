'use client';

import Link from 'next/link';
import { BadgeCheck } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FollowButton } from './follow-button';
import { cn } from '@/lib/utils';
import type { User } from '@/types/auth';

interface UserCardProps {
  user: User;
  currentUserId?: string;
  showBio?: boolean;
  showFollowButton?: boolean;
  mutualFollowers?: User[];
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

export function UserCard({
  user,
  currentUserId,
  showBio = true,
  showFollowButton = true,
  mutualFollowers,
  className,
}: UserCardProps) {
  const isOwnProfile = currentUserId === user.id;

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50',
        className
      )}
    >
      <Link href={`/${user.username}`} className="shrink-0">
        <Avatar className="size-12">
          <AvatarImage src={user.avatarUrl} alt={user.fullName} />
          <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
        </Avatar>
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <Link
            href={`/${user.username}`}
            className="truncate font-semibold hover:underline"
          >
            {user.fullName}
          </Link>
          {user.isVerified && (
            <BadgeCheck className="size-4 shrink-0 text-primary" />
          )}
        </div>

        <Link
          href={`/${user.username}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          @{user.username}
        </Link>

        {showBio && user.bio && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {user.bio}
          </p>
        )}

        {mutualFollowers && mutualFollowers.length > 0 && (
          <MutualFollowersIndicator mutualFollowers={mutualFollowers} />
        )}
      </div>

      {showFollowButton && !isOwnProfile && (
        <FollowButton
          user={user}
          currentUserId={currentUserId}
          size="sm"
          className="shrink-0"
        />
      )}
    </div>
  );
}

interface MutualFollowersIndicatorProps {
  mutualFollowers: User[];
}

function MutualFollowersIndicator({
  mutualFollowers,
}: MutualFollowersIndicatorProps) {
  if (mutualFollowers.length === 0) return null;

  const first = mutualFollowers[0];
  const second = mutualFollowers[1];
  const remainingCount = mutualFollowers.length - Math.min(mutualFollowers.length, 2);

  if (!first) return null;

  const getText = () => {
    if (!second) {
      return (
        <>
          Followed by{' '}
          <Link
            href={`/${first.username}`}
            className="font-medium hover:underline"
          >
            {first.fullName}
          </Link>
          {remainingCount > 0 && (
            <> and {remainingCount} other{remainingCount > 1 ? 's' : ''} you follow</>
          )}
        </>
      );
    }

    return (
      <>
        Followed by{' '}
        <Link
          href={`/${first.username}`}
          className="font-medium hover:underline"
        >
          {first.fullName}
        </Link>
        {', '}
        <Link
          href={`/${second.username}`}
          className="font-medium hover:underline"
        >
          {second.fullName}
        </Link>
        {remainingCount > 0 && (
          <> and {remainingCount} other{remainingCount > 1 ? 's' : ''} you follow</>
        )}
      </>
    );
  };

  const displayedFollowers = [first, second].filter(Boolean) as User[];

  return (
    <div className="mt-1.5 flex items-center gap-1.5">
      <div className="flex -space-x-1.5">
        {displayedFollowers.map((follower) => (
          <Avatar key={follower.id} className="size-4 border border-background">
            <AvatarImage src={follower.avatarUrl} alt={follower.fullName} />
            <AvatarFallback className="text-[8px]">
              {getInitials(follower.fullName)}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{getText()}</span>
    </div>
  );
}

// Skeleton for loading state
export function UserCardSkeleton() {
  return (
    <div className="flex items-start gap-3 p-3">
      <div className="size-12 shrink-0 animate-pulse rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full max-w-xs animate-pulse rounded bg-muted" />
      </div>
      <div className="h-8 w-20 shrink-0 animate-pulse rounded-md bg-muted" />
    </div>
  );
}
