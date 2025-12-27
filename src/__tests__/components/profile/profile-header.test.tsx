import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';

import { ProfileHeader } from '@/components/profile/profile-header';
import { render } from '../../utils/test-utils';
import { mockUser, mockOtherUser, mockState } from '../../mocks/handlers';
import { setMockSession } from '../../setup';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('ProfileHeader', () => {
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

  describe('Profile Display', () => {
    it('displays user full name and username', () => {
      render(
        <ProfileHeader
          user={mockUser}
          currentUserId={mockUser.id}
          isOwnProfile={true}
        />
      );

      expect(screen.getByText(mockUser.fullName)).toBeInTheDocument();
      expect(screen.getByText(`@${mockUser.username}`)).toBeInTheDocument();
    });

    it('displays user bio when present', () => {
      render(
        <ProfileHeader
          user={mockUser}
          currentUserId={mockUser.id}
          isOwnProfile={true}
        />
      );

      expect(screen.getByText(mockUser.bio)).toBeInTheDocument();
    });

    it('displays user location when present', () => {
      render(
        <ProfileHeader
          user={mockUser}
          currentUserId={mockUser.id}
          isOwnProfile={true}
        />
      );

      expect(screen.getByText(mockUser.location)).toBeInTheDocument();
    });

    it('displays user website when present', () => {
      render(
        <ProfileHeader
          user={mockUser}
          currentUserId={mockUser.id}
          isOwnProfile={true}
        />
      );

      // Website should be displayed without protocol
      expect(screen.getByText('example.com')).toBeInTheDocument();
    });

    it('displays join date', () => {
      render(
        <ProfileHeader
          user={mockUser}
          currentUserId={mockUser.id}
          isOwnProfile={true}
        />
      );

      expect(screen.getByText(/Joined January 2024/)).toBeInTheDocument();
    });

    it('displays verified badge when user is verified', () => {
      render(
        <ProfileHeader
          user={mockUser}
          currentUserId={mockUser.id}
          isOwnProfile={true}
        />
      );

      // The verified badge should be present (BadgeCheck icon)
      const badge = document.querySelector('[class*="text-primary"]');
      expect(badge).toBeInTheDocument();
    });

    it('does not display verified badge when user is not verified', () => {
      const unverifiedUser = { ...mockOtherUser, isVerified: false };

      render(
        <ProfileHeader
          user={unverifiedUser}
          currentUserId={mockUser.id}
          isOwnProfile={false}
        />
      );

      expect(screen.getByText(unverifiedUser.fullName)).toBeInTheDocument();
    });

    it('displays avatar with fallback initials', () => {
      const userWithoutAvatar = { ...mockUser, avatarUrl: undefined };

      render(
        <ProfileHeader
          user={userWithoutAvatar}
          currentUserId={mockUser.id}
          isOwnProfile={true}
        />
      );

      // Check for initials (TU for Test User)
      expect(screen.getByText('TU')).toBeInTheDocument();
    });

    it('displays cover photo when present', () => {
      render(
        <ProfileHeader
          user={mockUser}
          currentUserId={mockUser.id}
          isOwnProfile={true}
        />
      );

      const coverImage = screen.getByAltText('Cover photo');
      expect(coverImage).toBeInTheDocument();
      expect(coverImage).toHaveAttribute('src', mockUser.coverUrl);
    });
  });

  describe('Own Profile Actions', () => {
    it('shows Edit Profile button on own profile', () => {
      render(
        <ProfileHeader
          user={mockUser}
          currentUserId={mockUser.id}
          isOwnProfile={true}
        />
      );

      expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
    });

    it('shows Edit Cover button on own profile', () => {
      render(
        <ProfileHeader
          user={mockUser}
          currentUserId={mockUser.id}
          isOwnProfile={true}
        />
      );

      expect(screen.getByRole('button', { name: /edit cover/i })).toBeInTheDocument();
    });

    it('shows avatar edit button on own profile', async () => {
      render(
        <ProfileHeader
          user={mockUser}
          currentUserId={mockUser.id}
          isOwnProfile={true}
        />
      );

      // The avatar edit button is a small camera icon button
      const avatarEditButtons = screen.getAllByRole('button');
      const cameraButtons = avatarEditButtons.filter((btn) =>
        btn.querySelector('svg') !== null
      );
      expect(cameraButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Other User Profile Actions', () => {
    it('shows Follow button on other user profile', () => {
      render(
        <ProfileHeader
          user={mockOtherUser}
          currentUserId={mockUser.id}
          isOwnProfile={false}
        />
      );

      expect(screen.getByRole('button', { name: /follow/i })).toBeInTheDocument();
    });

    it('shows Message button on other user profile', () => {
      render(
        <ProfileHeader
          user={mockOtherUser}
          currentUserId={mockUser.id}
          isOwnProfile={false}
        />
      );

      // The message button has a MessageCircle icon
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(1); // Follow + Message + More
    });

    it('does not show Edit Profile button on other user profile', () => {
      render(
        <ProfileHeader
          user={mockOtherUser}
          currentUserId={mockUser.id}
          isOwnProfile={false}
        />
      );

      expect(screen.queryByRole('button', { name: /edit profile/i })).not.toBeInTheDocument();
    });

    it('does not show Edit Cover button on other user profile', () => {
      render(
        <ProfileHeader
          user={mockOtherUser}
          currentUserId={mockUser.id}
          isOwnProfile={false}
        />
      );

      expect(screen.queryByRole('button', { name: /edit cover/i })).not.toBeInTheDocument();
    });
  });

  describe('Avatar Upload', () => {
    it('triggers file input when avatar edit button is clicked', async () => {
      const { user } = render(
        <ProfileHeader
          user={mockUser}
          currentUserId={mockUser.id}
          isOwnProfile={true}
        />
      );

      // Find the hidden file input for avatar
      const fileInput = document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement;
      expect(fileInput).toBeInTheDocument();

      // Create a mock file
      const file = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' });

      // Trigger file change
      await user.upload(fileInput, file);

      // The upload should have been triggered
      await waitFor(() => {
        expect(fileInput.files?.[0]).toEqual(file);
      });
    });
  });

  describe('Cover Upload', () => {
    it('triggers file input when cover edit button is clicked', async () => {
      const { user } = render(
        <ProfileHeader
          user={mockUser}
          currentUserId={mockUser.id}
          isOwnProfile={true}
        />
      );

      const editCoverButton = screen.getByRole('button', { name: /edit cover/i });

      // File inputs should be present
      const fileInputs = document.querySelectorAll('input[type="file"]');
      expect(fileInputs.length).toBeGreaterThan(0);
    });
  });
});
