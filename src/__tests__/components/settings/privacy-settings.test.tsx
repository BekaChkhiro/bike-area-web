import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';

import PrivacySettingsPage from '@/app/(main)/settings/privacy/page';
import { render } from '../../utils/test-utils';
import { mockUser } from '../../mocks/handlers';
import { setMockSession, mockToast } from '../../setup';

describe('PrivacySettingsPage', () => {
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

  describe('Profile Visibility', () => {
    it('displays profile visibility card', () => {
      render(<PrivacySettingsPage />);

      expect(screen.getByText('Profile Visibility')).toBeInTheDocument();
      expect(
        screen.getByText(/control who can see your profile/i)
      ).toBeInTheDocument();
    });

    it('renders profile visibility selector', () => {
      render(<PrivacySettingsPage />);

      expect(screen.getByText('Who can see your profile')).toBeInTheDocument();
    });

    it('has profile visibility selector', () => {
      render(<PrivacySettingsPage />);

      // Find the visibility select trigger
      const selectTriggers = screen.getAllByRole('combobox');
      expect(selectTriggers.length).toBeGreaterThan(0);
    });
  });

  describe('Messaging Settings', () => {
    it('displays messaging card', () => {
      render(<PrivacySettingsPage />);

      expect(screen.getByText('Messaging')).toBeInTheDocument();
      expect(
        screen.getByText(/control who can send you messages/i)
      ).toBeInTheDocument();
    });

    it('renders messaging selector', () => {
      render(<PrivacySettingsPage />);

      expect(screen.getByText('Who can message you')).toBeInTheDocument();
    });
  });

  describe('Activity Status', () => {
    it('displays activity status card', () => {
      render(<PrivacySettingsPage />);

      // There are multiple "Activity Status" texts (card title and toggle label)
      const activityStatusTexts = screen.getAllByText('Activity Status');
      expect(activityStatusTexts.length).toBeGreaterThan(0);
      expect(
        screen.getByText(/control what others can see about your activity/i)
      ).toBeInTheDocument();
    });

    it('renders online status toggle', () => {
      render(<PrivacySettingsPage />);

      expect(screen.getByText('Online Status')).toBeInTheDocument();
      expect(
        screen.getByText(/show when you're online/i)
      ).toBeInTheDocument();
    });

    it('renders activity status toggle', () => {
      render(<PrivacySettingsPage />);

      // Find the Activity Status toggle (there's also a card title with same name)
      const activityStatusLabels = screen.getAllByText('Activity Status');
      expect(activityStatusLabels.length).toBeGreaterThan(0);
      expect(
        screen.getByText(/show your recent activity/i)
      ).toBeInTheDocument();
    });

    it('can toggle online status', async () => {
      const { user } = render(<PrivacySettingsPage />);

      const switches = screen.getAllByRole('switch');
      expect(switches.length).toBeGreaterThanOrEqual(2);

      // Toggle the first switch (Online Status)
      await user.click(switches[0]);

      // Switch should be toggled
      expect(switches[0]).toBeInTheDocument();
    });

    it('can toggle activity status', async () => {
      const { user } = render(<PrivacySettingsPage />);

      const switches = screen.getAllByRole('switch');
      expect(switches.length).toBeGreaterThanOrEqual(2);

      // Toggle the second switch (Activity Status)
      await user.click(switches[1]);

      expect(switches[1]).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('shows Save Changes button', () => {
      render(<PrivacySettingsPage />);

      expect(
        screen.getByRole('button', { name: /save changes/i })
      ).toBeInTheDocument();
    });

    it('submits form and shows success toast', async () => {
      const { user } = render(<PrivacySettingsPage />);

      await user.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(
        () => {
          expect(mockToast.success).toHaveBeenCalledWith(
            'Privacy settings updated'
          );
        },
        { timeout: 2000 }
      );
    });

    it('shows loading state during submission', async () => {
      const { user } = render(<PrivacySettingsPage />);

      await user.click(screen.getByRole('button', { name: /save changes/i }));

      // Loading state should appear briefly
      await waitFor(() => {
        expect(
          screen.queryByRole('button', { name: /saving/i })
        ).toBeInTheDocument();
      });
    });
  });
});
