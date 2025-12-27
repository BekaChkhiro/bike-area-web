'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  Users,
  FileText,
  ShoppingBag,
  MessageSquare,
  Loader2,
  SlidersHorizontal,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  useGlobalSearch,
  useSearchUsers,
  useSearchPosts,
  useSearchListings,
  useSearchThreads,
} from '@/lib/api/hooks/use-search';
import { useDebounce } from '@/hooks/use-debounce';
import { useRecentSearches } from '@/hooks/use-recent-searches';
import { UserSearchResult } from '@/components/search/user-search-result';
import { PostSearchResult } from '@/components/search/post-search-result';
import { ListingSearchResult } from '@/components/search/listing-search-result';
import { ThreadSearchResult } from '@/components/search/thread-search-result';
import type { SearchType } from '@/types/search';

const SEARCH_TABS: { value: SearchType; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'All', icon: <Search className="size-4" /> },
  { value: 'users', label: 'Users', icon: <Users className="size-4" /> },
  { value: 'posts', label: 'Posts', icon: <FileText className="size-4" /> },
  { value: 'listings', label: 'Marketplace', icon: <ShoppingBag className="size-4" /> },
  { value: 'threads', label: 'Forum', icon: <MessageSquare className="size-4" /> },
];

const LISTING_CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

