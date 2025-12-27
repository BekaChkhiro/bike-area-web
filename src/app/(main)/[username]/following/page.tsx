'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FollowersList } from '@/components/profile/followers-list';
import { useUserByUsername, useCurrentUser } from '@/lib/api/hooks/use-user';

interface FollowingPageProps {
  params: Promise<{
    username: string;
  }>;
}

export default function FollowingPage({ params }: FollowingPageProps) {
  const resolvedParams = params as unknown as { username: string };
  const username = resolvedParams.username;

  const { data: currentUser } = useCurrentUser();
  const { data: user, isLoading, isError } = useUserByUsername(username);

  if (isLoading) {
    return <FollowingPageSkeleton />;
  }

  if (isError || !user) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/${username}`}>
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">{user.fullName} is Following</h1>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Following {user.followingCount ?? 0}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <FollowersList
            userId={user.id}
            currentUserId={currentUser?.id}
            type="following"
          />
        </CardContent>
      </Card>
    </div>
  );
}

function FollowingPageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-9" />
        <div className="space-y-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
