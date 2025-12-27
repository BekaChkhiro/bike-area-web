'use client';

import { FileText, ShoppingBag, Wrench, User } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { User as UserType } from '@/types/auth';

interface ProfileTabsProps {
  user: UserType;
  defaultTab?: string;
  className?: string;
}

interface TabConfig {
  value: string;
  label: string;
  icon: React.ElementType;
}

const tabs: TabConfig[] = [
  { value: 'posts', label: 'Posts', icon: FileText },
  { value: 'listings', label: 'Listings', icon: ShoppingBag },
  { value: 'parts', label: 'Parts', icon: Wrench },
  { value: 'about', label: 'About', icon: User },
];

export function ProfileTabs({
  user,
  defaultTab = 'posts',
  className,
}: ProfileTabsProps) {
  return (
    <Tabs defaultValue={defaultTab} className={cn('w-full', className)}>
      <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="relative rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            <tab.icon className="mr-2 size-4" />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="posts" className="mt-4">
        <PostsTabContent userId={user.id} />
      </TabsContent>

      <TabsContent value="listings" className="mt-4">
        <ListingsTabContent userId={user.id} />
      </TabsContent>

      <TabsContent value="parts" className="mt-4">
        <PartsTabContent userId={user.id} />
      </TabsContent>

      <TabsContent value="about" className="mt-4">
        <AboutTabContent user={user} />
      </TabsContent>
    </Tabs>
  );
}

// Tab content components - placeholders for now
// These will be implemented when we build the respective features

function PostsTabContent({ userId: _userId }: { userId: string }) {
  return (
    <div className="py-8 text-center text-muted-foreground">
      <FileText className="mx-auto mb-2 size-12 opacity-50" />
      <p>No posts yet</p>
      <p className="text-sm">Posts will appear here</p>
    </div>
  );
}

function ListingsTabContent({ userId: _userId }: { userId: string }) {
  return (
    <div className="py-8 text-center text-muted-foreground">
      <ShoppingBag className="mx-auto mb-2 size-12 opacity-50" />
      <p>No listings yet</p>
      <p className="text-sm">Marketplace listings will appear here</p>
    </div>
  );
}

function PartsTabContent({ userId: _userId }: { userId: string }) {
  return (
    <div className="py-8 text-center text-muted-foreground">
      <Wrench className="mx-auto mb-2 size-12 opacity-50" />
      <p>No parts listed</p>
      <p className="text-sm">Parts for sale will appear here</p>
    </div>
  );
}

function AboutTabContent({ user }: { user: UserType }) {
  return (
    <div className="space-y-6">
      {user.bio && (
        <div>
          <h3 className="mb-2 font-semibold">Bio</h3>
          <p className="whitespace-pre-wrap text-muted-foreground">{user.bio}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {user.location && (
          <div>
            <h3 className="mb-1 text-sm font-medium text-muted-foreground">
              Location
            </h3>
            <p>{user.location}</p>
          </div>
        )}

        {user.website && (
          <div>
            <h3 className="mb-1 text-sm font-medium text-muted-foreground">
              Website
            </h3>
            <a
              href={
                user.website.startsWith('http')
                  ? user.website
                  : `https://${user.website}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {user.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}

        <div>
          <h3 className="mb-1 text-sm font-medium text-muted-foreground">
            Member since
          </h3>
          <p>
            {new Date(user.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {!user.bio && !user.location && !user.website && (
        <div className="py-8 text-center text-muted-foreground">
          <User className="mx-auto mb-2 size-12 opacity-50" />
          <p>No additional information</p>
        </div>
      )}
    </div>
  );
}
