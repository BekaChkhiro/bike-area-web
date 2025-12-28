import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';

import AccountSettingsPage from '@/app/(main)/settings/account/page';
import { render } from '../../utils/test-utils';
import { mockUser } from '../../mocks/handlers';
import { setMockSession, mockToast } from '../../setup';

// Mock the useCurrentUser hook
vi.mock('@/lib/api/hooks/use-user', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>;
  return {
    ...actual,
    useCurrentUser: () => ({
      data: mockUser,
      isLoading: false,
    }),
  };
});

describe('AccountSettingsPage', () => {
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

  describe('Email Section', () => {
    it('displays email address card', () => {
      render(<AccountSettingsPage />);

      expect(screen.getByText('Email Address')).toBeInTheDocument();
      expect(
        screen.getByText(/your email address is used for login/i)
      ).toBeInTheDocument();
    });

    it('shows email as disabled input', () => {
      render(<AccountSettingsPage />);

      const emailInput = screen.getByDisplayValue(mockUser.email);
      expect(emailInput).toBeDisabled();
    });

    it('shows verified badge when user is verified', () => {
      render(<AccountSettingsPage />);

      expect(screen.getByText('Verified')).toBeInTheDocument();
    });
  });

  describe('Account Settings Form', () => {
    it('displays account settings card', () => {
      render(<AccountSettingsPage />);

      expect(screen.getByText('Account Settings')).toBeInTheDocument();
      expect(
        screen.getByText(/update your phone number and language/i)
      ).toBeInTheDocument();
    });

    it('renders phone number field', () => {
      render(<AccountSettingsPage />);

      expect(screen.getByText('Phone Number')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/\+1 \(555\)/i)).toBeInTheDocument();
    });

    it('renders language selector', () => {
      render(<AccountSettingsPage />);

      expect(screen.getByText('Language')).toBeInTheDocument();
    });

    it('shows Save Changes button', () => {
      render(<AccountSettingsPage />);

      expect(
        screen.getByRole('button', { name: /save changes/i })
      ).toBeInTheDocument();
    });

    it('submits form and shows success toast', async () => {
      const { user } = render(<AccountSettingsPage />);

      const phoneInput = screen.getByPlaceholderText(/\+1 \(555\)/i);
      await user.type(phoneInput, '+1 (555) 123-4567');

      await user.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(
        () => {
          expect(mockToast.success).toHaveBeenCalledWith(
            'Account settings updated'
          );
        },
        { timeout: 2000 }
      );
    });
  });

  describe('Danger Zone', () => {
    it('displays danger zone card', () => {
      render(<AccountSettingsPage />);

      expect(screen.getByText('Danger Zone')).toBeInTheDocument();
      expect(
        screen.getByText(/irreversible and destructive actions/i)
      ).toBeInTheDocument();
    });

    it('shows delete account button', () => {
      render(<AccountSettingsPage />);

      expect(
        screen.getByRole('button', { name: /delete account/i })
      ).toBeInTheDocument();
    });

    it('opens delete account dialog when clicking delete button', async () => {
      const { user } = render(<AccountSettingsPage />);

      await user.click(screen.getByRole('button', { name: /delete account/i }));

      await waitFor(() => {
        // Check for dialog content
        expect(screen.getByText(/we're sorry to see you go/i)).toBeInTheDocument();
      });
    });
  });
});