interface ListingFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
}

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial values from URL
  const initialQuery = searchParams.get('q') || '';
  const initialType = (searchParams.get('type') as SearchType) || 'all';

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<SearchType>(initialType);
  const [listingFilters, setListingFilters] = useState<ListingFilters>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  const debouncedQuery = useDebounce(query, 300);
  const { addSearch } = useRecentSearches();

  // Update URL when search params change
  const updateUrl = useCallback(
    (q: string, type: SearchType) => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (type !== 'all') params.set('type', type);
      router.push(`/search?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  // Update URL when debounced query or tab changes
  useEffect(() => {
    if (debouncedQuery || activeTab !== 'all') {
      updateUrl(debouncedQuery, activeTab);
    }
  }, [debouncedQuery, activeTab, updateUrl]);

  // Add to recent searches when user performs a search
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      addSearch(debouncedQuery, activeTab);
    }
  }, [debouncedQuery, activeTab, addSearch]);

  // Search queries
  const globalSearch = useGlobalSearch(debouncedQuery);
  const usersSearch = useSearchUsers(debouncedQuery, {
    enabled: activeTab === 'users' || activeTab === 'all',
  });
  const postsSearch = useSearchPosts(debouncedQuery, {
    enabled: activeTab === 'posts' || activeTab === 'all',
  });
  const listingsSearch = useSearchListings(
    debouncedQuery,
    listingFilters,
    { enabled: activeTab === 'listings' || activeTab === 'all' }
  );
  const threadsSearch = useSearchThreads(debouncedQuery, undefined, {
    enabled: activeTab === 'threads' || activeTab === 'all',
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value as SearchType);
  };

  const handleApplyListingFilters = () => {
    setListingFilters({
      ...listingFilters,
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 10000 ? priceRange[1] : undefined,
    });
  };

  const handleClearListingFilters = () => {
    setListingFilters({});
    setPriceRange([0, 10000]);
  };

  const hasActiveFilters =
    listingFilters.category ||
    listingFilters.condition ||
    listingFilters.minPrice ||
    listingFilters.maxPrice;

  const isLoading =
    globalSearch.isLoading ||
    usersSearch.isLoading ||
    postsSearch.isLoading ||
    listingsSearch.isLoading ||
    threadsSearch.isLoading;

  const hasQuery = debouncedQuery.length >= 2;

  // Get combined results count for tabs
  const getCounts = (): Record<SearchType, number> => {
    if (!globalSearch.data) {
      return { all: 0, users: 0, posts: 0, listings: 0, threads: 0 };
    }
    return {
      all:
        (globalSearch.data.users?.length || 0) +
        (globalSearch.data.posts?.length || 0) +
        (globalSearch.data.listings?.length || 0) +
        (globalSearch.data.threads?.length || 0),
      users: globalSearch.data.users?.length || 0,
      posts: globalSearch.data.posts?.length || 0,
      listings: globalSearch.data.listings?.length || 0,
      threads: globalSearch.data.threads?.length || 0,
    };
  };

  const counts = getCounts();

  return (
    <div className="container max-w-4xl py-6">
      {/* Search Header */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users, posts, listings, forum..."
            className="h-12 pl-10 pr-10 text-base"
            autoFocus
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 size-8 -translate-y-1/2"
              onClick={() => setQuery('')}
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="mb-6 flex items-center justify-between gap-4">
          <TabsList className="h-auto flex-wrap gap-1">
            {SEARCH_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-1.5"
              >
                {tab.icon}
                <span>{tab.label}</span>
                {hasQuery && counts[tab.value] !== undefined && counts[tab.value] > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {counts[tab.value]}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Listing Filters */}
          {activeTab === 'listings' && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <SlidersHorizontal className="size-4" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-1">
                      {Object.values(listingFilters).filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Listings</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  {/* Condition Filter */}
                  <div className="space-y-2">
                    <Label>Condition</Label>
                    <Select
                      value={listingFilters.condition || ''}
                      onValueChange={(value) =>
                        setListingFilters((prev) => ({
                          ...prev,
                          condition: value || undefined,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any condition</SelectItem>
                        {LISTING_CONDITIONS.map((condition) => (
                          <SelectItem key={condition.value} value={condition.value}>
                            {condition.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range Filter */}
                  <div className="space-y-4">
                    <Label>Price Range</Label>
                    <div className="px-2">
                      <Slider
                        value={priceRange}
                        onValueChange={(values: number[]) => {
                          if (values.length >= 2) {
                            setPriceRange([values[0] ?? 0, values[1] ?? 10000]);
                          }
                        }}
                        max={10000}
                        step={100}
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) =>
                          setPriceRange([Number(e.target.value), priceRange[1]])
                        }
                        className="h-8"
                        placeholder="Min"
                      />
                      <span className="text-muted-foreground">-</span>
                      <Input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) =>
                          setPriceRange([priceRange[0], Number(e.target.value)])
                        }
                        className="h-8"
                        placeholder="Max"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleClearListingFilters}
                    >
                      Clear
                    </Button>
                    <Button className="flex-1" onClick={handleApplyListingFilters}>
                      Apply
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>

        {/* Empty State */}
        {!hasQuery && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="mb-4 size-16 text-muted-foreground/30" />
            <h2 className="text-xl font-semibold">Search for anything</h2>
            <p className="mt-2 text-muted-foreground">
              Find users, posts, marketplace listings, and forum threads
            </p>
          </div>
        )}

        {/* Loading State */}
        {hasQuery && isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* All Results Tab */}
        <TabsContent value="all" className="space-y-8">
          {hasQuery && !isLoading && globalSearch.data && (
            <>
              {/* Users Section */}
              {globalSearch.data.users?.length > 0 && (
                <section>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-lg font-semibold">
                      <Users className="size-5" />
                      Users
                    </h2>
                    {globalSearch.data.users.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab('users')}
                      >
                        View all
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {globalSearch.data.users.slice(0, 3).map((user) => (
                      <UserSearchResult key={user.id} user={user} />
                    ))}
                  </div>
                </section>
              )}

              {/* Posts Section */}
              {globalSearch.data.posts?.length > 0 && (
                <section>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-lg font-semibold">
                      <FileText className="size-5" />
                      Posts
                    </h2>
                    {globalSearch.data.posts.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab('posts')}
                      >
                        View all
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {globalSearch.data.posts.slice(0, 3).map((post) => (
                      <PostSearchResult key={post.id} post={post} />
                    ))}
                  </div>
                </section>
              )}

              {/* Listings Section */}
              {globalSearch.data.listings?.length > 0 && (
                <section>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-lg font-semibold">
                      <ShoppingBag className="size-5" />
                      Marketplace
                    </h2>
                    {globalSearch.data.listings.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab('listings')}
                      >
                        View all
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {globalSearch.data.listings.slice(0, 3).map((listing) => (
                      <ListingSearchResult key={listing.id} listing={listing} />
                    ))}
                  </div>
                </section>
              )}

              {/* Threads Section */}
              {globalSearch.data.threads?.length > 0 && (
                <section>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-lg font-semibold">
                      <MessageSquare className="size-5" />
                      Forum
                    </h2>
                    {globalSearch.data.threads.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab('threads')}
                      >
                        View all
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {globalSearch.data.threads.slice(0, 3).map((thread) => (
                      <ThreadSearchResult key={thread.id} thread={thread} />
                    ))}
                  </div>
                </section>
              )}

              {/* No Results */}
              {!globalSearch.data.users?.length &&
                !globalSearch.data.posts?.length &&
                !globalSearch.data.listings?.length &&
                !globalSearch.data.threads?.length && (
                  <NoResults query={debouncedQuery} />
                )}
            </>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <InfiniteScrollResults
            query={debouncedQuery}
            data={usersSearch.data}
            isLoading={usersSearch.isLoading}
            isFetchingNextPage={usersSearch.isFetchingNextPage}
            hasNextPage={usersSearch.hasNextPage}
            fetchNextPage={usersSearch.fetchNextPage}
            renderItem={(user) => <UserSearchResult key={user.id} user={user} />}
          />
        </TabsContent>

        {/* Posts Tab */}
        <TabsContent value="posts">
          <InfiniteScrollResults
            query={debouncedQuery}
            data={postsSearch.data}
            isLoading={postsSearch.isLoading}
            isFetchingNextPage={postsSearch.isFetchingNextPage}
            hasNextPage={postsSearch.hasNextPage}
            fetchNextPage={postsSearch.fetchNextPage}
            renderItem={(post) => <PostSearchResult key={post.id} post={post} />}
          />
        </TabsContent>

        {/* Listings Tab */}
        <TabsContent value="listings">
          <InfiniteScrollResults
            query={debouncedQuery}
            data={listingsSearch.data}
            isLoading={listingsSearch.isLoading}
            isFetchingNextPage={listingsSearch.isFetchingNextPage}
            hasNextPage={listingsSearch.hasNextPage}
            fetchNextPage={listingsSearch.fetchNextPage}
            renderItem={(listing) => (
              <ListingSearchResult key={listing.id} listing={listing} />
            )}
            gridClassName="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          />
        </TabsContent>

        {/* Threads Tab */}
        <TabsContent value="threads">
          <InfiniteScrollResults
            query={debouncedQuery}
            data={threadsSearch.data}
            isLoading={threadsSearch.isLoading}
            isFetchingNextPage={threadsSearch.isFetchingNextPage}
            hasNextPage={threadsSearch.hasNextPage}
            fetchNextPage={threadsSearch.fetchNextPage}
            renderItem={(thread) => (
              <ThreadSearchResult key={thread.id} thread={thread} />
            )}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// No results component
function NoResults({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Search className="mb-4 size-16 text-muted-foreground/30" />
      <h2 className="text-xl font-semibold">No results found</h2>
      <p className="mt-2 text-muted-foreground">
        No results for &quot;{query}&quot;. Try different keywords.
      </p>
    </div>
  );
}

// Infinite scroll results component
interface InfiniteScrollResultsProps<T> {
  query: string;
  data?: { pages: { items: T[] }[] };
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage?: boolean;
  fetchNextPage: () => void;
  renderItem: (item: T) => React.ReactNode;
  gridClassName?: string;
}

function InfiniteScrollResults<T>({
  query,
  data,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  renderItem,
  gridClassName,
}: InfiniteScrollResultsProps<T>) {
  const hasQuery = query.length >= 2;

  if (!hasQuery) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const allItems = data?.pages.flatMap((page) => page.items) || [];

  if (allItems.length === 0) {
    return <NoResults query={query} />;
  }

  return (
    <div>
      <div className={gridClassName || 'space-y-2'}>
        {allItems.map((item) => renderItem(item))}
      </div>

      {hasNextPage && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load more'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// Main page component with Suspense wrapper
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
