'use client';

import Link from 'next/link';
import { MessageSquare, Eye, Pin, Lock, BadgeCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ForumThread } from '@/types/search';

interface ThreadSearchResultProps {
  thread: ForumThread;
  onClick?: () => void;
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

export function ThreadSearchResult({
  thread,
  onClick,
  className,
}: ThreadSearchResultProps) {
  return (
    <Link
      href={`/forum/threads/${thread.id}`}
      onClick={onClick}
      className={cn(
        'block rounded-lg p-3 transition-colors hover:bg-muted/50',
        className
      )}
    >
      {/* Title & Status */}
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {thread.isPinned && (
              <Pin className="size-4 flex-shrink-0 text-primary" />
            )}
            {thread.isClosed && (
              <Lock className="size-4 flex-shrink-0 text-muted-foreground" />
            )}
            <h3 className="truncate font-medium">{thread.title}</h3>
          </div>

          {/* Category Badge */}
          <div className="mt-1.5">
            <Badge variant="secondary" className="text-xs">
              {thread.category.name}
            </Badge>
          </div>
        </div>
      </div>

      {/* Author & Stats */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarImage
              src={thread.author.avatarUrl}
              alt={thread.author.fullName}
            />
            <AvatarFallback className="text-[10px]">
              {getInitials(thread.author.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{thread.author.fullName}</span>
            {thread.author.isVerified && (
              <BadgeCheck className="size-3 fill-primary text-primary-foreground" />
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MessageSquare className="size-3.5" />
            {thread.repliesCount}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="size-3.5" />
            {thread.viewsCount}
          </span>
          <span>
            {formatDistanceToNow(new Date(thread.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>
    </Link>
  );
}

// Compact version for command menu
export function ThreadSearchResultCompact({
  thread,
  onClick,
  className,
}: ThreadSearchResultProps) {
  return (
    <Link
      href={`/forum/threads/${thread.id}`}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors',
        className
      )}
    >
      <div className="flex items-center gap-1">
        {thread.isPinned && (
          <Pin className="size-3 flex-shrink-0 text-primary" />
        )}
        {thread.isClosed && (
          <Lock className="size-3 flex-shrink-0 text-muted-foreground" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{thread.title}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{thread.category.name}</span>
          <span className="flex items-center gap-0.5">
            <MessageSquare className="size-3" />
            {thread.repliesCount}
          </span>
        </div>
      </div>
    </Link>
  );
}
