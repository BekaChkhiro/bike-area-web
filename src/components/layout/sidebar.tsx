'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Home,
  Compass,
  Store,
  Wrench,
  MessageSquare,
  MapPin,
  Mail,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/feed', label: 'Feed', icon: Home },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/marketplace', label: 'Marketplace', icon: Store },
  { href: '/parts', label: 'Parts', icon: Wrench },
  { href: '/forum', label: 'Forum', icon: MessageSquare },
  { href: '/services', label: 'Services', icon: MapPin },
  { href: '/messages', label: 'Messages', icon: Mail },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  className?: string;
}

export function Sidebar({ isCollapsed = false, onToggle, className }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const user = session?.user;
  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'relative flex h-full flex-col border-r border-border/40 bg-background/50 backdrop-blur-sm transition-all duration-300',
          isCollapsed ? 'w-16' : 'w-64',
          className
        )}
      >
        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="flex flex-col gap-1 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              if (isCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link href={item.href}>
                        <Button
                          variant={isActive ? 'secondary' : 'ghost'}
                          size="icon"
                          className={cn(
                            'h-10 w-10',
                            isActive && 'bg-primary/10 text-primary hover:bg-primary/20'
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="sr-only">{item.label}</span>
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-3',
                      isActive && 'bg-primary/10 text-primary hover:bg-primary/20'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* User section */}
        <div className="border-t border-border/40 p-3">
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/profile">
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.image || undefined} alt={user?.name || 'User'} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                {user?.name || 'Profile'}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link href="/profile">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-auto py-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.image || undefined} alt={user?.name || 'User'} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-medium">{user?.name}</span>
                  <span className="text-xs text-muted-foreground">View profile</span>
                </div>
              </Button>
            </Link>
          )}
        </div>

        {/* Collapse toggle */}
        {onToggle && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-3 top-6 h-6 w-6 rounded-full border bg-background shadow-sm"
            onClick={onToggle}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
            <span className="sr-only">
              {isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            </span>
          </Button>
        )}
      </aside>
    </TooltipProvider>
  );
}

// Mobile sidebar (sheet variant)
interface MobileSidebarProps {
  onClose?: () => void;
}

export function MobileSidebar({ onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const user = session?.user;
  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="flex h-full flex-col">
      {/* User section at top */}
      <div className="border-b p-4">
        <Link href="/profile" onClick={onClose}>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.image || undefined} alt={user?.name || 'User'} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{user?.name}</span>
              <span className="text-sm text-muted-foreground">{user?.email}</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href} onClick={onClose}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3 text-base',
                    isActive && 'bg-primary/10 text-primary hover:bg-primary/20'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}
