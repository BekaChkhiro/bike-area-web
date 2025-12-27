'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FollowersList } from './followers-list';

interface FollowersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  username: string;
  fullName: string;
  currentUserId?: string;
}

export function FollowersModal({
  open,
  onOpenChange,
  userId,
  username: _username,
  fullName,
  currentUserId,
}: FollowersModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{fullName}&apos;s Followers</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <FollowersList
            userId={userId}
            currentUserId={currentUserId}
            type="followers"
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
