import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';

import SecuritySettingsPage from '@/app/(main)/settings/security/page';
import { render } from '../../utils/test-utils';
import { mockUser } from '../../mocks/handlers';
import { setMockSession, mockToast } from '../../setup';

describe('SecuritySettingsPage', () => {
  beforeEach(() => {
    setMockSession({
      data: {
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.fullName,
          username: mockUser.username,
        },
        accessToken: 'mock-token',
      },
      status: 'authenticated',
    });
  });

  describe('Change Password', () => {
    it('displays change password card', () => {
      render(<SecuritySettingsPage />);

      // "Change Password" appears as both card title and button
      const changePasswordTexts = screen.getAllByText('Change Password');
      expect(changePasswordTexts.length).toBeGreaterThan(0);
      expect(
        screen.getByText(/update your password to keep your account secure/i)
      ).toBeInTheDocument();
    });

    it('renders current password field', () => {
      render(<SecuritySettingsPage />);

      expect(screen.getByText('Current Password')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Enter current password')
      ).toBeInTheDocument();
    });

    it('renders new password field', () => {
      render(<SecuritySettingsPage />);

      expect(screen.getByText('New Password')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Enter new password')
      ).toBeInTheDocument();
    });

    it('renders confirm password field', () => {
      render(<SecuritySettingsPage />);

      expect(screen.getByText('Confirm New Password')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Confirm new password')
      ).toBeInTheDocument();
    });

    it('shows password requirements', () => {
      render(<SecuritySettingsPage />);

      expect(
        screen.getByText(/at least 8 characters with uppercase, lowercase/i)
      ).toBeInTheDocument();
    });

    it('shows Change Password button', () => {
      render(<SecuritySettingsPage />);

      expect(
        screen.getByRole('button', { name: /change password/i })
      ).toBeInTheDocument();
    });

    it('submits password change form', async () => {
      const { user } = render(<SecuritySettingsPage />);

      // Fill in the form
      await user.type(
        screen.getByPlaceholderText('Enter current password'),
        'OldPassword123'
      );
      await user.type(
        screen.getByPlaceholderText('Enter new password'),
        'NewPassword123'
      );
      await user.type(
        screen.getByPlaceholderText('Confirm new password'),
        'NewPassword123'
      );

      await user.click(
        screen.getByRole('button', { name: /change password/i })
      );

      await waitFor(
        () => {
          expect(mockToast.success).toHaveBeenCalledWith(
            'Password changed successfully'
          );
        },
        { timeout: 2000 }
      );
    });

    it('shows loading state during password change', async () => {
      const { user } = render(<SecuritySettingsPage />);

      await user.type(
        screen.getByPlaceholderText('Enter current password'),
        'OldPassword123'
      );
      await user.type(
        screen.getByPlaceholderText('Enter new password'),
        'NewPassword123'
      );
      await user.type(
        screen.getByPlaceholderText('Confirm new password'),
        'NewPassword123'
      );

      await user.click(
        screen.getByRole('button', { name: /change password/i })
      );

      await waitFor(() => {
        expect(screen.getByText('Changing...')).toBeInTheDocument();
      });
    });

    it('shows success state after password change', async () => {
      const { user } = render(<SecuritySettingsPage />);

      await user.type(
        screen.getByPlaceholderText('Enter current password'),
        'OldPassword123'
      );
      await user.type(
        screen.getByPlaceholderText('Enter new password'),
        'NewPassword123'
      );
      await user.type(
        screen.getByPlaceholderText('Confirm new password'),
        'NewPassword123'
      );

      await user.click(
        screen.getByRole('button', { name: /change password/i })
      );

      await waitFor(
        () => {
          expect(screen.getByText('Password Changed')).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });
  });

  describe('Two-Factor Authentication', () => {
    it('displays 2FA card', () => {
      render(<SecuritySettingsPage />);

      // "Two-Factor Authentication" appears twice (card title and inner text)
      const twoFATexts = screen.getAllByText('Two-Factor Authentication');
      expect(twoFATexts.length).toBeGreaterThan(0);
      expect(
        screen.getByText(/add an extra layer of security/i)
      ).toBeInTheDocument();
    });

    it('shows coming soon badge', () => {
      render(<SecuritySettingsPage />);

      // There are multiple "Coming Soon" elements on the page
      const comingSoonBadges = screen.getAllByText('Coming Soon');
      expect(comingSoonBadges.length).toBeGreaterThan(0);
    });
  });

  describe('Active Sessions', () => {
    it('displays active sessions card', () => {
      render(<SecuritySettingsPage />);

      expect(screen.getByText('Active Sessions')).toBeInTheDocument();
      expect(
        screen.getByText(/manage devices where you're currently logged in/i)
      ).toBeInTheDocument();
    });

    it('shows current session', () => {
      render(<SecuritySettingsPage />);

      expect(screen.getByText('Chrome on MacOS')).toBeInTheDocument();
      expect(screen.getByText('Current')).toBeInTheDocument();
    });

    it('shows other sessions', () => {
      render(<SecuritySettingsPage />);

      expect(screen.getByText('Safari on iPhone')).toBeInTheDocument();
      expect(screen.getByText('Batumi, Georgia')).toBeInTheDocument();
    });

    it('shows sign out button for other sessions', () => {
      render(<SecuritySettingsPage />);

      const signOutButtons = screen.getAllByRole('button', {
        name: /sign out/i,
      });
      expect(signOutButtons.length).toBeGreaterThan(0);
    });

    it('shows sign out all sessions button', () => {
      render(<SecuritySettingsPage />);

      expect(
        screen.getByRole('button', { name: /sign out all other sessions/i })
      ).toBeInTheDocument();
    });
  });

  describe('Login History', () => {
    it('displays login history card', () => {
      render(<SecuritySettingsPage />);

      expect(screen.getByText('Login History')).toBeInTheDocument();
      expect(
        screen.getByText(/view your recent login activity/i)
      ).toBeInTheDocument();
    });

    it('shows coming soon message for login history', () => {
      render(<SecuritySettingsPage />);

      expect(
        screen.getByText(/login history will be available in a future update/i)
      ).toBeInTheDocument();
    });
  });
});
