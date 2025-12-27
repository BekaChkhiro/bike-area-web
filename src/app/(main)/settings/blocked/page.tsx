'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Ban, Search, UserX, Loader2 } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useBlockedUsers, useUnblockUser } from '@/lib/api/hooks/use-user';
import type { User } from '@/types/auth';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function BlockedUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [userToUnblock, setUserToUnblock] = useState<User | null>(null);

  const { data, isLoading } = useBlockedUsers();
  const unblockMutation = useUnblockUser();

  const blockedUsers = data?.users ?? [];

  const filteredUsers = blockedUsers.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUnblock = async () => {
    if (!userToUnblock) return;

    try {
      await unblockMutation.mutateAsync(userToUnblock.id);
      setUserToUnblock(null);
    } catch {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return <BlockedUsersSkeleton />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="size-5" />
            Blocked Users
          </CardTitle>
          <CardDescription>
            People you&apos;ve blocked won&apos;t be able to see your profile,
            posts, or send you messages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {blockedUsers.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search blocked users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          )}

          {blockedUsers.length === 0 ? (
            <EmptyState />
          ) : filteredUsers.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>No users match your search</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <BlockedUserCard
                  key={user.id}
                  user={user}
                  onUnblock={() => setUserToUnblock(user)}
                  isUnblocking={
                    unblockMutation.isPending &&
                    unblockMutation.variables === user.id
                  }
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!userToUnblock}
        onOpenChange={(open) => !open && setUserToUnblock(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Unblock @{userToUnblock?.username}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              They will be able to see your profile, follow you, and send you
              messages again. They won&apos;t be notified that you unblocked
              them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={unblockMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnblock}
              disabled={unblockMutation.isPending}
            >
              {unblockMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Unblocking...
                </>
              ) : (
                'Unblock'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface BlockedUserCardProps {
  user: User;
  onUnblock: () => void;
  isUnblocking: boolean;
}

function BlockedUserCard({ user, onUnblock, isUnblocking }: BlockedUserCardProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <Link
        href={`/${user.username}`}
        className="flex items-center gap-3 hover:opacity-80"
      >
        <Avatar>
          <AvatarImage src={user.avatarUrl} alt={user.fullName} />
          <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{user.fullName}</p>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
        </div>
      </Link>
      <Button
        variant="outline"
        size="sm"
        onClick={onUnblock}
        disabled={isUnblocking}
      >
        {isUnblocking ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          'Unblock'
        )}
      </Button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <UserX className="mb-4 size-12 text-muted-foreground opacity-50" />
      <p className="text-lg font-medium">No blocked users</p>
      <p className="mt-1 text-sm text-muted-foreground">
        When you block someone, they&apos;ll appear here
      </p>
    </div>
  );
}

function BlockedUsersSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
