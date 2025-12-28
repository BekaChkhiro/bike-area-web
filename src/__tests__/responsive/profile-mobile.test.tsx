import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';

import { render } from '../utils/test-utils';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ProfileStats } from '@/components/profile/profile-stats';
import type { User } from '@/types/auth';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
  usePathname: vi.fn(() => '/testuser'),
}));

// Mock upload hooks
vi.mock('@/lib/api/hooks/use-user', () => ({
  useUploadAvatar: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useUploadCover: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useCurrentUser: vi.fn(() => ({
    data: null,
    isLoading: false,
  })),
  useUser: vi.fn(() => ({
    data: null,
    isLoading: false,
  })),
  useUserByUsername: vi.fn(() => ({
    data: null,
    isLoading: false,
  })),
  useBlockUser: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useUnblockUser: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useFollowUser: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useUnfollowUser: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useFollowStatus: vi.fn(() => ({
    data: { isFollowing: false, isFollowedBy: false },
    isLoading: false,
  })),
}));

// Mock follow hooks
vi.mock('@/lib/api/hooks/use-follow', () => ({
  useFollow: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useUnfollow: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useFollowStatus: vi.fn(() => ({
    data: { isFollowing: false, isFollowedBy: false },
    isLoading: false,
  })),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

const mockUser: User = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  fullName: 'Test User',
  avatarUrl: 'https://example.com/avatar.jpg',
  coverUrl: 'https://example.com/cover.jpg',
  bio: 'This is a test bio',
  location: 'Test City',
  website: 'https://example.com',
  isVerified: true,
  isPrivate: false,
  followersCount: 100,
  followingCount: 50,
  postsCount: 25,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('Profile Header Mobile Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Cover Photo Responsive', () => {
    it('has responsive height classes', () => {
      const { container } = render(
        <ProfileHeader user={mockUser} isOwnProfile={false} />
      );

      // Cover should have responsive height: h-36 sm:h-52 lg:h-64
      const cover = container.querySelector('.h-36');
      expect(cover).toBeInTheDocument();
      expect(cover?.className).toContain('sm:h-52');
      expect(cover?.className).toContain('lg:h-64');
    });
  });

  describe('Avatar Responsive', () => {
    it('has responsive size classes', () => {
      const { container } = render(
        <ProfileHeader user={mockUser} isOwnProfile={false} />
      );

      // Avatar should have responsive size: size-32 sm:size-40
      const avatar = container.querySelector('.size-32');
      expect(avatar).toBeInTheDocument();
      expect(avatar?.className).toContain('sm:size-40');
    });

    it('avatar fallback has responsive text size', () => {
      const userWithoutAvatar = { ...mockUser, avatarUrl: undefined };
      const { container } = render(
        <ProfileHeader user={userWithoutAvatar} isOwnProfile={false} />
      );

      // Fallback should have responsive text: text-2xl sm:text-3xl
      const fallback = container.querySelector('[class*="text-2xl"]');
      expect(fallback).toBeInTheDocument();
    });
  });

  describe('Layout Responsive', () => {
    it('info section has responsive flex direction', () => {
      const { container } = render(
        <ProfileHeader user={mockUser} isOwnProfile={false} />
      );

      // Should have flex-col sm:flex-row for mobile stacking
      const infoSection = container.querySelector('.flex-col.sm\\:flex-row');
      expect(infoSection).toBeInTheDocument();
    });

    it('content has responsive padding', () => {
      const { container } = render(
        <ProfileHeader user={mockUser} isOwnProfile={false} />
      );

      // Should have px-6 sm:px-8 for responsive padding
      const content = container.querySelector('.px-6');
      expect(content).toBeInTheDocument();
      expect(content?.className).toContain('sm:px-8');
    });

    it('avatar margin is responsive', () => {
      const { container } = render(
        <ProfileHeader user={mockUser} isOwnProfile={false} />
      );

      // Should have responsive negative margin: -mt-18 sm:-mt-24
      const avatarWrapper = container.querySelector('.-mt-18');
      expect(avatarWrapper).toBeInTheDocument();
      expect(avatarWrapper?.className).toContain('sm:-mt-24');
    });
  });

  describe('Name Responsive', () => {
    it('name has responsive text size', () => {
      render(<ProfileHeader user={mockUser} isOwnProfile={false} />);

      const name = screen.getByRole('heading', { name: 'Test User' });
      expect(name.className).toContain('text-2xl');
      expect(name.className).toContain('sm:text-3xl');
    });
  });

  describe('Edit Cover Button Responsive', () => {
    it('hides text on mobile, shows on larger screens', () => {
      const { container } = render(
        <ProfileHeader user={mockUser} isOwnProfile={true} />
      );

      // Edit cover text should have hidden sm:inline
      const editCoverText = container.querySelector('.hidden.sm\\:inline');
      expect(editCoverText).toBeInTheDocument();
      expect(editCoverText?.textContent).toBe('Edit Cover');
    });
  });

  describe('User Info Display', () => {
    it('displays user bio', () => {
      render(<ProfileHeader user={mockUser} isOwnProfile={false} />);

      expect(screen.getByText('This is a test bio')).toBeInTheDocument();
    });

    it('displays user location', () => {
      render(<ProfileHeader user={mockUser} isOwnProfile={false} />);

      expect(screen.getByText('Test City')).toBeInTheDocument();
    });

    it('displays verification badge for verified users', () => {
      const { container } = render(
        <ProfileHeader user={mockUser} isOwnProfile={false} />
      );

      const badge = container.querySelector('.text-primary');
      expect(badge).toBeInTheDocument();
    });
  });
});

describe('Profile Stats Mobile Layout', () => {
  it('renders all stat items', () => {
    render(
      <ProfileStats
        username="testuser"
        postsCount={25}
        followersCount={100}
        followingCount={50}
      />
    );

    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('renders stat labels', () => {
    render(
      <ProfileStats
        username="testuser"
        postsCount={25}
        followersCount={100}
        followingCount={50}
      />
    );

    expect(screen.getByText('Posts')).toBeInTheDocument();
    expect(screen.getByText('Followers')).toBeInTheDocument();
    expect(screen.getByText('Following')).toBeInTheDocument();
  });

  it('stats are clickable links', () => {
    render(
      <ProfileStats
        username="testuser"
        postsCount={25}
        followersCount={100}
        followingCount={50}
      />
    );

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });
});
