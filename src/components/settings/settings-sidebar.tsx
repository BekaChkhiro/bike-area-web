'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  Settings,
  Shield,
  Bell,
  Lock,
  Ban,
} from 'lucide-react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const settingsNav = [
  {
    title: 'Edit Profile',
    href: '/settings/profile',
    icon: User,
    description: 'Update your profile information',
  },
  {
    title: 'Account',
    href: '/settings/account',
    icon: Settings,
    description: 'Manage your account settings',
  },
  {
    title: 'Privacy',
    href: '/settings/privacy',
    icon: Shield,
    description: 'Control your privacy settings',
  },
  {
    title: 'Notifications',
    href: '/settings/notifications',
    icon: Bell,
    description: 'Manage notification preferences',
  },
  {
    title: 'Security',
    href: '/settings/security',
    icon: Lock,
    description: 'Password and security options',
  },
  {
    title: 'Blocked Users',
    href: '/settings/blocked',
    icon: Ban,
    description: 'Manage blocked accounts',
  },
];

interface SettingsSidebarProps {
  className?: string;
}

export function SettingsSidebar({ className }: SettingsSidebarProps) {
  const pathname = usePathname();

  return (
    <ScrollArea className={cn('h-full', className)}>
      <nav className="flex flex-col gap-1 p-2">
        {settingsNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                'hover:bg-muted',
                isActive
                  ? 'bg-muted font-medium text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              <item.icon className="size-4 shrink-0" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </ScrollArea>
  );
}

// Mobile version - horizontal tabs
export function SettingsMobileNav({ className }: SettingsSidebarProps) {
  const pathname = usePathname();

  return (
    <ScrollArea className={cn('w-full', className)}>
      <nav className="flex gap-1 p-1">
        {settingsNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                'hover:bg-muted',
                isActive
                  ? 'bg-muted font-medium text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              <item.icon className="size-4" />
              <span className="whitespace-nowrap">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </ScrollArea>
  );
}
