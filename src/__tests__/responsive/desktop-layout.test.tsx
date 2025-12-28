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

describe('Desktop Layout (1024px+)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setViewportWidth(1280); // Standard desktop
  });

  afterEach(() => {
    setViewportWidth(1024);
  });

  describe('Header on Desktop', () => {
    it('should hide mobile menu button on desktop', () => {
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      // lg:hidden means hidden on lg+
      expect(menuButton.className).toContain('lg:hidden');
    });

    it('should show expanded search bar', () => {
      render(<Header />);

      const searchInput = screen.getByPlaceholderText(/search riders, posts, bikes/i);
      const searchContainer = searchInput.parentElement?.parentElement;

      expect(searchContainer?.className).toContain('lg:max-w-lg');
    });

    it('should show full logo', () => {
      render(<Header />);

      const logo = screen.getByAltText('Rideway');
      expect(logo).toBeInTheDocument();
    });

    it('should display all header actions', () => {
      render(<Header />);

      // Theme toggle
      expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();

      // Notifications
      expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();

      // User menu (avatar button)
      const avatarButtons = screen.getAllByRole('button');
      const avatarButton = avatarButtons.find(btn =>
        btn.className.includes('rounded-full')
      );
      expect(avatarButton).toBeDefined();
    });
  });

  describe('Sidebar on Desktop', () => {
    it('should render full sidebar', () => {
      render(<Sidebar />);

      const sidebar = document.querySelector('aside');
      expect(sidebar).toBeInTheDocument();
    });

    it('should show all navigation items with labels', () => {
      render(<Sidebar isCollapsed={false} />);

      expect(screen.getByText('Feed')).toBeInTheDocument();
      expect(screen.getByText('Explore')).toBeInTheDocument();
      expect(screen.getByText('Marketplace')).toBeInTheDocument();
      expect(screen.getByText('Parts')).toBeInTheDocument();
      expect(screen.getByText('Forum')).toBeInTheDocument();
      expect(screen.getByText('Services')).toBeInTheDocument();
      expect(screen.getByText('Messages')).toBeInTheDocument();
    });

    it('should have expanded width by default', () => {
      render(<Sidebar isCollapsed={false} />);

      const sidebar = document.querySelector('aside');
      expect(sidebar).toHaveClass('w-64');
    });

    it('should support collapse toggle', () => {
      const onToggle = vi.fn();
      render(<Sidebar isCollapsed={false} onToggle={onToggle} />);

      const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('should show user section with profile info', () => {
      render(<Sidebar isCollapsed={false} />);

      expect(screen.getByText('View profile')).toBeInTheDocument();
    });
  });

  describe('Mobile Navigation on Desktop', () => {
    it('should hide mobile bottom navigation on desktop', () => {
      render(<MobileNav />);

      const nav = document.querySelector('nav');
      // lg:hidden means hidden on lg+
      expect(nav).toHaveClass('lg:hidden');
    });
  });

  describe('Forms on Desktop', () => {
    it('should render centered form card', () => {
      render(<LoginPage />);

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('should have desktop text sizing', () => {
      render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText(/name@example.com/i);
      expect(emailInput.className).toContain('md:text-sm');
    });
  });

  describe('Viewport Width 1024px (Lower Desktop)', () => {
    beforeEach(() => {
      setViewportWidth(1024);
    });

    it('should hide mobile menu button at lg breakpoint', () => {
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      expect(menuButton.className).toContain('lg:hidden');
    });

    it('should hide mobile nav at lg breakpoint', () => {
      render(<MobileNav />);

      const nav = document.querySelector('nav');
      expect(nav).toHaveClass('lg:hidden');
    });
  });

  describe('Viewport Width 1280px (Standard Desktop)', () => {
    beforeEach(() => {
      setViewportWidth(1280);
    });

    it('should show full header layout', () => {
      render(<Header />);

      const header = document.querySelector('header');
      expect(header).toBeInTheDocument();

      // All elements visible
      expect(screen.getByPlaceholderText(/search riders, posts, bikes/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
    });

    it('should show expanded sidebar', () => {
      render(<Sidebar isCollapsed={false} />);

      const sidebar = document.querySelector('aside');
      expect(sidebar).toHaveClass('w-64');

      // All labels visible
      expect(screen.getByText('Feed')).toBeInTheDocument();
    });
  });

  describe('Viewport Width 1920px (Large Desktop)', () => {
    beforeEach(() => {
      setViewportWidth(1920);
    });

    it('should render correctly at large desktop size', () => {
      render(<Header />);

      const header = document.querySelector('header');
      expect(header).toBeInTheDocument();
    });

    it('should maintain sidebar width at large screens', () => {
      render(<Sidebar isCollapsed={false} />);

      const sidebar = document.querySelector('aside');
      expect(sidebar).toHaveClass('w-64');
    });
  });

  describe('Desktop Layout Components', () => {
    it('should have proper sticky header', () => {
      render(<Header />);

      const header = document.querySelector('header');
      expect(header).toHaveClass('sticky');
      expect(header).toHaveClass('top-0');
      expect(header).toHaveClass('z-50');
    });

    it('should have sidebar with border', () => {
      render(<Sidebar />);

      const sidebar = document.querySelector('aside');
      expect(sidebar).toHaveClass('border-r');
    });

    it('should have sidebar with full height', () => {
      render(<Sidebar />);

      const sidebar = document.querySelector('aside');
      expect(sidebar).toHaveClass('h-full');
    });
  });

  describe('Desktop Hover States', () => {
    it('should have hover effects on buttons', () => {
      render(<Header />);

      const buttons = screen.getAllByRole('button');
      // Ghost buttons should have hover states
      buttons.forEach(button => {
        if (button.className.includes('ghost')) {
          expect(button.className).toContain('hover:');
        }
      });
    });

    it('should have hover effects on navigation links', () => {
      render(<Sidebar />);

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        const button = link.querySelector('button');
        if (button) {
          expect(button.className).toContain('hover:');
        }
      });
    });
  });

  describe('Desktop Dropdown Menus', () => {
    it('should have user dropdown menu', async () => {
      const { user } = render(<Header />);

      const avatarButtons = screen.getAllByRole('button');
      const avatarButton = avatarButtons.find(btn =>
        btn.className.includes('rounded-full')
      );

      if (avatarButton) {
        await user.click(avatarButton);

        expect(screen.getByRole('menu')).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: /profile/i })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: /settings/i })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: /log out/i })).toBeInTheDocument();
      }
    });
  });

  describe('Content Width Constraints', () => {
    it('should have constrained search bar width', () => {
      render(<Header />);

      const searchInput = screen.getByPlaceholderText(/search riders, posts, bikes/i);
      const searchContainer = searchInput.parentElement?.parentElement;

      expect(searchContainer?.className).toContain('max-w-');
    });
  });
});
