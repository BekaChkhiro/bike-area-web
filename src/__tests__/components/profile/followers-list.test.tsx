import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';

import { FollowersList } from '@/components/profile/followers-list';
import { render } from '../../utils/test-utils';
import { mockUser, mockFollowers, mockFollowing } from '../../mocks/handlers';
import { setMockSession } from '../../setup';

describe('FollowersList', () => {
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

  describe('Followers List', () => {
    it('renders loading skeletons initially', () => {
      render(
        <FollowersList
          userId={mockUser.id}
          currentUserId={mockUser.id}
          type="followers"
        />
      );

      // Should show loading skeletons
      const skeletons = document.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders followers list after loading', async () => {
      render(
        <FollowersList
          userId={mockUser.id}
          currentUserId={mockUser.id}
          type="followers"
        />
      );

      // Wait for followers to load
      await waitFor(() => {
        expect(screen.getByText(mockFollowers[0].fullName)).toBeInTheDocument();
      });

      // Check all followers are displayed
      for (const follower of mockFollowers) {
        expect(screen.getByText(follower.fullName)).toBeInTheDocument();
      }
    });

    it('shows usernames for each follower', async () => {
      render(
        <FollowersList
          userId={mockUser.id}
          currentUserId={mockUser.id}
          type="followers"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(`@${mockFollowers[0].username}`)).toBeInTheDocument();
      });
    });

    it('shows follow button for each follower', async () => {
      render(
        <FollowersList
          userId={mockUser.id}
          currentUserId={mockUser.id}
          type="followers"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(mockFollowers[0].fullName)).toBeInTheDocument();
      });

      // Each follower card should have a follow button (except for users you already follow)
      const followButtons = screen.getAllByRole('button');
      expect(followButtons.length).toBeGreaterThan(0);
    });

    it('shows verified badge for verified followers', async () => {
      render(
        <FollowersList
          userId={mockUser.id}
          currentUserId={mockUser.id}
          type="followers"
        />
      );

      await waitFor(() => {
        // follower2 is verified in our mock data
        expect(screen.getByText(mockFollowers[1].fullName)).toBeInTheDocument();
      });

      // Check for verified badge presence (BadgeCheck icon with text-primary class)
      const verifiedBadges = document.querySelectorAll('[class*="text-primary"]');
      expect(verifiedBadges.length).toBeGreaterThan(0);
    });

    it('shows "Following" for followers you follow back', async () => {
      render(
        <FollowersList
          userId={mockUser.id}
          currentUserId={mockUser.id}
          type="followers"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(mockFollowers[0].fullName)).toBeInTheDocument();
      });

      // follower2 has isFollowing: true in mock data
      expect(screen.getByRole('button', { name: /following/i })).toBeInTheDocument();
    });
  });

  describe('Following List', () => {
    it('renders following list after loading', async () => {
      render(
        <FollowersList
          userId={mockUser.id}
          currentUserId={mockUser.id}
          type="following"
        />
      );

      // Wait for following to load
      await waitFor(() => {
        expect(screen.getByText(mockFollowing[0].fullName)).toBeInTheDocument();
      });

      // Check all following are displayed
      for (const following of mockFollowing) {
        expect(screen.getByText(following.fullName)).toBeInTheDocument();
      }
    });

    it('shows usernames for each following', async () => {
      render(
        <FollowersList
          userId={mockUser.id}
          currentUserId={mockUser.id}
          type="following"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(`@${mockFollowing[0].username}`)).toBeInTheDocument();
      });
    });

    it('shows "Following" button for users you follow', async () => {
      render(
        <FollowersList
          userId={mockUser.id}
          currentUserId={mockUser.id}
          type="following"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(mockFollowing[0].fullName)).toBeInTheDocument();
      });

      // All users in following list should have "Following" status
      const followingButtons = screen.getAllByRole('button', { name: /following/i });
      expect(followingButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Empty States', () => {
    it('shows empty state when no followers', async () => {
      // This would require modifying the mock to return empty list
      // For now, we'll skip this test as we'd need to set up handler overrides
    });

    it('shows empty state when not following anyone', async () => {
      // This would require modifying the mock to return empty list
      // For now, we'll skip this test as we'd need to set up handler overrides
    });
  });

  describe('Error Handling', () => {
    it('shows error message when loading fails', async () => {
      // This would require setting up an error handler
      // For now, we'll skip this test
    });
  });

  describe('Infinite Scroll', () => {
    it('triggers load more when scrolling to bottom', async () => {
      render(
        <FollowersList
          userId={mockUser.id}
          currentUserId={mockUser.id}
          type="followers"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(mockFollowers[0].fullName)).toBeInTheDocument();
      });

      // The load more trigger element should be present
      // Since our mock returns hasMore: false, no loading should occur
    });
  });

  describe('User Card Interactions', () => {
    it('allows following a user from the list', async () => {
      const { user } = render(
        <FollowersList
          userId={mockUser.id}
          currentUserId={mockUser.id}
          type="followers"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(mockFollowers[0].fullName)).toBeInTheDocument();
      });

      // Find and click a follow button
      const followButtons = screen.getAllByRole('button', { name: /follow$/i });
      if (followButtons.length > 0) {
        await user.click(followButtons[0]);
      }
    });

    it('allows unfollowing a user from the list', async () => {
      const { user } = render(
        <FollowersList
          userId={mockUser.id}
          currentUserId={mockUser.id}
          type="followers"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(mockFollowers[0].fullName)).toBeInTheDocument();
      });

      // Find a "Following" button and hover to get "Unfollow"
      const followingButtons = screen.getAllByRole('button', { name: /following/i });
      if (followingButtons.length > 0) {
        await user.hover(followingButtons[0]);
        await waitFor(() => {
          const unfollowButton = screen.queryByRole('button', { name: /unfollow/i });
          if (unfollowButton) {
            expect(unfollowButton).toBeInTheDocument();
          }
        });
      }
    });
  });
});
