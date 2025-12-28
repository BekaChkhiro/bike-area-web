import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';

import SearchPage from '@/app/(main)/search/page';
import { render } from '../../utils/test-utils';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
  useSearchParams: vi.fn(() => ({
    get: vi.fn((key: string) => {
      if (key === 'q') return '';
      if (key === 'type') return 'all';
      return null;
    }),
  })),
}));

// Mock search data
const mockUserResults = {
  users: [
    {
      id: '1',
      username: 'john_doe',
      fullName: 'John Doe',
      email: 'john@example.com',
      avatarUrl: null,
      isVerified: true,
    },
    {
      id: '2',
      username: 'jane_smith',
      fullName: 'Jane Smith',
      email: 'jane@example.com',
      avatarUrl: null,
      isVerified: false,
    },
  ],
  posts: [
    {
      id: '1',
      content: 'Test post content about bikes',
      author: {
        id: '1',
        username: 'john_doe',
        fullName: 'John Doe',
        email: 'john@example.com',
        avatarUrl: null,
        isVerified: false,
      },
      likesCount: 10,
      commentsCount: 5,
      createdAt: new Date().toISOString(),
    },
  ],
  listings: [
    {
      id: '1',
      title: 'Mountain Bike',
      description: 'Great condition mountain bike',
      price: 500,
      currency: 'USD',
      images: ['https://example.com/bike.jpg'],
      condition: 'good' as const,
      category: 'bikes',
      seller: {
        id: '1',
        username: 'john_doe',
        fullName: 'John Doe',
        email: 'john@example.com',
        avatarUrl: null,
        isVerified: false,
      },
      viewsCount: 50,
      createdAt: new Date().toISOString(),
    },
  ],
  threads: [
    {
      id: '1',
      title: 'Best bike trails discussion',
      content: 'What are your favorite trails?',
      category: { id: '1', name: 'General', slug: 'general' },
      author: {
        id: '1',
        username: 'john_doe',
        fullName: 'John Doe',
        email: 'john@example.com',
        avatarUrl: null,
        isVerified: false,
      },
      repliesCount: 15,
      viewsCount: 100,
      likesCount: 8,
      isPinned: false,
      isClosed: false,
      createdAt: new Date().toISOString(),
    },
  ],
};

const mockEmptyResults = {
  users: [],
  posts: [],
  listings: [],
  threads: [],
};

// Mock search hooks
vi.mock('@/lib/api/hooks/use-search', () => ({
  useGlobalSearch: vi.fn((query: string) => ({
    data: query.length >= 2 ? mockUserResults : null,
    isLoading: false,
  })),
  useSearchUsers: vi.fn(() => ({
    data: { pages: [{ items: mockUserResults.users }] },
    isLoading: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
  })),
  useSearchPosts: vi.fn(() => ({
    data: { pages: [{ items: mockUserResults.posts }] },
    isLoading: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
  })),
  useSearchListings: vi.fn(() => ({
    data: { pages: [{ items: mockUserResults.listings }] },
    isLoading: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
  })),
  useSearchThreads: vi.fn(() => ({
    data: { pages: [{ items: mockUserResults.threads }] },
    isLoading: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
  })),
}));

// Mock debounce
vi.mock('@/hooks/use-debounce', () => ({
  useDebounce: vi.fn((value: string) => value),
}));

// Mock recent searches
vi.mock('@/hooks/use-recent-searches', () => ({
  useRecentSearches: vi.fn(() => ({
    recentSearches: [],
    addSearch: vi.fn(),
    removeSearch: vi.fn(),
    clearAll: vi.fn(),
  })),
}));

