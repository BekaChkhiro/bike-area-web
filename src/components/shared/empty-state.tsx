'use client';

import { type ReactNode } from 'react';
import {
  FileQuestion,
  Search,
  Users,
  MessageSquare,
  ShoppingBag,
  Bell,
  Image as ImageIcon,
  Heart,
  Bookmark,
  Mail,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  size = 'md',
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: 'min-h-[150px] p-4',
      iconWrapper: 'h-12 w-12',
      icon: 'h-6 w-6',
      title: 'text-base',
      description: 'text-sm',
    },
    md: {
      container: 'min-h-[250px] p-8',
      iconWrapper: 'h-16 w-16',
      icon: 'h-8 w-8',
      title: 'text-lg',
      description: 'text-sm',
    },
    lg: {
      container: 'min-h-[400px] p-12',
      iconWrapper: 'h-20 w-20',
      icon: 'h-10 w-10',
      title: 'text-xl',
      description: 'text-base',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizes.container,
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            'mb-5 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 shadow-sm',
            sizes.iconWrapper
          )}
        >
          <div className={cn('text-primary/70', sizes.icon)}>{icon}</div>
        </div>
      )}
      <h3 className={cn('mb-2 font-semibold tracking-tight', sizes.title)}>{title}</h3>
      {description && (
        <p
          className={cn(
            'mb-5 max-w-sm text-muted-foreground leading-relaxed',
            sizes.description
          )}
        >
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

// Pre-built empty states for common scenarios
export function NoResults({
  query,
  onClear,
}: {
  query?: string;
  onClear?: () => void;
}) {
  return (
    <EmptyState
      icon={<Search className="h-full w-full" />}
      title="No results found"
      description={
        query
          ? `No results found for "${query}". Try adjusting your search terms.`
          : 'Try adjusting your search or filters to find what you\'re looking for.'
      }
      action={
        onClear && (
          <Button variant="outline" onClick={onClear}>
            Clear search
          </Button>
        )
      }
    />
  );
}

export function NoUsers({ action }: { action?: ReactNode }) {
  return (
    <EmptyState
      icon={<Users className="h-full w-full" />}
      title="No users found"
      description="There are no users to display at the moment."
      action={action}
    />
  );
}

export function NoPosts({ action }: { action?: ReactNode }) {
  return (
    <EmptyState
      icon={<FileQuestion className="h-full w-full" />}
      title="No posts yet"
      description="Be the first to share something with the community!"
      action={action}
    />
  );
}

export function NoComments({ action }: { action?: ReactNode }) {
  return (
    <EmptyState
      icon={<MessageSquare className="h-full w-full" />}
      title="No comments yet"
      description="Start the conversation by leaving a comment."
      action={action}
      size="sm"
    />
  );
}

export function NoListings({ action }: { action?: ReactNode }) {
  return (
    <EmptyState
      icon={<ShoppingBag className="h-full w-full" />}
      title="No listings found"
      description="There are no listings matching your criteria."
      action={action}
    />
  );
}

export function NoNotifications() {
  return (
    <EmptyState
      icon={<Bell className="h-full w-full" />}
      title="No notifications"
      description="You're all caught up! Check back later for updates."
      size="sm"
    />
  );
}

export function NoImages({ action }: { action?: ReactNode }) {
  return (
    <EmptyState
      icon={<ImageIcon className="h-full w-full" />}
      title="No images"
      description="No images have been uploaded yet."
      action={action}
    />
  );
}

export function NoLikes() {
  return (
    <EmptyState
      icon={<Heart className="h-full w-full" />}
      title="No likes yet"
      description="Be the first to like this!"
      size="sm"
    />
  );
}

export function NoBookmarks({ action }: { action?: ReactNode }) {
  return (
    <EmptyState
      icon={<Bookmark className="h-full w-full" />}
      title="No bookmarks"
      description="Save posts you want to revisit later."
      action={action}
    />
  );
}

export function NoMessages({ action }: { action?: ReactNode }) {
  return (
    <EmptyState
      icon={<Mail className="h-full w-full" />}
      title="No messages"
      description="Start a conversation with someone!"
      action={action}
    />
  );
}

export function NoFollowers() {
  return (
    <EmptyState
      icon={<Users className="h-full w-full" />}
      title="No followers yet"
      description="Share your profile to get more followers."
      size="sm"
    />
  );
}

export function NoFollowing() {
  return (
    <EmptyState
      icon={<Users className="h-full w-full" />}
      title="Not following anyone"
      description="Find riders to follow and see their content in your feed."
      size="sm"
    />
  );
}
