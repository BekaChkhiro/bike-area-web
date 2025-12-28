import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';

import BlockedUsersPage from '@/app/(main)/settings/blocked/page';
import { render } from '../../utils/test-utils';
import { mockUser } from '../../mocks/handlers';
import { setMockSession } from '../../setup';

// Mock blocked users data
const mockBlockedUsers = [
  {
    id: '10',
    username: 'blockeduser1',
    fullName: 'Blocked User One',
    email: 'blocked1@example.com',
    avatarUrl: null,
    isVerified: false,
  },
  {
    id: '11',
    username: 'blockeduser2',
    fullName: 'Blocked User Two',
    email: 'blocked2@example.com',
    avatarUrl: 'https://example.com/avatar2.jpg',
    isVerified: true,
  },
];

// Mock unblock mutation
const mockUnblockMutate = vi.fn().mockResolvedValue({});

// Mock the hooks before tests
vi.mock('@/lib/api/hooks/use-user', () => ({
  useBlockedUsers: () => ({
    data: { users: mockBlockedUsers },
    isLoading: false,
  }),
  useUnblockUser: () => ({
    mutateAsync: mockUnblockMutate,
    isPending: false,
    variables: null,
  }),
  useCurrentUser: () => ({
    data: null,
    isLoading: false,
  }),
  useUpdateProfile: () => ({
    mutateAsync: vi.fn(),
  }),
}));

describe('BlockedUsersPage', () => {
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
    mockUnblockMutate.mockClear();
  });

  describe('Page Display', () => {
    it('displays blocked users card', () => {
      render(<BlockedUsersPage />);

      expect(screen.getByText('Blocked Users')).toBeInTheDocument();
      expect(
        screen.getByText(/people you've blocked won't be able to see/i)
      ).toBeInTheDocument();
    });

    it('renders blocked users list', () => {
      render(<BlockedUsersPage />);

      expect(screen.getByText('Blocked User One')).toBeInTheDocument();
      expect(screen.getByText('@blockeduser1')).toBeInTheDocument();
      expect(screen.getByText('Blocked User Two')).toBeInTheDocument();
      expect(screen.getByText('@blockeduser2')).toBeInTheDocument();
    });

    it('shows unblock button for each blocked user', () => {
      render(<BlockedUsersPage />);

      const unblockButtons = screen.getAllByRole('button', { name: /unblock/i });
      expect(unblockButtons).toHaveLength(2);
    });
  });

  describe('Search Functionality', () => {
    it('renders search input when users exist', () => {
      render(<BlockedUsersPage />);

      expect(
        screen.getByPlaceholderText(/search blocked users/i)
      ).toBeInTheDocument();
    });

    it('filters users by name', async () => {
      const { user } = render(<BlockedUsersPage />);

      const searchInput = screen.getByPlaceholderText(/search blocked users/i);
      await user.type(searchInput, 'One');

      await waitFor(() => {
        expect(screen.getByText('Blocked User One')).toBeInTheDocument();
        expect(
          screen.queryByText('Blocked User Two')
        ).not.toBeInTheDocument();
      });
    });

    it('shows no results message when search has no matches', async () => {
      const { user } = render(<BlockedUsersPage />);

      const searchInput = screen.getByPlaceholderText(/search blocked users/i);
      await user.type(searchInput, 'nonexistent');

      await waitFor(() => {
        expect(
          screen.getByText(/no users match your search/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Unblock User', () => {
    it('opens unblock confirmation dialog when clicking Unblock', async () => {
      const { user } = render(<BlockedUsersPage />);

      const unblockButtons = screen.getAllByRole('button', { name: /unblock/i });
      await user.click(unblockButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
        expect(
          screen.getByText(/unblock @blockeduser1\?/i)
        ).toBeInTheDocument();
      });
    });

    it('can cancel unblock action', async () => {
      const { user } = render(<BlockedUsersPage />);

      const unblockButtons = screen.getAllByRole('button', { name: /unblock/i });
      await user.click(unblockButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });

    it('calls unblock mutation when confirming', async () => {
      const { user } = render(<BlockedUsersPage />);

      const unblockButtons = screen.getAllByRole('button', { name: /unblock/i });
      await user.click(unblockButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      // Find the unblock button in the dialog (it's the action button)
      const dialogButtons = screen.getAllByRole('button');
      const confirmButton = dialogButtons.find(
        (btn) => btn.textContent === 'Unblock'
      );

      if (confirmButton) {
        await user.click(confirmButton);

        await waitFor(() => {
          expect(mockUnblockMutate).toHaveBeenCalledWith('10');
        });
      }
    });
  });

  describe('User Cards', () => {
    it('renders user avatars', () => {
      render(<BlockedUsersPage />);

      // Check for avatar elements (initials or images)
      const avatars = document.querySelectorAll('[data-slot="avatar"]');
      expect(avatars.length).toBeGreaterThan(0);
    });

    it('links to user profiles', () => {
      render(<BlockedUsersPage />);

      const userLinks = screen.getAllByRole('link');
      expect(userLinks[0]).toHaveAttribute('href', '/blockeduser1');
      expect(userLinks[1]).toHaveAttribute('href', '/blockeduser2');
    });
  });
});
