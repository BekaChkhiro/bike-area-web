import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';

import { ProfileActions } from '@/components/profile/profile-actions';
import { render } from '../../utils/test-utils';
import { mockUser, mockOtherUser } from '../../mocks/handlers';
import { setMockSession, mockRouter, mockToast } from '../../setup';

describe('ProfileActions', () => {
  beforeEach(() => {
    // Set up authenticated session
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

  describe('Own Profile Actions', () => {
    it('shows Edit Profile button for own profile', () => {
      render(
        <ProfileActions
          user={mockUser}
          currentUserId={mockUser.id}
          isOwnProfile={true}
        />
      );

      expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
    });

    it('navigates to settings when Edit Profile is clicked', async () => {
      const { user } = render(
        <ProfileActions
          user={mockUser}
          currentUserId={mockUser.id}
          isOwnProfile={true}
        />
      );

      await user.click(screen.getByRole('button', { name: /edit profile/i }));

      expect(mockRouter.push).toHaveBeenCalledWith('/settings/profile');
    });

    it('shows Share button for own profile', async () => {
      const { user } = render(
        <ProfileActions
          user={mockUser}
          currentUserId={mockUser.id}
          isOwnProfile={true}
        />
      );

      // The share button has Share2 icon
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(2); // Edit Profile + Share
    });

    it('does not show Follow button for own profile', () => {
      render(
        <ProfileActions
          user={mockUser}
          currentUserId={mockUser.id}
          isOwnProfile={true}
        />
      );

      expect(screen.queryByRole('button', { name: /follow/i })).not.toBeInTheDocument();
    });

    it('does not show Message button for own profile', () => {
      render(
        <ProfileActions
          user={mockUser}
          currentUserId={mockUser.id}
          isOwnProfile={true}
        />
      );

      // No message icon button should be present
      const buttons = screen.getAllByRole('button');
      // Only Edit Profile and Share buttons
      expect(buttons.length).toBe(2);
    });
  });

  describe('Other User Profile Actions', () => {
    it('shows Follow button for other user', () => {
      render(
        <ProfileActions
          user={mockOtherUser}
          currentUserId={mockUser.id}
          isOwnProfile={false}
        />
      );

      expect(screen.getByRole('button', { name: /follow/i })).toBeInTheDocument();
    });

    it('shows Message button for other user', () => {
      render(
        <ProfileActions
          user={mockOtherUser}
          currentUserId={mockUser.id}
          isOwnProfile={false}
        />
      );

      // There should be multiple buttons including message
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(1);
    });

    it('shows More options menu for other user', () => {
      render(
        <ProfileActions
          user={mockOtherUser}
          currentUserId={mockUser.id}
          isOwnProfile={false}
        />
      );

      // The more options button (MoreHorizontal icon)
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(3); // Follow + Message + More
    });

    it('navigates to messages when Message button is clicked', async () => {
      const { user } = render(
        <ProfileActions
          user={mockOtherUser}
          currentUserId={mockUser.id}
          isOwnProfile={false}
        />
      );

      // Find the message button (second button after follow)
      const buttons = screen.getAllByRole('button');
      const messageButton = buttons[1]; // Follow is first, Message is second

      await user.click(messageButton);

      expect(mockRouter.push).toHaveBeenCalledWith(`/messages?user=${mockOtherUser.id}`);
    });
  });

  describe('More Options Menu', () => {
    it('shows Share Profile option in dropdown', async () => {
      const { user } = render(
        <ProfileActions
          user={mockOtherUser}
          currentUserId={mockUser.id}
          isOwnProfile={false}
        />
      );

      // Click the more options button
      const buttons = screen.getAllByRole('button');
      const moreButton = buttons[buttons.length - 1]; // Last button is More

      await user.click(moreButton);

      await waitFor(() => {
        expect(screen.getByText(/share profile/i)).toBeInTheDocument();
      });
    });

    it('shows Copy Link option in dropdown', async () => {
      const { user } = render(
        <ProfileActions
          user={mockOtherUser}
          currentUserId={mockUser.id}
          isOwnProfile={false}
        />
      );

      const buttons = screen.getAllByRole('button');
      const moreButton = buttons[buttons.length - 1];

      await user.click(moreButton);

      await waitFor(() => {
        expect(screen.getByText(/copy link/i)).toBeInTheDocument();
      });
    });

    it('shows Block option in dropdown', async () => {
      const { user } = render(
        <ProfileActions
          user={mockOtherUser}
          currentUserId={mockUser.id}
          isOwnProfile={false}
        />
      );

      const buttons = screen.getAllByRole('button');
      const moreButton = buttons[buttons.length - 1];

      await user.click(moreButton);

      await waitFor(() => {
        expect(screen.getByText(new RegExp(`block @${mockOtherUser.username}`, 'i'))).toBeInTheDocument();
      });
    });

    it('shows Report option in dropdown', async () => {
      const { user } = render(
        <ProfileActions
          user={mockOtherUser}
          currentUserId={mockUser.id}
          isOwnProfile={false}
        />
      );

      const buttons = screen.getAllByRole('button');
      const moreButton = buttons[buttons.length - 1];

      await user.click(moreButton);

      await waitFor(() => {
        expect(screen.getByText(/report/i)).toBeInTheDocument();
      });
    });
  });

  describe('Block User', () => {
    it('opens block confirmation dialog when clicking Block option', async () => {
      const { user } = render(
        <ProfileActions
          user={mockOtherUser}
          currentUserId={mockUser.id}
          isOwnProfile={false}
        />
      );

      // Open dropdown
      const buttons = screen.getAllByRole('button');
      const moreButton = buttons[buttons.length - 1];
      await user.click(moreButton);

      // Click block option
      await waitFor(() => {
        expect(screen.getByText(new RegExp(`block @${mockOtherUser.username}`, 'i'))).toBeInTheDocument();
      });

      await user.click(screen.getByText(new RegExp(`block @${mockOtherUser.username}`, 'i')));

      // Confirmation dialog should appear
      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
        expect(screen.getByText(new RegExp(`block @${mockOtherUser.username}\\?`, 'i'))).toBeInTheDocument();
      });
    });

    it('shows block confirmation message', async () => {
      const { user } = render(
        <ProfileActions
          user={mockOtherUser}
          currentUserId={mockUser.id}
          isOwnProfile={false}
        />
      );

      // Open dropdown and click block
      const buttons = screen.getAllByRole('button');
      await user.click(buttons[buttons.length - 1]);

      await waitFor(() => {
        expect(screen.getByText(new RegExp(`block @${mockOtherUser.username}`, 'i'))).toBeInTheDocument();
      });

      await user.click(screen.getByText(new RegExp(`block @${mockOtherUser.username}`, 'i')));

      // Check for confirmation message
      await waitFor(() => {
        expect(screen.getByText(/won't be able to find your profile/i)).toBeInTheDocument();
      });
    });

    it('can cancel block action', async () => {
      const { user } = render(
        <ProfileActions
          user={mockOtherUser}
          currentUserId={mockUser.id}
          isOwnProfile={false}
        />
      );

      // Open dropdown and click block
      const buttons = screen.getAllByRole('button');
      await user.click(buttons[buttons.length - 1]);

      await waitFor(() => {
        expect(screen.getByText(new RegExp(`block @${mockOtherUser.username}`, 'i'))).toBeInTheDocument();
      });

      await user.click(screen.getByText(new RegExp(`block @${mockOtherUser.username}`, 'i')));

      // Wait for dialog
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });

      // Click cancel
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      // Dialog should close
      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });

    it('blocks user when confirming', async () => {
      const { user } = render(
        <ProfileActions
          user={mockOtherUser}
          currentUserId={mockUser.id}
          isOwnProfile={false}
        />
      );

      // Open dropdown and click block
      const buttons = screen.getAllByRole('button');
      await user.click(buttons[buttons.length - 1]);

      await waitFor(() => {
        expect(screen.getByText(new RegExp(`block @${mockOtherUser.username}`, 'i'))).toBeInTheDocument();
      });

      await user.click(screen.getByText(new RegExp(`block @${mockOtherUser.username}`, 'i')));

      // Wait for dialog and click block button
      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      // Find and click the block confirmation button
      const blockButton = screen.getByRole('button', { name: /^block$/i });
      await user.click(blockButton);

      // Should trigger API call and refresh
      await waitFor(() => {
        expect(mockRouter.refresh).toHaveBeenCalled();
      });
    });
  });

  describe('Report User', () => {
    it('navigates to report page when clicking Report', async () => {
      const { user } = render(
        <ProfileActions
          user={mockOtherUser}
          currentUserId={mockUser.id}
          isOwnProfile={false}
        />
      );

      // Open dropdown
      const buttons = screen.getAllByRole('button');
      await user.click(buttons[buttons.length - 1]);

      // Click report
      await waitFor(() => {
        expect(screen.getByText(/report/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/report/i));

      expect(mockRouter.push).toHaveBeenCalledWith(`/report?type=user&id=${mockOtherUser.id}`);
    });
  });

  describe('Share Profile', () => {
    it('shows share profile option in dropdown menu', async () => {
      const { user } = render(
        <ProfileActions
          user={mockOtherUser}
          currentUserId={mockUser.id}
          isOwnProfile={false}
        />
      );

      // Open dropdown
      const buttons = screen.getAllByRole('button');
      await user.click(buttons[buttons.length - 1]);

      await waitFor(() => {
        expect(screen.getByText(/share profile/i)).toBeInTheDocument();
      });
    });

    it('shows copy link option in dropdown menu', async () => {
      const { user } = render(
        <ProfileActions
          user={mockOtherUser}
          currentUserId={mockUser.id}
          isOwnProfile={false}
        />
      );

      // Open dropdown
      const buttons = screen.getAllByRole('button');
      await user.click(buttons[buttons.length - 1]);

      await waitFor(() => {
        expect(screen.getByText(/copy link/i)).toBeInTheDocument();
      });
    });

    it('has share button for own profile', () => {
      render(
        <ProfileActions
          user={mockUser}
          currentUserId={mockUser.id}
          isOwnProfile={true}
        />
      );

      // Own profile should have Edit Profile and Share buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(2); // Edit Profile + Share
    });
  });
});