describe('SearchPage', () => {
  const mockRouterPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockRouterPush,
    });
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue({
      get: vi.fn((key: string) => {
        if (key === 'q') return '';
        if (key === 'type') return 'all';
        return null;
      }),
    });
  });

  describe('Initial State', () => {
    it('renders search input', () => {
      render(<SearchPage />);

      expect(
        screen.getByPlaceholderText(/search users, posts, listings/i)
      ).toBeInTheDocument();
    });

    it('renders tabs', () => {
      render(<SearchPage />);

      expect(screen.getByRole('tab', { name: /all/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /users/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /posts/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /marketplace/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /forum/i })).toBeInTheDocument();
    });

    it('shows empty state when no query', () => {
      render(<SearchPage />);

      expect(screen.getByText('Search for anything')).toBeInTheDocument();
      expect(
        screen.getByText(/find users, posts, marketplace listings/i)
      ).toBeInTheDocument();
    });
  });

  describe('Search Results', () => {
    it('shows results when query is entered', async () => {
      // Mock URL with query
      (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue({
        get: vi.fn((key: string) => {
          if (key === 'q') return 'bikes';
          if (key === 'type') return 'all';
          return null;
        }),
      });

      render(<SearchPage />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('shows categorized sections in All tab', async () => {
      (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue({
        get: vi.fn((key: string) => {
          if (key === 'q') return 'bikes';
          if (key === 'type') return 'all';
          return null;
        }),
      });

      render(<SearchPage />);

      await waitFor(() => {
        // Section headings
        const userHeadings = screen.getAllByText('Users');
        expect(userHeadings.length).toBeGreaterThan(0);
      });
    });

    it('shows user results', async () => {
      (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue({
        get: vi.fn((key: string) => {
          if (key === 'q') return 'john';
          if (key === 'type') return 'all';
          return null;
        }),
      });

      render(<SearchPage />);

      await waitFor(() => {
        // John Doe appears in multiple sections (user, post author, listing seller, thread author)
        const johnDoes = screen.getAllByText('John Doe');
        expect(johnDoes.length).toBeGreaterThan(0);
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    it('shows post results', async () => {
      (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue({
        get: vi.fn((key: string) => {
          if (key === 'q') return 'bikes';
          if (key === 'type') return 'all';
          return null;
        }),
      });

      render(<SearchPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/test post content about bikes/i)
        ).toBeInTheDocument();
      });
    });

    it('shows listing results', async () => {
      (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue({
        get: vi.fn((key: string) => {
          if (key === 'q') return 'bikes';
          if (key === 'type') return 'all';
          return null;
        }),
      });

      render(<SearchPage />);

      await waitFor(() => {
        expect(screen.getByText('Mountain Bike')).toBeInTheDocument();
      });
    });

    it('shows thread results', async () => {
      (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue({
        get: vi.fn((key: string) => {
          if (key === 'q') return 'bikes';
          if (key === 'type') return 'all';
          return null;
        }),
      });

      render(<SearchPage />);

      await waitFor(() => {
        expect(
          screen.getByText('Best bike trails discussion')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Tabs', () => {
    it('switches to Users tab', async () => {
      (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue({
        get: vi.fn((key: string) => {
          if (key === 'q') return 'test';
          if (key === 'type') return 'all';
          return null;
        }),
      });

      const { user } = render(<SearchPage />);

      const usersTab = screen.getByRole('tab', { name: /users/i });
      await user.click(usersTab);

      expect(usersTab).toHaveAttribute('aria-selected', 'true');
    });

    it('switches to Posts tab', async () => {
      (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue({
        get: vi.fn((key: string) => {
          if (key === 'q') return 'test';
          if (key === 'type') return 'all';
          return null;
        }),
      });

      const { user } = render(<SearchPage />);

      const postsTab = screen.getByRole('tab', { name: /posts/i });
      await user.click(postsTab);

      expect(postsTab).toHaveAttribute('aria-selected', 'true');
    });

    it('switches to Marketplace tab', async () => {
      (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue({
        get: vi.fn((key: string) => {
          if (key === 'q') return 'test';
          if (key === 'type') return 'all';
          return null;
        }),
      });

      const { user } = render(<SearchPage />);

      const marketplaceTab = screen.getByRole('tab', { name: /marketplace/i });
      await user.click(marketplaceTab);

      expect(marketplaceTab).toHaveAttribute('aria-selected', 'true');
    });

    it('shows result counts in tabs', async () => {
      (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue({
        get: vi.fn((key: string) => {
          if (key === 'q') return 'test';
          if (key === 'type') return 'all';
          return null;
        }),
      });

      render(<SearchPage />);

      await waitFor(() => {
        // Users count badge should show 2
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('shows no results message when search returns empty', async () => {
      const useSearchMock = await import('@/lib/api/hooks/use-search');
      (useSearchMock.useGlobalSearch as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockEmptyResults,
        isLoading: false,
      });

      (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue({
        get: vi.fn((key: string) => {
          if (key === 'q') return 'nonexistent';
          if (key === 'type') return 'all';
          return null;
        }),
      });

      render(<SearchPage />);

      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument();
      });
    });

    it('shows query in no results message', async () => {
      const useSearchMock = await import('@/lib/api/hooks/use-search');
      (useSearchMock.useGlobalSearch as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockEmptyResults,
        isLoading: false,
      });

      (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue({
        get: vi.fn((key: string) => {
          if (key === 'q') return 'xyznonexistent';
          if (key === 'type') return 'all';
          return null;
        }),
      });

      render(<SearchPage />);

      await waitFor(() => {
        // Check for no results found message
        expect(screen.getByText('No results found')).toBeInTheDocument();
        // The query should be displayed somewhere in the message
        expect(screen.getByText(/xyznonexistent/i)).toBeInTheDocument();
      });
    });
  });

  describe('Marketplace Filters', () => {
    it('shows filters button on Marketplace tab', async () => {
      (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue({
        get: vi.fn((key: string) => {
          if (key === 'q') return 'bikes';
          if (key === 'type') return 'listings';
          return null;
        }),
      });

      const { user } = render(<SearchPage />);

      const marketplaceTab = screen.getByRole('tab', { name: /marketplace/i });
      await user.click(marketplaceTab);

      expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
    });
  });

  describe('Search Input', () => {
    it('has autofocus', () => {
      render(<SearchPage />);

      const input = screen.getByPlaceholderText(/search users, posts, listings/i);
      expect(input).toHaveFocus();
    });

    it('shows clear button when has value', async () => {
      (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue({
        get: vi.fn((key: string) => {
          if (key === 'q') return 'test';
          if (key === 'type') return 'all';
          return null;
        }),
      });

      render(<SearchPage />);

      // The X button should be visible
      const clearButtons = screen.getAllByRole('button');
      const hasXButton = clearButtons.some((btn) => {
        const svg = btn.querySelector('svg');
        return svg?.classList.contains('lucide-x');
      });

      expect(hasXButton).toBe(true);
    });

    it('can clear search input', async () => {
      (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue({
        get: vi.fn((key: string) => {
          if (key === 'q') return 'test';
          if (key === 'type') return 'all';
          return null;
        }),
      });

      const { user } = render(<SearchPage />);

      // Find and click the clear button
      const clearButtons = screen.getAllByRole('button');
      const xButton = clearButtons.find((btn) => {
        const svg = btn.querySelector('svg');
        return svg?.classList.contains('lucide-x');
      });

      if (xButton) {
        await user.click(xButton);
      }

      const input = screen.getByPlaceholderText(/search users, posts, listings/i);
      expect(input).toHaveValue('');
    });
  });
});
