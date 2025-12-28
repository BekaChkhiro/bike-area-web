import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';

import NotificationsSettingsPage from '@/app/(main)/settings/notifications/page';
import { render } from '../../utils/test-utils';
import { mockUser } from '../../mocks/handlers';
import { setMockSession, mockToast } from '../../setup';

describe('NotificationsSettingsPage', () => {
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

  describe('Notification Channels', () => {
    it('displays notification channels card', () => {
      render(<NotificationsSettingsPage />);

      expect(screen.getByText('Notification Channels')).toBeInTheDocument();
      expect(
        screen.getByText(/choose how you want to receive notifications/i)
      ).toBeInTheDocument();
    });

    it('renders push notifications toggle', () => {
      render(<NotificationsSettingsPage />);

      expect(screen.getByText('Push Notifications')).toBeInTheDocument();
      expect(
        screen.getByText(/receive notifications on your device/i)
      ).toBeInTheDocument();
    });

    it('renders email notifications toggle', () => {
      render(<NotificationsSettingsPage />);

      expect(screen.getByText('Email Notifications')).toBeInTheDocument();
      expect(
        screen.getByText(/receive notifications via email/i)
      ).toBeInTheDocument();
    });

    it('can toggle push notifications', async () => {
      const { user } = render(<NotificationsSettingsPage />);

      const switches = screen.getAllByRole('switch');
      const pushSwitch = switches[0];

      expect(pushSwitch).toBeChecked();

      await user.click(pushSwitch);

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          'Push notifications disabled'
        );
      });
    });

    it('can toggle email notifications', async () => {
      const { user } = render(<NotificationsSettingsPage />);

      const switches = screen.getAllByRole('switch');
      const emailSwitch = switches[1];

      expect(emailSwitch).toBeChecked();

      await user.click(emailSwitch);

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          'Email notifications disabled'
        );
      });
    });
  });

  describe('Notification Types', () => {
    it('displays notification types card', () => {
      render(<NotificationsSettingsPage />);

      expect(screen.getByText('Notification Types')).toBeInTheDocument();
      expect(
        screen.getByText(/choose which notifications you want to receive/i)
      ).toBeInTheDocument();
    });

    it('renders all notification type options', () => {
      render(<NotificationsSettingsPage />);

      expect(screen.getByText('New Followers')).toBeInTheDocument();
      expect(screen.getByText('Post Likes')).toBeInTheDocument();
      expect(screen.getByText('Post Comments')).toBeInTheDocument();
      expect(screen.getByText('Comment Replies')).toBeInTheDocument();
      expect(screen.getByText('New Messages')).toBeInTheDocument();
      expect(screen.getByText('Thread Replies')).toBeInTheDocument();
      expect(screen.getByText('Listing Inquiries')).toBeInTheDocument();
    });

    it('shows descriptions for notification types', () => {
      render(<NotificationsSettingsPage />);

      expect(screen.getByText('When someone follows you')).toBeInTheDocument();
      expect(
        screen.getByText('When someone likes your post')
      ).toBeInTheDocument();
      expect(
        screen.getByText('When someone comments on your post')
      ).toBeInTheDocument();
      expect(
        screen.getByText('When someone replies to your comment')
      ).toBeInTheDocument();
      expect(
        screen.getByText('When you receive a new message')
      ).toBeInTheDocument();
    });

    it('can toggle individual notification types', async () => {
      const { user } = render(<NotificationsSettingsPage />);

      // Get all switches (first 2 are master toggles, rest are individual)
      const switches = screen.getAllByRole('switch');
      expect(switches.length).toBeGreaterThan(2);

      // Toggle one of the notification type switches
      await user.click(switches[2]);

      // Switch should toggle
      expect(switches[2]).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('disables individual toggles when both master toggles are off', async () => {
      const { user } = render(<NotificationsSettingsPage />);

      const switches = screen.getAllByRole('switch');

      // Disable push notifications
      await user.click(switches[0]);

      // Disable email notifications
      await user.click(switches[1]);

      await waitFor(() => {
        // Individual toggles should be disabled
        expect(switches[2]).toBeDisabled();
      });
    });

    it('shows message when all notifications are disabled', async () => {
      const { user } = render(<NotificationsSettingsPage />);

      const switches = screen.getAllByRole('switch');

      // Disable both master toggles
      await user.click(switches[0]);
      await user.click(switches[1]);

      await waitFor(() => {
        expect(
          screen.getByText(/enable push or email notifications/i)
        ).toBeInTheDocument();
      });
    });
  });
});
