import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '../utils/test-utils';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import LoginPage from '@/app/(auth)/login/page';
import { mockRouter } from '../setup';

// Mock useLogout hook
vi.mock('@/lib/api/hooks', () => ({
  useLogout: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    resolvedTheme: 'light',
    setTheme: vi.fn(),
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock usePathname
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation');
  return {
    ...actual,
    usePathname: () => '/feed',
    useRouter: () => mockRouter,
    useSearchParams: () => new URLSearchParams(),
  };
});

// Helper to set viewport width
const setViewportWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event('resize'));
};

describe('Tablet Layout (640px - 1023px)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setViewportWidth(768); // Common tablet width (iPad)
  });

  afterEach(() => {
    setViewportWidth(1024); // Reset to desktop
  });

  describe('Header on Tablet', () => {
    it('should show search bar on medium screens', () => {
      render(<Header />);

      const searchInput = screen.getByPlaceholderText(/search riders, posts, bikes/i);
      const searchContainer = searchInput.parentElement?.parentElement;

      // md:flex means visible on medium+
      expect(searchContainer?.className).toContain('md:flex');
    });

    it('should hide mobile search button on tablet', () => {
      render(<Header />);

      const searchButton = screen.getByRole('button', { name: /search/i });
      // md:hidden means hidden on medium+
      expect(searchButton.className).toContain('md:hidden');
    });

    it('should still show mobile menu button on tablet (below lg)', () => {
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      // lg:hidden means still visible on md
      expect(menuButton.className).toContain('lg:hidden');
    });

    it('should show logo on tablet', () => {
      render(<Header />);

      const logo = screen.getByAltText('Rideway');
      expect(logo).toBeInTheDocument();
    });

    it('should have search bar with medium max-width', () => {
      render(<Header />);

      const searchInput = screen.getByPlaceholderText(/search riders, posts, bikes/i);
      const searchContainer = searchInput.parentElement?.parentElement;

      expect(searchContainer?.className).toContain('md:max-w-md');
      expect(searchContainer?.className).toContain('lg:max-w-lg');
    });
  });

  describe('Sidebar on Tablet', () => {
    it('should render sidebar', () => {
      render(<Sidebar />);

      const sidebar = document.querySelector('aside');
      expect(sidebar).toBeInTheDocument();
    });

    it('should show all navigation items', () => {
      render(<Sidebar />);

      expect(screen.getByRole('link', { name: /feed/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /explore/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /marketplace/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /parts/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /forum/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /services/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /messages/i })).toBeInTheDocument();
    });

    it('should support collapsed state for more content space', () => {
      render(<Sidebar isCollapsed={true} />);

      const sidebar = document.querySelector('aside');
      expect(sidebar).toHaveClass('w-16');
    });

    it('should support expanded state', () => {
      render(<Sidebar isCollapsed={false} />);

      const sidebar = document.querySelector('aside');
      expect(sidebar).toHaveClass('w-64');
    });
  });

  describe('Mobile Navigation on Tablet', () => {
    it('should still show mobile nav below lg breakpoint', () => {
      render(<MobileNav />);

      const nav = document.querySelector('nav');
      expect(nav).toHaveClass('lg:hidden');
    });
  });

  describe('Forms on Tablet', () => {
    it('should render login form with appropriate width', () => {
      render(<LoginPage />);

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('should have readable input sizes', () => {
      render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText(/name@example.com/i);
      // md:text-sm for better readability
      expect(emailInput.className).toContain('md:text-sm');
    });
  });

  describe('Viewport Width 640px (Lower Tablet)', () => {
    beforeEach(() => {
      setViewportWidth(640);
    });

    it('should show search bar at md breakpoint', () => {
      render(<Header />);

      const searchInput = screen.getByPlaceholderText(/search riders, posts, bikes/i);
      const searchContainer = searchInput.parentElement?.parentElement;
      expect(searchContainer?.className).toContain('md:flex');
    });

    it('should hide mobile search button at md breakpoint', () => {
      render(<Header />);

      const searchButton = screen.getByRole('button', { name: /search/i });
      expect(searchButton.className).toContain('md:hidden');
    });
  });

  describe('Viewport Width 768px (Standard Tablet)', () => {
    beforeEach(() => {
      setViewportWidth(768);
    });

    it('should render header with tablet layout', () => {
      render(<Header />);

      const header = document.querySelector('header');
      expect(header).toBeInTheDocument();

      // Search bar visible
      const searchInput = screen.getByPlaceholderText(/search riders, posts, bikes/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('should render sidebar', () => {
      render(<Sidebar />);

      const sidebar = document.querySelector('aside');
      expect(sidebar).toBeInTheDocument();
    });
  });

  describe('Viewport Width 1023px (Upper Tablet)', () => {
    beforeEach(() => {
      setViewportWidth(1023);
    });

    it('should still show mobile menu button', () => {
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      // Still visible because lg breakpoint starts at 1024
      expect(menuButton.className).toContain('lg:hidden');
    });

    it('should still show mobile bottom nav', () => {
      render(<MobileNav />);

      const nav = document.querySelector('nav');
      expect(nav).toHaveClass('lg:hidden');
    });
  });

  describe('Touch Interactions on Tablet', () => {
    it('should have adequate touch targets', () => {
      render(<Header />);

      const buttons = screen.getAllByRole('button');
      // All buttons should have size classes
      buttons.forEach(button => {
        expect(button.className.length).toBeGreaterThan(0);
      });
    });

    it('should have clickable navigation items', () => {
      render(<Sidebar />);

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAttribute('href');
      });
    });
  });

  describe('Layout Grid on Tablet', () => {
    it('should have sidebar with proper width classes', () => {
      render(<Sidebar isCollapsed={false} />);

      const sidebar = document.querySelector('aside');
      expect(sidebar).toHaveClass('w-64');
    });

    it('should allow content area flexibility', () => {
      render(<Sidebar />);

      const sidebar = document.querySelector('aside');
      expect(sidebar).toHaveClass('flex');
      expect(sidebar).toHaveClass('flex-col');
    });
  });
});
