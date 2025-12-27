import type { User } from './auth';

// Post type for search results
export interface Post {
  id: string;
  content: string;
  images?: string[];
  author: User;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Marketplace listing type
export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  category: string;
  location?: string;
  seller: User;
  isFavorited?: boolean;
  viewsCount: number;
  createdAt: string;
  updatedAt?: string;
}

// Forum thread type
export interface ForumThread {
  id: string;
  title: string;
  content: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  author: User;
  repliesCount: number;
  viewsCount: number;
  likesCount: number;
  isPinned: boolean;
  isClosed: boolean;
  lastReplyAt?: string;
  createdAt: string;
  updatedAt?: string;
}

// Search result types
export interface SearchResults {
  users: User[];
  posts: Post[];
  listings: Listing[];
  threads: ForumThread[];
  totalCount: number;
}

export interface SearchResultsWithPagination<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export type SearchType = 'all' | 'users' | 'posts' | 'listings' | 'threads';

export interface RecentSearch {
  id: string;
  query: string;
  type: SearchType;
  timestamp: number;
}
