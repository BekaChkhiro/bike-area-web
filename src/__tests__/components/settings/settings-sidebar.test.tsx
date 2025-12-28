import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';

import { SettingsSidebar, SettingsMobileNav } from '@/components/settings/settings-sidebar';
import { render } from '../../utils/test-utils';

describe('SettingsSidebar', () => {
  describe('Desktop Navigation', () => {
    it('renders all navigation items', () => {
      render(<SettingsSidebar />);

      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      expect(screen.getByText('Account')).toBeInTheDocument();
      expect(screen.getByText('Privacy')).toBeInTheDocument();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Security')).toBeInTheDocument();
      expect(screen.getByText('Blocked Users')).toBeInTheDocument();
    });

    it('has correct links for each navigation item', () => {
      render(<SettingsSidebar />);

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

    it('renders navigation items as links', () => {
      render(<SettingsSidebar />);

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(6);
    });

    it('applies custom className', () => {
      const { container } = render(<SettingsSidebar className="custom-class" />);

      const scrollArea = container.firstChild;
      expect(scrollArea).toHaveClass('custom-class');
    });
  });

  describe('Mobile Navigation', () => {
    it('renders all navigation items', () => {
      render(<SettingsMobileNav />);

      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      expect(screen.getByText('Account')).toBeInTheDocument();
      expect(screen.getByText('Privacy')).toBeInTheDocument();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Security')).toBeInTheDocument();
      expect(screen.getByText('Blocked Users')).toBeInTheDocument();
    });

    it('has correct links for mobile navigation', () => {
      render(<SettingsMobileNav />);

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(6);
    });

    it('applies custom className for mobile nav', () => {
      const { container } = render(<SettingsMobileNav className="mobile-class" />);

      const scrollArea = container.firstChild;
      expect(scrollArea).toHaveClass('mobile-class');
    });
  });

  describe('Navigation Icons', () => {
    it('renders icons for each navigation item', () => {
      render(<SettingsSidebar />);

      // Check that SVG icons are present (each nav item has an icon)
      const navItems = screen.getAllByRole('link');
      navItems.forEach((item) => {
        expect(item.querySelector('svg')).toBeInTheDocument();
      });
    });
  });
});
