'use client';

import Link from 'next/link';
import { BadgeCheck } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FollowButton } from '@/components/profile/follow-button';
import { cn } from '@/lib/utils';
import type { User } from '@/types/auth';

interface UserSearchResultProps {
  user: User;
  onClick?: () => void;
  showFollowButton?: boolean;
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

export function UserSearchResult({
  user,
  onClick,
  showFollowButton = true,
  className,
}: UserSearchResultProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50',
        className
      )}
    >
      <Link
        href={`/${user.username}`}
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <Avatar className="size-10 flex-shrink-0">
          <AvatarImage src={user.avatarUrl} alt={user.fullName} />
          <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="truncate font-medium">{user.fullName}</span>
            {user.isVerified && (
              <BadgeCheck className="size-4 flex-shrink-0 fill-primary text-primary-foreground" />
            )}
          </div>
          <p className="truncate text-sm text-muted-foreground">
            @{user.username}
          </p>
          {user.followersCount !== undefined && (
            <p className="text-xs text-muted-foreground">
              {user.followersCount.toLocaleString()} followers
            </p>
          )}
        </div>
      </Link>

      {showFollowButton && (
        <FollowButton
          user={user}
          size="sm"
          className="flex-shrink-0"
        />
      )}
    </div>
  );
}

// Compact version for command menu
export function UserSearchResultCompact({
  user,
  onClick,
  className,
}: UserSearchResultProps) {
  return (
    <Link
      href={`/${user.username}`}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors',
        className
      )}
    >
      <Avatar className="size-8">
        <AvatarImage src={user.avatarUrl} alt={user.fullName} />
        <AvatarFallback className="text-xs">
          {getInitials(user.fullName)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="truncate text-sm font-medium">{user.fullName}</span>
          {user.isVerified && (
            <BadgeCheck className="size-3.5 flex-shrink-0 fill-primary text-primary-foreground" />
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          @{user.username}
        </p>
      </div>
    </Link>
  );
}
