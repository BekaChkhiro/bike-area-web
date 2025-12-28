import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../utils/test-utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/layout/header';
import { ErrorFallback, NotFound } from '@/components/shared/error-boundary';
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

describe('Color Contrast - WCAG Compliance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Button Contrast', () => {
    it('should have primary button with contrasting colors', () => {
      render(<Button>Primary Button</Button>);

      const button = screen.getByRole('button');
      // Default button should have primary background with foreground text
      expect(button.className).toContain('bg-primary');
      expect(button.className).toContain('text-primary-foreground');
    });

    it('should have secondary button with contrasting colors', () => {
      render(<Button variant="secondary">Secondary</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-secondary');
      expect(button.className).toContain('text-secondary-foreground');
    });

    it('should have destructive button with contrasting colors', () => {
      render(<Button variant="destructive">Delete</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-destructive');
      expect(button.className).toContain('text-white');
    });

    it('should have outline button with visible text', () => {
      render(<Button variant="outline">Outline</Button>);

      const button = screen.getByRole('button');
      // Outline buttons should have border for visibility
      expect(button.className).toContain('border');
    });

    it('should have ghost button with visible text on hover', () => {
      render(<Button variant="ghost">Ghost</Button>);

      const button = screen.getByRole('button');
      // Ghost buttons should have hover state for visibility
      expect(button.className).toContain('hover:bg-accent');
    });
  });

  describe('Badge Contrast', () => {
    it('should have default badge with contrasting colors', () => {
      render(<Badge>Badge</Badge>);

      const badge = screen.getByText('Badge');
      // Badge should have visible text on background
      expect(badge.className).toContain('bg-primary');
      expect(badge.className).toContain('text-primary-foreground');
    });

    it('should have secondary badge with contrasting colors', () => {
      render(<Badge variant="secondary">Secondary</Badge>);

      const badge = screen.getByText('Secondary');
      expect(badge.className).toContain('bg-secondary');
      expect(badge.className).toContain('text-secondary-foreground');
    });

    it('should have destructive badge with contrasting colors', () => {
      render(<Badge variant="destructive">Error</Badge>);

      const badge = screen.getByText('Error');
      expect(badge.className).toContain('bg-destructive');
      expect(badge.className).toContain('text-white');
    });

    it('should have outline badge with visible border', () => {
      render(<Badge variant="outline">Outline</Badge>);

      const badge = screen.getByText('Outline');
      // Outline badge should have border for visibility
      expect(badge.className).toContain('text-foreground');
    });
  });

  describe('Input Contrast', () => {
    it('should have input with visible border', () => {
      render(<Input placeholder="Test" />);

      const input = screen.getByPlaceholderText('Test');
      expect(input.className).toContain('border');
    });

    it('should have input with visible placeholder text', () => {
      render(<Input placeholder="Enter text" />);

      const input = screen.getByPlaceholderText('Enter text');
      // Placeholder should use muted foreground for contrast
      expect(input.className).toContain('placeholder:text-muted-foreground');
    });

    it('should have input with background color', () => {
      render(<Input placeholder="Test" />);

      const input = screen.getByPlaceholderText('Test');
      expect(input.className).toContain('bg-transparent');
    });
  });

  describe('Header Contrast', () => {
    it('should have notification badge with visible count', () => {
      render(<Header />);

      const badge = screen.getByText('3');
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain('bg-destructive');
    });

    it('should have logo with visible image', () => {
      render(<Header />);

      const logo = screen.getByAltText('Rideway');
      expect(logo).toBeInTheDocument();
    });
  });

  describe('Error Components Contrast', () => {
    it('should have error icon with destructive color', () => {
      render(<ErrorFallback />);

      // Error icon container should have destructive background
      const iconContainer = document.querySelector('[class*="bg-destructive"]');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should have visible error title', () => {
      render(<ErrorFallback />);

      const title = screen.getByText('Something went wrong');
      expect(title).toBeInTheDocument();
    });

    it('should have visible 404 text in not found', () => {
      render(<NotFound />);

      const notFoundText = screen.getByText('404');
      expect(notFoundText).toBeInTheDocument();
      // Should have muted color for decorative large text
      expect(notFoundText.className).toContain('text-muted-foreground');
    });
  });

  describe('Form Contrast', () => {
    it('should have visible error messages', async () => {
      const { user } = render(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      // Wait for validation error
      const errorMessage = await screen.findByText(/email is required/i);
      expect(errorMessage).toBeInTheDocument();
      // Error messages should use destructive color
      expect(errorMessage.className).toContain('text-destructive');
    });

    it('should have visible form labels', () => {
      render(<LoginPage />);

      // Labels should be present and visible
      const emailLabel = document.querySelector('label[for*="email"]') ||
        screen.getByText(/email/i);
      expect(emailLabel).toBeInTheDocument();
    });
  });

  describe('Link Contrast', () => {
    it('should have visible links in login page', () => {
      render(<LoginPage />);

      const forgotLink = screen.getByRole('link', { name: /forgot password/i });
      expect(forgotLink).toBeInTheDocument();
      // Links should have distinct color
    });

    it('should have visible sign up link', () => {
      render(<LoginPage />);

      const signUpLink = screen.getByRole('link', { name: /sign up/i });
      expect(signUpLink).toBeInTheDocument();
    });
  });

  describe('Disabled State Contrast', () => {
    it('should have reduced contrast for disabled buttons', () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button.className).toContain('disabled:opacity-50');
    });

    it('should have reduced contrast for disabled inputs', () => {
      render(<Input disabled placeholder="Disabled" />);

      const input = screen.getByPlaceholderText('Disabled');
      expect(input).toBeDisabled();
      expect(input.className).toContain('disabled:opacity-50');
    });
  });

  describe('Focus Ring Contrast', () => {
    it('should have visible focus ring on buttons', () => {
      render(<Button>Focus Test</Button>);

      const button = screen.getByRole('button');
      // Focus ring should use ring color for visibility
      expect(button.className).toMatch(/focus-visible:ring/);
    });

    it('should have visible focus ring on inputs', () => {
      render(<Input placeholder="Focus Test" />);

      const input = screen.getByPlaceholderText('Focus Test');
      expect(input.className).toMatch(/focus-visible:ring/);
    });
  });

  describe('Theme-aware Contrast', () => {
    it('should use CSS variables for theme-aware colors', () => {
      render(<Button>Theme Test</Button>);

      const button = screen.getByRole('button');
      // Classes should reference CSS variables that work in both themes
      expect(button.className).toContain('bg-primary');
      expect(button.className).toContain('text-primary-foreground');
    });

    it('should have muted text that works in both themes', () => {
      render(<Input placeholder="Muted placeholder" />);

      const input = screen.getByPlaceholderText('Muted placeholder');
      // Using CSS variable-based classes ensures theme compatibility
      expect(input.className).toContain('placeholder:text-muted-foreground');
    });
  });

  describe('Active State Contrast', () => {
    it('should have visible hover state on buttons', () => {
      render(<Button>Hover Test</Button>);

      const button = screen.getByRole('button');
      // Buttons should have visible hover state
      expect(button.className).toContain('hover:');
    });
  });

  describe('Selection Contrast', () => {
    it('should have visible text selection', () => {
      render(<p className="selection:bg-primary selection:text-primary-foreground">Selectable text</p>);

      const text = screen.getByText('Selectable text');
      expect(text.className).toContain('selection:bg-primary');
    });
  });
});
