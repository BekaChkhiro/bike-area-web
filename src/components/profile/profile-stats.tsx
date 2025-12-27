'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ProfileStatsProps {
  username: string;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
  className?: string;
}

function formatCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

interface StatItemProps {
  label: string;
  count: number;
  href?: string;
  onClick?: () => void;
}

function StatItem({ label, count, href, onClick }: StatItemProps) {
  const content = (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-lg font-bold tabular-nums transition-all">
        {formatCount(count)}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );

  // If onClick is provided, use a button
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="rounded-lg px-3 py-2 transition-colors hover:bg-muted"
      >
        {content}
      </button>
    );
  }

  // If href is provided, use a Link
  if (href) {
    return (
      <Link
        href={href}
        className="rounded-lg px-3 py-2 transition-colors hover:bg-muted"
      >
        {content}
      </Link>
    );
  }

  return <div className="px-3 py-2">{content}</div>;
}

export function ProfileStats({
  username,
  postsCount = 0,
  followersCount = 0,
  followingCount = 0,
  onFollowersClick,
  onFollowingClick,
  className,
}: ProfileStatsProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <StatItem label="Posts" count={postsCount} />
      <StatItem
        label="Followers"
        count={followersCount}
        onClick={onFollowersClick}
        href={onFollowersClick ? undefined : `/${username}/followers`}
      />
      <StatItem
        label="Following"
        count={followingCount}
        onClick={onFollowingClick}
        href={onFollowingClick ? undefined : `/${username}/following`}
      />
    </div>
  );
}
