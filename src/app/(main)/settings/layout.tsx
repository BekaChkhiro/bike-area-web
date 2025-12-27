'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SettingsSidebar, SettingsMobileNav } from '@/components/settings/settings-sidebar';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="lg:hidden">
          <Link href="/">
            <ChevronLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <Card className="p-0">
          <SettingsMobileNav />
        </Card>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:w-64 lg:shrink-0">
          <Card className="sticky top-20 p-0">
            <SettingsSidebar className="max-h-[calc(100vh-8rem)]" />
          </Card>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
