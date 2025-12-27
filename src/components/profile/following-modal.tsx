'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FollowersList } from './followers-list';

interface FollowingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  username: string;
  fullName: string;
  currentUserId?: string;
}

export function FollowingModal({
  open,
  onOpenChange,
  userId,
  username: _username,
  fullName,
  currentUserId,
}: FollowingModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{fullName} is Following</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <FollowersList
            userId={userId}
            currentUserId={currentUserId}
            type="following"
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
