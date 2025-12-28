import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useRecentSearches } from '@/hooks/use-recent-searches';

describe('useRecentSearches', () => {
  const mockLocalStorage: Record<string, string> = {};

  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete mockLocalStorage[key];
        }),
        clear: vi.fn(() => {
          Object.keys(mockLocalStorage).forEach((key) => delete mockLocalStorage[key]);
        }),
      },
      writable: true,
    });

    // Clear mock storage
    Object.keys(mockLocalStorage).forEach((key) => delete mockLocalStorage[key]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('initializes with empty array when no stored searches', () => {
      const { result } = renderHook(() => useRecentSearches());

      expect(result.current.recentSearches).toEqual([]);
    });

    it('loads stored searches from localStorage', () => {
      const storedSearches = [
        { id: '1', query: 'bikes', type: 'all', timestamp: Date.now() },
      ];
      mockLocalStorage['recent-searches'] = JSON.stringify(storedSearches);

      const { result } = renderHook(() => useRecentSearches());

      expect(result.current.recentSearches).toHaveLength(1);
      expect(result.current.recentSearches[0].query).toBe('bikes');
    });

    it('handles corrupted localStorage gracefully', () => {
      mockLocalStorage['recent-searches'] = 'invalid json';

      const { result } = renderHook(() => useRecentSearches());

      expect(result.current.recentSearches).toEqual([]);
    });
  });

  describe('addSearch', () => {
    it('adds new search to the beginning', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('test query');
      });

      expect(result.current.recentSearches).toHaveLength(1);
      expect(result.current.recentSearches[0].query).toBe('test query');
    });

    it('adds search with default type "all"', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('test');
      });

      expect(result.current.recentSearches[0].type).toBe('all');
    });

    it('adds search with specified type', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('bikes', 'listings');
      });

      expect(result.current.recentSearches[0].type).toBe('listings');
    });

    it('trims whitespace from query', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('  test query  ');
      });

      expect(result.current.recentSearches[0].query).toBe('test query');
    });

    it('ignores empty queries', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('');
      });

      expect(result.current.recentSearches).toHaveLength(0);
    });

    it('ignores whitespace-only queries', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('   ');
      });

      expect(result.current.recentSearches).toHaveLength(0);
    });

    it('removes duplicate queries (case insensitive)', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('test');
        result.current.addSearch('TEST');
      });

      expect(result.current.recentSearches).toHaveLength(1);
      expect(result.current.recentSearches[0].query).toBe('TEST');
    });

    it('moves duplicate to beginning', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('first');
        result.current.addSearch('second');
        result.current.addSearch('first');
      });

      expect(result.current.recentSearches).toHaveLength(2);
      expect(result.current.recentSearches[0].query).toBe('first');
      expect(result.current.recentSearches[1].query).toBe('second');
    });

    it('limits to 10 recent searches', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        for (let i = 0; i < 15; i++) {
          result.current.addSearch(`query ${i}`);
        }
      });

      expect(result.current.recentSearches).toHaveLength(10);
      expect(result.current.recentSearches[0].query).toBe('query 14');
    });

    it('generates unique id for each search', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('first');
        result.current.addSearch('second');
      });

      expect(result.current.recentSearches[0].id).not.toBe(
        result.current.recentSearches[1].id
      );
    });

    it('sets timestamp for each search', () => {
      const { result } = renderHook(() => useRecentSearches());
      const before = Date.now();

      act(() => {
        result.current.addSearch('test');
      });

      const after = Date.now();
      expect(result.current.recentSearches[0].timestamp).toBeGreaterThanOrEqual(
        before
      );
      expect(result.current.recentSearches[0].timestamp).toBeLessThanOrEqual(
        after
      );
    });
  });

  describe('removeSearch', () => {
    it('removes search by id', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('test');
      });

      const id = result.current.recentSearches[0].id;

      act(() => {
        result.current.removeSearch(id);
      });

      expect(result.current.recentSearches).toHaveLength(0);
    });

    it('does not affect other searches', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('first');
        result.current.addSearch('second');
      });

      const id = result.current.recentSearches[0].id;

      act(() => {
        result.current.removeSearch(id);
      });

      expect(result.current.recentSearches).toHaveLength(1);
      expect(result.current.recentSearches[0].query).toBe('first');
    });

    it('handles non-existent id gracefully', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('test');
      });

      act(() => {
        result.current.removeSearch('non-existent-id');
      });

      expect(result.current.recentSearches).toHaveLength(1);
    });
  });

  describe('clearAll', () => {
    it('removes all searches', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('first');
        result.current.addSearch('second');
        result.current.addSearch('third');
      });

      expect(result.current.recentSearches).toHaveLength(3);

      act(() => {
        result.current.clearAll();
      });

      expect(result.current.recentSearches).toHaveLength(0);
    });
  });

  describe('localStorage Persistence', () => {
    it('saves searches to localStorage', () => {
      const { result } = renderHook(() => useRecentSearches());

      act(() => {
        result.current.addSearch('test');
      });

      // The hook saves on state change
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('does not save on initial mount', () => {
      renderHook(() => useRecentSearches());

      // setItem should not be called on initial mount
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });
});
