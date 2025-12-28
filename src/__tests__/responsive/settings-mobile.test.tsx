import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';

import { render } from '../utils/test-utils';
import { SettingsSidebar, SettingsMobileNav } from '@/components/settings/settings-sidebar';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/settings/profile'),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

describe('Settings Mobile Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/settings/profile');
  });

  describe('SettingsMobileNav', () => {
    it('renders all navigation items', () => {
      render(<SettingsMobileNav />);

      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      expect(screen.getByText('Account')).toBeInTheDocument();
      expect(screen.getByText('Privacy')).toBeInTheDocument();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Security')).toBeInTheDocument();
      expect(screen.getByText('Blocked Users')).toBeInTheDocument();
    });

    it('renders as horizontal scrollable layout', () => {
      const { container } = render(<SettingsMobileNav />);

      // Mobile nav should have horizontal flex layout
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('flex', 'gap-1');
    });

    it('nav items have shrink-0 class for horizontal scroll', () => {
      const { container } = render(<SettingsMobileNav />);

      // Links should not shrink in horizontal scroll
      const links = container.querySelectorAll('a');
      links.forEach((link) => {
        expect(link.className).toContain('shrink-0');
      });
    });

    it('text has whitespace-nowrap for horizontal layout', () => {
      const { container } = render(<SettingsMobileNav />);

      const spans = container.querySelectorAll('nav a span');
      spans.forEach((span) => {
        expect(span.className).toContain('whitespace-nowrap');
      });
    });

    it('highlights active navigation item', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/settings/account');
      render(<SettingsMobileNav />);

      const accountLink = screen.getByText('Account').closest('a');
      expect(accountLink?.className).toContain('bg-muted');
      expect(accountLink?.className).toContain('font-medium');
    });

    it('renders icons for each nav item', () => {
      const { container } = render(<SettingsMobileNav />);

      const icons = container.querySelectorAll('nav a svg');
      expect(icons.length).toBe(6);
    });
  });

  describe('SettingsSidebar (Desktop)', () => {
    it('renders all navigation items vertically', () => {
      render(<SettingsSidebar />);

      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      expect(screen.getByText('Account')).toBeInTheDocument();
      expect(screen.getByText('Privacy')).toBeInTheDocument();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Security')).toBeInTheDocument();
      expect(screen.getByText('Blocked Users')).toBeInTheDocument();
    });

    it('renders as vertical flex layout', () => {
      const { container } = render(<SettingsSidebar />);

      // Desktop sidebar should have vertical flex layout
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('flex', 'flex-col');
    });

    it('highlights active navigation item', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/settings/privacy');
      render(<SettingsSidebar />);

      const privacyLink = screen.getByText('Privacy').closest('a');
      expect(privacyLink?.className).toContain('bg-muted');
      expect(privacyLink?.className).toContain('font-medium');
    });

    it('inactive items have muted foreground color', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/settings/profile');
      render(<SettingsSidebar />);

      const accountLink = screen.getByText('Account').closest('a');
      expect(accountLink?.className).toContain('text-muted-foreground');
    });

    it('accepts custom className', () => {
      const { container } = render(<SettingsSidebar className="custom-class" />);

      const scrollArea = container.firstChild;
      expect(scrollArea).toHaveClass('custom-class');
    });
  });

  describe('Navigation Links', () => {
    it('links to correct settings pages', () => {
      render(<SettingsMobileNav />);

      expect(screen.getByText('Edit Profile').closest('a')).toHaveAttribute(
        'href',
        '/settings/profile'
      );
      expect(screen.getByText('Account').closest('a')).toHaveAttribute(
        'href',
        '/settings/account'
      );
      expect(screen.getByText('Privacy').closest('a')).toHaveAttribute(
        'href',
        '/settings/privacy'
      );
      expect(screen.getByText('Notifications').closest('a')).toHaveAttribute(
        'href',
        '/settings/notifications'
      );
      expect(screen.getByText('Security').closest('a')).toHaveAttribute(
        'href',
        '/settings/security'
      );
      expect(screen.getByText('Blocked Users').closest('a')).toHaveAttribute(
        'href',
        '/settings/blocked'
      );
    });
  });
});
