'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, MessageCircle, BadgeCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Post } from '@/types/search';

interface PostSearchResultProps {
  post: Post;
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

function truncateContent(content: string, maxLength: number = 150): string {
  if (content.length <= maxLength) return content;
  return content.slice(0, maxLength).trim() + '...';
}

export function PostSearchResult({
  post,
  onClick,
  className,
}: PostSearchResultProps) {
  const firstImage = post.images?.[0];
  const hasImages = !!firstImage;
  const imageCount = post.images?.length ?? 0;

  return (
    <Link
      href={`/posts/${post.id}`}
      onClick={onClick}
      className={cn(
        'block rounded-lg p-3 transition-colors hover:bg-muted/50',
        className
      )}
    >
      {/* Author Info */}
      <div className="mb-2 flex items-center gap-2">
        <Avatar className="size-8">
          <AvatarImage src={post.author.avatarUrl} alt={post.author.fullName} />
          <AvatarFallback className="text-xs">
            {getInitials(post.author.fullName)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="truncate text-sm font-medium">
              {post.author.fullName}
            </span>
            {post.author.isVerified && (
              <BadgeCheck className="size-3.5 flex-shrink-0 fill-primary text-primary-foreground" />
            )}
            <span className="text-xs text-muted-foreground">
              @{post.author.username}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-3">
        <div className="min-w-0 flex-1">
          <p className="whitespace-pre-wrap text-sm">
            {truncateContent(post.content)}
          </p>

          {/* Stats */}
          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="size-3.5" />
              {post.likesCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="size-3.5" />
              {post.commentsCount}
            </span>
          </div>
        </div>

        {/* Image Thumbnail */}
        {hasImages && firstImage && (
          <div className="relative size-16 flex-shrink-0 overflow-hidden rounded-md">
            <Image
              src={firstImage}
              alt="Post image"
              fill
              className="object-cover"
            />
            {imageCount > 1 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-medium text-white">
                +{imageCount - 1}
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

// Compact version for command menu
export function PostSearchResultCompact({
  post,
  onClick,
  className,
}: PostSearchResultProps) {
  return (
    <Link
      href={`/posts/${post.id}`}
      onClick={onClick}
      className={cn(
        'flex items-start gap-2 rounded-md px-2 py-1.5 transition-colors',
        className
      )}
    >
      <Avatar className="size-6 flex-shrink-0">
        <AvatarImage src={post.author.avatarUrl} alt={post.author.fullName} />
        <AvatarFallback className="text-[10px]">
          {getInitials(post.author.fullName)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{truncateContent(post.content, 80)}</p>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{post.author.username}</span>
          <span className="flex items-center gap-0.5">
            <Heart className="size-3" />
            {post.likesCount}
          </span>
        </div>
      </div>
    </Link>
  );
}
