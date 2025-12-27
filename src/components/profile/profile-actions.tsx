'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MoreHorizontal,
  MessageCircle,
  Share2,
  Ban,
  Flag,
  Link as LinkIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { FollowButton } from './follow-button';
import { useBlockUser } from '@/lib/api/hooks/use-user';
import { cn } from '@/lib/utils';
import type { User } from '@/types/auth';

interface ProfileActionsProps {
  user: User;
  currentUserId?: string;
  isOwnProfile?: boolean;
  className?: string;
}

export function ProfileActions({
  user,
  currentUserId,
  isOwnProfile = false,
  className,
}: ProfileActionsProps) {
  const router = useRouter();
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const blockMutation = useBlockUser();

  const handleMessage = () => {
    router.push(`/messages?user=${user.id}`);
  };

  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/${user.username}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user.fullName} (@${user.username})`,
          url: profileUrl,
        });
      } catch (err) {
        // User cancelled or error
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard(profileUrl);
        }
      }
    } else {
      copyToClipboard(profileUrl);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Profile link copied to clipboard');
  };

  const handleBlock = async () => {
    try {
      await blockMutation.mutateAsync(user.id);
      setShowBlockDialog(false);
      router.refresh();
    } catch {
      // Error handled by mutation
    }
  };

  const handleReport = () => {
    router.push(`/report?type=user&id=${user.id}`);
  };

  if (isOwnProfile) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button variant="outline" onClick={() => router.push('/settings/profile')}>
          Edit Profile
        </Button>
        <Button variant="outline" size="icon" onClick={handleShare}>
          <Share2 className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className={cn('flex items-center gap-2', className)}>
        <FollowButton user={user} currentUserId={currentUserId} />

        <Button variant="outline" size="icon" onClick={handleMessage}>
          <MessageCircle className="size-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleShare}>
              <Share2 className="size-4" />
              Share Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                copyToClipboard(`${window.location.origin}/${user.username}`);
              }}
            >
              <LinkIcon className="size-4" />
              Copy Link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowBlockDialog(true)}
              variant="destructive"
            >
              <Ban className="size-4" />
              Block @{user.username}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleReport} variant="destructive">
              <Flag className="size-4" />
              Report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block @{user.username}?</AlertDialogTitle>
            <AlertDialogDescription>
              They won&apos;t be able to find your profile, posts, or message
              you. They won&apos;t be notified that you blocked them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlock}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {blockMutation.isPending ? 'Blocking...' : 'Block'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
