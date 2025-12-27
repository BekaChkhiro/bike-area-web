import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

import { api } from '../client';
import { API_ENDPOINTS, QUERY_KEYS } from '../endpoints';
import type { User } from '@/types/auth';
import type {
  Post,
  Listing,
  ForumThread,
  SearchResultsWithPagination,
} from '@/types/search';

interface GlobalSearchResponse {
  users: User[];
  posts: Post[];
  listings: Listing[];
  threads: ForumThread[];
}

// Global search - returns combined results from all categories
export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: QUERY_KEYS.search(query),
    queryFn: () =>
      api.get<GlobalSearchResponse>(API_ENDPOINTS.SEARCH.ALL, { q: query }),
    enabled: query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Search users with pagination
export function useSearchUsers(query: string, options?: { enabled?: boolean }) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.search(query, 'users'), 'infinite'],
    queryFn: ({ pageParam = 1 }) =>
      api.get<SearchResultsWithPagination<User>>(API_ENDPOINTS.SEARCH.USERS, {
        q: query,
        page: String(pageParam),
        limit: '20',
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: (options?.enabled ?? true) && query.length >= 2,
    staleTime: 30 * 1000,
  });
}

// Search posts with pagination
export function useSearchPosts(query: string, options?: { enabled?: boolean }) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.search(query, 'posts'), 'infinite'],
    queryFn: ({ pageParam = 1 }) =>
      api.get<SearchResultsWithPagination<Post>>(API_ENDPOINTS.SEARCH.POSTS, {
        q: query,
        page: String(pageParam),
        limit: '20',
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: (options?.enabled ?? true) && query.length >= 2,
    staleTime: 30 * 1000,
  });
}

// Search listings with pagination and filters
export function useSearchListings(
  query: string,
  filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
  },
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.search(query, 'listings'), filters, 'infinite'],
    queryFn: ({ pageParam = 1 }) =>
      api.get<SearchResultsWithPagination<Listing>>(
        API_ENDPOINTS.SEARCH.LISTINGS,
        {
          q: query,
          page: String(pageParam),
          limit: '20',
          category: filters?.category,
          minPrice: filters?.minPrice ? String(filters.minPrice) : undefined,
          maxPrice: filters?.maxPrice ? String(filters.maxPrice) : undefined,
          condition: filters?.condition,
        }
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: (options?.enabled ?? true) && query.length >= 2,
    staleTime: 30 * 1000,
  });
}

// Search forum threads with pagination
export function useSearchThreads(
  query: string,
  categoryId?: string,
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.search(query, 'threads'), categoryId, 'infinite'],
    queryFn: ({ pageParam = 1 }) =>
      api.get<SearchResultsWithPagination<ForumThread>>(
        API_ENDPOINTS.SEARCH.THREADS,
        {
          q: query,
          page: String(pageParam),
          limit: '20',
          categoryId,
        }
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: (options?.enabled ?? true) && query.length >= 2,
    staleTime: 30 * 1000,
  });
}

// Search suggestions (for autocomplete)
export function useSearchSuggestions(query: string) {
  return useQuery({
    queryKey: ['search', 'suggestions', query],
    queryFn: () =>
      api.get<{ suggestions: string[] }>(API_ENDPOINTS.SEARCH.SUGGESTIONS, {
        q: query,
      }),
    enabled: query.length >= 1,
    staleTime: 60 * 1000, // 1 minute
  });
}

// Hashtag search
export function useSearchHashtags(query: string) {
  return useQuery({
    queryKey: ['search', 'hashtags', query],
    queryFn: () =>
      api.get<{ hashtags: { tag: string; count: number }[] }>(
        API_ENDPOINTS.SEARCH.HASHTAGS,
        { q: query }
      ),
    enabled: query.length >= 1,
    staleTime: 60 * 1000,
  });
}
