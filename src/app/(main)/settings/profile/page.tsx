'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AvatarUpload } from '@/components/settings/avatar-upload';
import { CoverUpload } from '@/components/settings/cover-upload';
import { ProfileForm } from '@/components/settings/profile-form';
import { useCurrentUser } from '@/lib/api/hooks/use-user';

export default function EditProfilePage() {
  const { data: user, isLoading, isError } = useCurrentUser();

  if (isLoading) {
    return <EditProfileSkeleton />;
  }

  if (isError || !user) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Failed to load profile data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cover Photo */}
      <Card>
        <CardHeader>
          <CardTitle>Cover Photo</CardTitle>
          <CardDescription>
            This image will be displayed at the top of your profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CoverUpload currentCoverUrl={user.coverUrl} />
        </CardContent>
      </Card>

      {/* Profile Photo */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
          <CardDescription>
            Your profile photo is visible to everyone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AvatarUpload
            currentAvatarUrl={user.avatarUrl}
            fullName={user.fullName}
          />
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your profile information. This will be visible to other
            users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={user} />
        </CardContent>
      </Card>
    </div>
  );
}

function EditProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Cover Photo Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="aspect-[3/1] w-full rounded-lg" />
          <div className="mt-4 flex justify-end gap-2">
            <Skeleton className="h-9 w-24" />
          </div>
        </CardContent>
      </Card>

      {/* Profile Photo Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Skeleton className="size-32 rounded-full" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </CardContent>
      </Card>

      {/* Profile Form Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-20" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
