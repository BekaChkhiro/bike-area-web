'use client';

import { useState, useCallback } from 'react';
import { Bell, Mail, Smartphone, Users, Heart, MessageCircle, MessagesSquare, ShoppingBag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
}

const defaultSettings: NotificationSetting[] = [
  {
    id: 'newFollower',
    label: 'New Followers',
    description: 'When someone follows you',
    icon: Users,
    enabled: true,
  },
  {
    id: 'postLike',
    label: 'Post Likes',
    description: 'When someone likes your post',
    icon: Heart,
    enabled: true,
  },
  {
    id: 'postComment',
    label: 'Post Comments',
    description: 'When someone comments on your post',
    icon: MessageCircle,
    enabled: true,
  },
  {
    id: 'commentReply',
    label: 'Comment Replies',
    description: 'When someone replies to your comment',
    icon: MessageCircle,
    enabled: true,
  },
  {
    id: 'newMessage',
    label: 'New Messages',
    description: 'When you receive a new message',
    icon: MessagesSquare,
    enabled: true,
  },
  {
    id: 'threadReply',
    label: 'Thread Replies',
    description: 'When someone replies to your forum thread',
    icon: MessagesSquare,
    enabled: true,
  },
  {
    id: 'listingInquiry',
    label: 'Listing Inquiries',
    description: 'When someone asks about your listing',
    icon: ShoppingBag,
    enabled: true,
  },
];

export default function NotificationsSettingsPage() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [settings, setSettings] = useState(defaultSettings);
  const [savingId, setSavingId] = useState<string | null>(null);

  const handleMasterToggle = useCallback(
    async (type: 'push' | 'email', enabled: boolean) => {
      const setter = type === 'push' ? setPushEnabled : setEmailEnabled;
      setter(enabled);

      try {
        // API call would go here
        await new Promise((resolve) => setTimeout(resolve, 500));
        toast.success(
          `${type === 'push' ? 'Push' : 'Email'} notifications ${enabled ? 'enabled' : 'disabled'}`
        );
      } catch {
        setter(!enabled); // Rollback
        toast.error('Failed to update settings');
      }
    },
    []
  );

  const handleToggle = useCallback(async (id: string, enabled: boolean) => {
    setSavingId(id);

    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled } : s))
    );

    try {
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Auto-saved, no toast needed
    } catch {
      // Rollback on error
      setSettings((prev) =>
        prev.map((s) => (s.id === id ? { ...s, enabled: !enabled } : s))
      );
      toast.error('Failed to update setting');
    } finally {
      setSavingId(null);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Master Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="size-5" />
            Notification Channels
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Smartphone className="size-5 text-muted-foreground" />
              <div>
                <Label className="text-base font-medium">
                  Push Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications on your device
                </p>
              </div>
            </div>
            <Switch
              checked={pushEnabled}
              onCheckedChange={(checked) =>
                handleMasterToggle('push', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Mail className="size-5 text-muted-foreground" />
              <div>
                <Label className="text-base font-medium">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
            </div>
            <Switch
              checked={emailEnabled}
              onCheckedChange={(checked) =>
                handleMasterToggle('email', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Individual Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Choose which notifications you want to receive. Changes are saved
            automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {settings.map((setting, index) => (
              <div key={setting.id}>
                {index > 0 && <Separator className="my-1" />}
                <div
                  className={cn(
                    'flex items-center justify-between rounded-lg p-3 transition-colors',
                    savingId === setting.id && 'bg-muted/50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <setting.icon className="size-5 text-muted-foreground" />
                    <div>
                      <Label className="text-base font-medium">
                        {setting.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {setting.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {savingId === setting.id && (
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    )}
                    <Switch
                      checked={setting.enabled}
                      onCheckedChange={(checked) =>
                        handleToggle(setting.id, checked)
                      }
                      disabled={!pushEnabled && !emailEnabled}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!pushEnabled && !emailEnabled && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Enable push or email notifications to configure individual
              settings.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
