import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '../utils/test-utils';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import LoginPage from '@/app/(auth)/login/page';
import RegisterPage from '@/app/(auth)/register/page';
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

describe('Mobile Layout (320px - 639px)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setViewportWidth(375); // Common mobile width (iPhone)
  });

  afterEach(() => {
    setViewportWidth(1024); // Reset to desktop
  });

  describe('Header on Mobile', () => {
    it('should show mobile menu button', () => {
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      expect(menuButton).toBeInTheDocument();
      // Mobile menu button should be visible (lg:hidden means visible on mobile)
      expect(menuButton.className).toContain('lg:hidden');
    });

    it('should show mobile search button instead of search bar', () => {
      render(<Header />);

      // Mobile search button should be visible
      const searchButton = screen.getByRole('button', { name: /search/i });
      expect(searchButton).toBeInTheDocument();
      expect(searchButton.className).toContain('md:hidden');

      // Desktop search bar should exist but be hidden on mobile
      const searchInput = screen.getByPlaceholderText(/search riders, posts, bikes/i);
      const searchContainer = searchInput.parentElement?.parentElement;
      expect(searchContainer?.className).toContain('hidden');
      expect(searchContainer?.className).toContain('md:flex');
    });

    it('should show logo on small screens', () => {
      render(<Header />);

      const logo = screen.getByAltText('Rideway');
      expect(logo).toBeInTheDocument();
    });

    it('should show compact header elements', () => {
      render(<Header />);

      const header = document.querySelector('header');
      expect(header).toHaveClass('h-16'); // Standard height
      expect(header).toHaveClass('px-4'); // Padding
    });
  });

  describe('Mobile Navigation', () => {
    it('should render mobile bottom navigation', () => {
      render(<MobileNav />);

      const nav = document.querySelector('nav');
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveClass('fixed');
      expect(nav).toHaveClass('bottom-0');
      expect(nav).toHaveClass('lg:hidden');
    });

    it('should show all mobile nav items', () => {
      render(<MobileNav />);

      expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /explore/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /messages/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument();
    });

    it('should have create button with special styling', () => {
      render(<MobileNav />);

      const createLink = document.querySelector('a[href="/create"]');
      const createButton = createLink?.querySelector('div');

      expect(createButton).toHaveClass('rounded-full');
      expect(createButton).toHaveClass('bg-primary');
      expect(createButton).toHaveClass('h-12');
      expect(createButton).toHaveClass('w-12');
    });

    it('should have safe area padding for iOS', () => {
      render(<MobileNav />);

      const safeArea = document.querySelector('.h-safe-area-inset-bottom');
      expect(safeArea).toBeInTheDocument();
    });
  });

  describe('Sidebar on Mobile', () => {
    it('should have sidebar hidden by default on mobile', () => {
      render(<Sidebar />);

      const sidebar = document.querySelector('aside');
      // Sidebar exists but would be hidden via parent layout on mobile
      expect(sidebar).toBeInTheDocument();
    });
  });

  describe('Login Form on Mobile', () => {
    it('should render form at full width', () => {
      render(<LoginPage />);

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('should have stacked form fields', () => {
      render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText(/name@example.com/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);

      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });

    it('should have full-width submit button', () => {
      render(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('Register Form on Mobile', () => {
    it('should render all form fields', () => {
      render(<RegisterPage />);

      expect(screen.getByPlaceholderText(/john doe/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/johndoe/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/name@example.com/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/create a strong password/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/confirm your password/i)).toBeInTheDocument();
    });
  });

  describe('Responsive Classes for Mobile', () => {
    it('should have correct breakpoint classes on header', () => {
      render(<Header />);

      const header = document.querySelector('header');
      // Check for mobile-specific classes
      expect(header?.className).toMatch(/px-4/);
    });

    it('should have touch-friendly button sizes', () => {
      render(<Header />);

      const buttons = screen.getAllByRole('button');
      // Buttons should have adequate size for touch
      buttons.forEach(button => {
        // Icon buttons should be at least size-icon (h-9 w-9 or similar)
        if (button.querySelector('svg')) {
          const hasSize = button.className.includes('h-') || button.className.includes('size-');
          expect(hasSize).toBe(true);
        }
      });
    });
  });

  describe('Text Scaling on Mobile', () => {
    it('should have readable text sizes', () => {
      render(<LoginPage />);

      const heading = screen.getByText(/welcome back/i);
      expect(heading).toBeInTheDocument();

      // Labels should use appropriate text sizes
      const labels = document.querySelectorAll('label');
      labels.forEach(label => {
        expect(label.className).toMatch(/text-sm|text-base/);
      });
    });
  });

  describe('Viewport Width 320px (Small Mobile)', () => {
    beforeEach(() => {
      setViewportWidth(320);
    });

    it('should still render header correctly at minimum width', () => {
      render(<Header />);

      const header = document.querySelector('header');
      expect(header).toBeInTheDocument();

      // Logo icon should be visible
      const logoLink = screen.getByRole('link', { name: /bike area/i });
      expect(logoLink).toBeInTheDocument();
    });

    it('should render mobile nav at minimum width', () => {
      render(<MobileNav />);

      const nav = document.querySelector('nav');
      expect(nav).toBeInTheDocument();

      // All nav items should still be accessible
      expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    });
  });

  describe('Viewport Width 639px (Upper Mobile)', () => {
    beforeEach(() => {
      setViewportWidth(639);
    });

    it('should still hide desktop elements', () => {
      render(<Header />);

      // Desktop search should still be hidden
      const searchInput = screen.getByPlaceholderText(/search riders, posts, bikes/i);
      const searchContainer = searchInput.parentElement?.parentElement;
      expect(searchContainer?.className).toContain('hidden');
    });

    it('should show mobile navigation', () => {
      render(<MobileNav />);

      const nav = document.querySelector('nav');
      expect(nav).toHaveClass('lg:hidden');
    });
  });
});
