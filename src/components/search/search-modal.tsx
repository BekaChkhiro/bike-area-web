'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Users,
  FileText,
  ShoppingBag,
  MessageSquare,
  Clock,
  X,
  Loader2,
  ArrowRight,
} from 'lucide-react';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { useGlobalSearch } from '@/lib/api/hooks/use-search';
import { useRecentSearches } from '@/hooks/use-recent-searches';
import { useDebounce } from '@/hooks/use-debounce';
import { UserSearchResultCompact } from './user-search-result';
import { PostSearchResultCompact } from './post-search-result';
import { ListingSearchResultCompact } from './listing-search-result';
import { ThreadSearchResultCompact } from './thread-search-result';
import type { SearchType } from '@/types/search';

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const { recentSearches, addSearch, removeSearch, clearAll } =
    useRecentSearches();

  const { data, isLoading } = useGlobalSearch(debouncedQuery);

  // Wrapper to reset query when modal closes
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        setQuery('');
      }
      onOpenChange(newOpen);
    },
    [onOpenChange]
  );

  const handleSelect = useCallback(
    (path: string) => {
      if (query.trim()) {
        addSearch(query.trim());
      }
      handleOpenChange(false);
      router.push(path);
    },
    [query, addSearch, handleOpenChange, router]
  );

  const handleViewAll = useCallback(
    (type?: SearchType) => {
      if (query.trim()) {
        addSearch(query.trim(), type);
      }
      handleOpenChange(false);
      const searchParams = new URLSearchParams();
      searchParams.set('q', query.trim());
      if (type && type !== 'all') {
        searchParams.set('type', type);
      }
      router.push(`/search?${searchParams.toString()}`);
    },
    [query, addSearch, handleOpenChange, router]
  );

  const handleRecentSearch = useCallback(
    (recentQuery: string, type: SearchType) => {
      addSearch(recentQuery, type);
      handleOpenChange(false);
      const searchParams = new URLSearchParams();
      searchParams.set('q', recentQuery);
      if (type !== 'all') {
        searchParams.set('type', type);
      }
      router.push(`/search?${searchParams.toString()}`);
    },
    [addSearch, handleOpenChange, router]
  );

  const hasResults =
    data &&
    (data.users.length > 0 ||
      data.posts.length > 0 ||
      data.listings.length > 0 ||
      data.threads.length > 0);

  const showRecent = !query && recentSearches.length > 0;

  return (
    <CommandDialog open={open} onOpenChange={handleOpenChange}>
      <CommandInput
        placeholder="Search users, posts, listings, forum..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {/* Loading State */}
        {isLoading && debouncedQuery.length >= 2 && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && debouncedQuery.length >= 2 && !hasResults && (
          <CommandEmpty>
            <div className="flex flex-col items-center py-6 text-center">
              <Search className="mb-2 size-10 text-muted-foreground/50" />
              <p className="font-medium">No results found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try searching with different keywords
              </p>
            </div>
          </CommandEmpty>
        )}

        {/* Recent Searches */}
        {showRecent && (
          <CommandGroup>
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Recent Searches
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs"
                onClick={clearAll}
              >
                Clear all
              </Button>
            </div>
            {recentSearches.map((search) => (
              <CommandItem
                key={search.id}
                onSelect={() => handleRecentSearch(search.query, search.type)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-muted-foreground" />
                  <span>{search.query}</span>
                  {search.type !== 'all' && (
                    <span className="text-xs text-muted-foreground">
                      in {search.type}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSearch(search.id);
                  }}
                >
                  <X className="size-3" />
                </Button>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Search Results */}
        {!isLoading && hasResults && (
          <>
            {/* Users */}
            {data.users.length > 0 && (
              <CommandGroup heading="Users">
                {data.users.slice(0, 3).map((user) => (
                  <CommandItem
                    key={user.id}
                    value={`user-${user.id}`}
                    onSelect={() => handleSelect(`/${user.username}`)}
                  >
                    <UserSearchResultCompact
                      user={user}
                      showFollowButton={false}
                    />
                  </CommandItem>
                ))}
                {data.users.length > 3 && (
                  <CommandItem
                    onSelect={() => handleViewAll('users')}
                    className="justify-center text-primary"
                  >
                    <span className="flex items-center gap-1 text-sm">
                      View all {data.users.length} users
                      <ArrowRight className="size-3" />
                    </span>
                  </CommandItem>
                )}
              </CommandGroup>
            )}

            {data.users.length > 0 && data.posts.length > 0 && (
              <CommandSeparator />
            )}

            {/* Posts */}
            {data.posts.length > 0 && (
              <CommandGroup heading="Posts">
                {data.posts.slice(0, 3).map((post) => (
                  <CommandItem
                    key={post.id}
                    value={`post-${post.id}`}
                    onSelect={() => handleSelect(`/posts/${post.id}`)}
                  >
                    <PostSearchResultCompact post={post} />
                  </CommandItem>
                ))}
                {data.posts.length > 3 && (
                  <CommandItem
                    onSelect={() => handleViewAll('posts')}
                    className="justify-center text-primary"
                  >
                    <span className="flex items-center gap-1 text-sm">
                      View all {data.posts.length} posts
                      <ArrowRight className="size-3" />
                    </span>
                  </CommandItem>
                )}
              </CommandGroup>
            )}

            {data.posts.length > 0 && data.listings.length > 0 && (
              <CommandSeparator />
            )}

            {/* Listings */}
            {data.listings.length > 0 && (
              <CommandGroup heading="Marketplace">
                {data.listings.slice(0, 3).map((listing) => (
                  <CommandItem
                    key={listing.id}
                    value={`listing-${listing.id}`}
                    onSelect={() => handleSelect(`/marketplace/${listing.id}`)}
                  >
                    <ListingSearchResultCompact listing={listing} />
                  </CommandItem>
                ))}
                {data.listings.length > 3 && (
                  <CommandItem
                    onSelect={() => handleViewAll('listings')}
                    className="justify-center text-primary"
                  >
                    <span className="flex items-center gap-1 text-sm">
                      View all {data.listings.length} listings
                      <ArrowRight className="size-3" />
                    </span>
                  </CommandItem>
                )}
              </CommandGroup>
            )}

            {data.listings.length > 0 && data.threads.length > 0 && (
              <CommandSeparator />
            )}

            {/* Forum Threads */}
            {data.threads.length > 0 && (
              <CommandGroup heading="Forum">
                {data.threads.slice(0, 3).map((thread) => (
                  <CommandItem
                    key={thread.id}
                    value={`thread-${thread.id}`}
                    onSelect={() =>
                      handleSelect(`/forum/threads/${thread.id}`)
                    }
                  >
                    <ThreadSearchResultCompact thread={thread} />
                  </CommandItem>
                ))}
                {data.threads.length > 3 && (
                  <CommandItem
                    onSelect={() => handleViewAll('threads')}
                    className="justify-center text-primary"
                  >
                    <span className="flex items-center gap-1 text-sm">
                      View all {data.threads.length} threads
                      <ArrowRight className="size-3" />
                    </span>
                  </CommandItem>
                )}
              </CommandGroup>
            )}

            <CommandSeparator />

            {/* View All Results */}
            <CommandGroup>
              <CommandItem
                onSelect={() => handleViewAll()}
                className="justify-center"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-primary">
                  View all results for &ldquo;{query}&rdquo;
                  <ArrowRight className="size-4" />
                </span>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {/* Quick Actions (when no query) */}
        {!query && !showRecent && (
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => handleSelect('/search?type=users')}>
              <Users className="mr-2 size-4" />
              <span>Search Users</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect('/search?type=posts')}>
              <FileText className="mr-2 size-4" />
              <span>Search Posts</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect('/search?type=listings')}
            >
              <ShoppingBag className="mr-2 size-4" />
              <span>Search Marketplace</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect('/search?type=threads')}>
              <MessageSquare className="mr-2 size-4" />
              <span>Search Forum</span>
            </CommandItem>
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

// Hook to control search modal with keyboard shortcut
export function useSearchModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return {
    open,
    setOpen,
    toggle: () => setOpen((prev) => !prev),
  };
}
