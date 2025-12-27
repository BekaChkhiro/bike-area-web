'use client';

import { notFound } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';

import { ProfileHeader, ProfileTabs } from '@/components/profile';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useUserByUsername, useCurrentUser } from '@/lib/api/hooks/use-user';

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  // Unwrap params in Next.js 15+
  const resolvedParams = params as unknown as { username: string };
  const username = resolvedParams.username;

  const { data: currentUser } = useCurrentUser();
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useUserByUsername(username);

  if (isLoading) {
    return <ProfilePageSkeleton />;
  }

  if (isError) {
    // Check if it's a 404
    const apiError = error as { status?: number };
    if (apiError?.status === 404) {
      notFound();
    }

    return <ProfileErrorState error={error} />;
  }

  if (!user) {
    notFound();
  }

  const isOwnProfile = currentUser?.id === user.id;

  // Check if profile is blocked (by user or by current user)
  // This would be indicated by the API response
  // For now, we assume the API handles this

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <ProfileHeader
          user={user}
          currentUserId={currentUser?.id}
          isOwnProfile={isOwnProfile}
        />
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <ProfileTabs user={user} />
        </CardContent>
      </Card>
    </div>
  );
}

function ProfilePageSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        {/* Cover skeleton */}
        <Skeleton className="h-32 w-full sm:h-48 lg:h-56" />

        <div className="relative px-4 pb-4 sm:px-6">
          {/* Avatar skeleton */}
          <div className="-mt-16 mb-4 sm:-mt-20">
            <Skeleton className="size-28 rounded-full sm:size-36" />
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-16 w-full max-w-md" />
              <div className="flex gap-4">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="flex gap-6">
                <Skeleton className="h-12 w-16" />
                <Skeleton className="h-12 w-16" />
                <Skeleton className="h-12 w-16" />
              </div>
            </div>

            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="size-9" />
              <Skeleton className="size-9" />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex gap-4 border-b pb-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileErrorState({ error }: { error: Error }) {
  return (
    <Card className="mx-auto max-w-md">
      <CardContent className="flex flex-col items-center py-12 text-center">
        <AlertTriangle className="mb-4 size-12 text-destructive" />
        <h2 className="mb-2 text-xl font-semibold">Something went wrong</h2>
        <p className="mb-4 text-muted-foreground">
          {error.message || 'Failed to load profile'}
        </p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </CardContent>
    </Card>
  );
}

