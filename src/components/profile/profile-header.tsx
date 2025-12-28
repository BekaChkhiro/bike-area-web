'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { Camera, MapPin, Link as LinkIcon, Calendar, BadgeCheck } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ProfileStats } from './profile-stats';
import { ProfileActions } from './profile-actions';
import { useUploadAvatar, useUploadCover } from '@/lib/api/hooks/use-user';
import { cn } from '@/lib/utils';
import type { User } from '@/types/auth';

interface ProfileHeaderProps {
  user: User;
  currentUserId?: string;
  isOwnProfile?: boolean;
  className?: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function ProfileHeader({
  user,
  currentUserId,
  isOwnProfile = false,
  className,
}: ProfileHeaderProps) {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const uploadAvatarMutation = useUploadAvatar();
  const uploadCoverMutation = useUploadCover();

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadCoverMutation.mutateAsync(file);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadAvatarMutation.mutateAsync(file);
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Cover Photo */}
      <div className="relative h-36 w-full overflow-hidden rounded-t-2xl bg-muted sm:h-52 lg:h-64">
        {user.coverUrl ? (
          <Image
            src={user.coverUrl}
            alt="Cover photo"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary via-primary/60 to-secondary/40" />
        )}
        {/* Premium overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />

        {isOwnProfile && (
          <>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverChange}
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-3 right-3 gap-1.5 opacity-80 hover:opacity-100"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadCoverMutation.isPending}
            >
              <Camera className="size-4" />
              <span className="hidden sm:inline">
                {uploadCoverMutation.isPending ? 'Uploading...' : 'Edit Cover'}
              </span>
            </Button>
          </>
        )}
      </div>

      {/* Profile Info */}
      <div className="relative px-6 pb-6 sm:px-8">
        {/* Avatar */}
        <div className="relative -mt-18 mb-5 sm:-mt-24">
          <div className="relative inline-block">
            <Avatar className="size-32 border-4 border-background shadow-xl ring-4 ring-background sm:size-40">
              <AvatarImage src={user.avatarUrl} alt={user.fullName} />
              <AvatarFallback className="text-2xl font-semibold sm:text-3xl bg-gradient-to-br from-primary to-secondary text-white">
                {getInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>

            {isOwnProfile && (
              <>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-1 right-1 size-8 rounded-full opacity-80 hover:opacity-100"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadAvatarMutation.isPending}
                >
                  <Camera className="size-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            {/* Name & Username */}
            <div className="flex items-center gap-2.5">
              <h1 className="truncate font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                {user.fullName}
              </h1>
              {user.isVerified && (
                <BadgeCheck className="size-6 shrink-0 text-primary drop-shadow-sm" />
              )}
            </div>
            <p className="text-muted-foreground text-base">@{user.username}</p>

            {/* Bio */}
            {user.bio && (
              <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed">{user.bio}</p>
            )}

            {/* Meta Info */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {user.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-4" />
                  {user.location}
                </span>
              )}
              {user.website && (
                <a
                  href={
                    user.website.startsWith('http')
                      ? user.website
                      : `https://${user.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <LinkIcon className="size-4" />
                  {user.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="size-4" />
                Joined {formatDate(user.createdAt)}
              </span>
            </div>

            {/* Stats */}
            <ProfileStats
              username={user.username}
              postsCount={user.postsCount}
              followersCount={user.followersCount}
              followingCount={user.followingCount}
              className="mt-4"
            />
          </div>

          {/* Actions */}
          <ProfileActions
            user={user}
            currentUserId={currentUserId}
            isOwnProfile={isOwnProfile}
            className="shrink-0"
          />
        </div>
      </div>
    </div>
  );
}
