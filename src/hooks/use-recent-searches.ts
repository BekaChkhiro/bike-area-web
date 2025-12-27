'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { RecentSearch, SearchType } from '@/types/search';

const STORAGE_KEY = 'recent-searches';
const MAX_RECENT_SEARCHES = 10;

function getStoredSearches(): RecentSearch[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as RecentSearch[];
    }
  } catch {
    // Ignore errors
  }
  return [];
}

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(getStoredSearches);
  const isInitialMount = useRef(true);

  // Save to localStorage when recentSearches changes (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentSearches));
    } catch {
      // Ignore errors (e.g., quota exceeded)
    }
  }, [recentSearches]);

  const addSearch = useCallback((query: string, type: SearchType = 'all') => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setRecentSearches((prev) => {
      // Remove existing entry with same query
      const filtered = prev.filter(
        (item) => item.query.toLowerCase() !== trimmedQuery.toLowerCase()
      );

      // Add new search at the beginning
      const newSearch: RecentSearch = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        query: trimmedQuery,
        type,
        timestamp: Date.now(),
      };

      // Keep only the most recent searches
      return [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    });
  }, []);

  const removeSearch = useCallback((id: string) => {
    setRecentSearches((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setRecentSearches([]);
  }, []);

  return {
    recentSearches,
    addSearch,
    removeSearch,
    clearAll,
  };
}
