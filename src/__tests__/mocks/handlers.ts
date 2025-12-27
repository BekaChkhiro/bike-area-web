import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:8000/api/v1';

// Mock user data
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  username: 'testuser',
  fullName: 'Test User',
  avatarUrl: 'https://example.com/avatar.jpg',
  coverUrl: 'https://example.com/cover.jpg',
  bio: 'This is my bio',
  location: 'New York, USA',
  website: 'https://example.com',
  isVerified: true,
  isFollowing: false,
  isFollowedBy: false,
  postsCount: 42,
  followersCount: 100,
  followingCount: 50,
  createdAt: '2024-01-01T00:00:00Z',
};

// Other user for profile tests
export const mockOtherUser = {
  id: '2',
  email: 'other@example.com',
  username: 'otheruser',
  fullName: 'Other User',
  avatarUrl: 'https://example.com/other-avatar.jpg',
  coverUrl: 'https://example.com/other-cover.jpg',
  bio: 'Other user bio',
  location: 'Los Angeles, USA',
  website: 'https://other.com',
  isVerified: false,
  isFollowing: false,
  isFollowedBy: true,
  postsCount: 20,
  followersCount: 50,
  followingCount: 30,
  createdAt: '2024-02-01T00:00:00Z',
};

// Mock followers/following lists
export const mockFollowers = [
  { id: '3', username: 'follower1', fullName: 'Follower One', avatarUrl: null, isVerified: false, isFollowing: false },
  { id: '4', username: 'follower2', fullName: 'Follower Two', avatarUrl: null, isVerified: true, isFollowing: true },
  { id: '5', username: 'follower3', fullName: 'Follower Three', avatarUrl: null, isVerified: false, isFollowing: false },
];

export const mockFollowing = [
  { id: '6', username: 'following1', fullName: 'Following One', avatarUrl: null, isVerified: true, isFollowing: true },
  { id: '7', username: 'following2', fullName: 'Following Two', avatarUrl: null, isVerified: false, isFollowing: true },
];

export const mockTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};

// Track state for tests
export const mockState = {
  isLoggedIn: false,
  tokenExpired: false,
  registeredEmails: new Set<string>(),
  verifiedEmails: new Set<string>(),
  passwordResetEmails: new Set<string>(),
  // Profile-related state
  followedUsers: new Set<string>(),
  blockedUsers: new Set<string>(),
  currentUserProfile: { ...mockUser },
};

export const resetMockState = () => {
  mockState.isLoggedIn = false;
  mockState.tokenExpired = false;
  mockState.registeredEmails.clear();
  mockState.verifiedEmails.clear();
  mockState.passwordResetEmails.clear();
  mockState.followedUsers.clear();
  mockState.blockedUsers.clear();
  mockState.currentUserProfile = { ...mockUser };
};

export const handlers = [
  // Login endpoint
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };

    if (body.email === 'test@example.com' && body.password === 'Password123') {
      mockState.isLoggedIn = true;
      return HttpResponse.json({
        success: true,
        data: {
          user: mockUser,
          ...mockTokens,
        },
      });
    }

    if (body.email === 'unverified@example.com' && body.password === 'Password123') {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'EMAIL_NOT_VERIFIED',
          message: 'Please verify your email before logging in',
        },
      }, { status: 403 });
    }

    return HttpResponse.json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      },
    }, { status: 401 });
  }),

  // Register endpoint
  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    const body = await request.json() as {
      email: string;
      username: string;
      fullName: string;
      password: string;
    };

    // Check if email already registered
    if (body.email === 'existing@example.com' || mockState.registeredEmails.has(body.email)) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'Email already registered',
        },
      }, { status: 409 });
    }

    // Check if username taken
    if (body.username === 'existinguser') {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'USERNAME_EXISTS',
          message: 'Username already taken',
        },
      }, { status: 409 });
    }

    mockState.registeredEmails.add(body.email);

    return HttpResponse.json({
      success: true,
      data: {
        message: 'Registration successful. Please verify your email.',
      },
    });
  }),

  // Verify email endpoint
  http.post(`${API_URL}/auth/verify-email`, async ({ request }) => {
    const body = await request.json() as { email: string; code: string };

    if (body.code === '123456') {
      mockState.verifiedEmails.add(body.email);
      return HttpResponse.json({
        success: true,
        data: {
          message: 'Email verified successfully',
        },
      });
    }

    return HttpResponse.json({
      success: false,
      error: {
        code: 'INVALID_CODE',
        message: 'Invalid verification code',
      },
    }, { status: 400 });
  }),

  // Resend verification email endpoint
  http.post(`${API_URL}/auth/resend-verification`, async ({ request }) => {
    const body = await request.json() as { email: string };

    if (!body.email) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'EMAIL_REQUIRED',
          message: 'Email is required',
        },
      }, { status: 400 });
    }

    return HttpResponse.json({
      success: true,
      data: {
        message: 'Verification code sent',
      },
    });
  }),

  // Forgot password endpoint
  http.post(`${API_URL}/auth/forgot-password`, async ({ request }) => {
    const body = await request.json() as { email: string };

    if (body.email === 'nonexistent@example.com') {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'No account found with this email',
        },
      }, { status: 404 });
    }

    mockState.passwordResetEmails.add(body.email);

    return HttpResponse.json({
      success: true,
      data: {
        message: 'Password reset email sent',
      },
    });
  }),

  // Reset password endpoint
  http.post(`${API_URL}/auth/reset-password`, async ({ request }) => {
    const body = await request.json() as { code: string; password: string };

    if (body.code === '123456') {
      return HttpResponse.json({
        success: true,
        data: {
          message: 'Password reset successfully',
        },
      });
    }

    return HttpResponse.json({
      success: false,
      error: {
        code: 'INVALID_CODE',
        message: 'Invalid or expired reset code',
      },
    }, { status: 400 });
  }),

  // Token refresh endpoint
  http.post(`${API_URL}/auth/refresh`, async ({ request }) => {
    const body = await request.json() as { refreshToken: string };

    if (mockState.tokenExpired) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Refresh token expired',
        },
      }, { status: 401 });
    }

    if (body.refreshToken === mockTokens.refreshToken) {
      return HttpResponse.json({
        success: true,
        data: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        },
      });
    }

    return HttpResponse.json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid refresh token',
      },
    }, { status: 401 });
  }),

  // Get current user endpoint (for protected routes)
  http.get(`${API_URL}/users/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      }, { status: 401 });
    }

    return HttpResponse.json({
      success: true,
      data: mockState.currentUserProfile,
    });
  }),

  // Get user by username
  http.get(`${API_URL}/users/username/:username`, ({ params }) => {
    const { username } = params;

    if (username === 'testuser') {
      return HttpResponse.json({
        success: true,
        data: {
          ...mockUser,
          isFollowing: mockState.followedUsers.has(mockUser.id),
        },
      });
    }

    if (username === 'otheruser') {
      return HttpResponse.json({
        success: true,
        data: {
          ...mockOtherUser,
          isFollowing: mockState.followedUsers.has(mockOtherUser.id),
        },
      });
    }

    if (username === 'blockeduser') {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'USER_BLOCKED',
          message: 'You have blocked this user',
        },
      }, { status: 403 });
    }

    return HttpResponse.json({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      },
    }, { status: 404 });
  }),

  // Get user by ID
  http.get(`${API_URL}/users/:id`, ({ params }) => {
    const { id } = params;

    if (id === '1') {
      return HttpResponse.json({
        success: true,
        data: mockUser,
      });
    }

    if (id === '2') {
      return HttpResponse.json({
        success: true,
        data: mockOtherUser,
      });
    }

    return HttpResponse.json({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      },
    }, { status: 404 });
  }),

  // Update profile
  http.patch(`${API_URL}/users/me`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;

    mockState.currentUserProfile = {
      ...mockState.currentUserProfile,
      ...body,
    };

    return HttpResponse.json({
      success: true,
      data: mockState.currentUserProfile,
    });
  }),

  // Upload avatar
  http.post(`${API_URL}/users/me/avatar`, async () => {
    const newAvatarUrl = 'https://example.com/new-avatar.jpg';
    mockState.currentUserProfile.avatarUrl = newAvatarUrl;

    return HttpResponse.json({
      success: true,
      data: { avatarUrl: newAvatarUrl },
    });
  }),

  // Upload cover
  http.post(`${API_URL}/users/me/cover`, async () => {
    const newCoverUrl = 'https://example.com/new-cover.jpg';
    mockState.currentUserProfile.coverUrl = newCoverUrl;

    return HttpResponse.json({
      success: true,
      data: { coverUrl: newCoverUrl },
    });
  }),

  // Delete avatar
  http.delete(`${API_URL}/users/me/avatar`, () => {
    mockState.currentUserProfile.avatarUrl = '';

    return HttpResponse.json({
      success: true,
      data: { message: 'Avatar deleted' },
    });
  }),

  // Delete cover
  http.delete(`${API_URL}/users/me/cover`, () => {
    mockState.currentUserProfile.coverUrl = '';

    return HttpResponse.json({
      success: true,
      data: { message: 'Cover deleted' },
    });
  }),

  // Follow user
  http.post(`${API_URL}/users/:id/follow`, ({ params }) => {
    const { id } = params as { id: string };
    mockState.followedUsers.add(id);

    return HttpResponse.json({
      success: true,
      data: { followed: true },
    });
  }),

  // Unfollow user
  http.post(`${API_URL}/users/:id/unfollow`, ({ params }) => {
    const { id } = params as { id: string };
    mockState.followedUsers.delete(id);

    return HttpResponse.json({
      success: true,
      data: { unfollowed: true },
    });
  }),

  // Block user
  http.post(`${API_URL}/users/:id/block`, ({ params }) => {
    const { id } = params as { id: string };
    mockState.blockedUsers.add(id);
    mockState.followedUsers.delete(id);

    return HttpResponse.json({
      success: true,
      data: { blocked: true },
    });
  }),

  // Unblock user
  http.post(`${API_URL}/users/:id/unblock`, ({ params }) => {
    const { id } = params as { id: string };
    mockState.blockedUsers.delete(id);

    return HttpResponse.json({
      success: true,
      data: { unblocked: true },
    });
  }),

  // Get followers
  http.get(`${API_URL}/users/:id/followers`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        users: mockFollowers,
        total: mockFollowers.length,
        page: 1,
        limit: 20,
        hasMore: false,
      },
    });
  }),

  // Get following
  http.get(`${API_URL}/users/:id/following`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        users: mockFollowing,
        total: mockFollowing.length,
        page: 1,
        limit: 20,
        hasMore: false,
      },
    });
  }),

  // Get blocked users
  http.get(`${API_URL}/users/me/blocked`, () => {
    const blockedUsersList = Array.from(mockState.blockedUsers).map((id, index) => ({
      id,
      username: `blockeduser${index}`,
      fullName: `Blocked User ${index}`,
      avatarUrl: null,
      isVerified: false,
    }));

    return HttpResponse.json({
      success: true,
      data: { users: blockedUsersList },
    });
  }),

  // Check username availability
  http.get(`${API_URL}/users/check-username/:username`, ({ params }) => {
    const { username } = params;

    if (username === 'taken' || username === 'existinguser') {
      return HttpResponse.json({
        success: true,
        data: { available: false },
      });
    }

    return HttpResponse.json({
      success: true,
      data: { available: true },
    });
  }),
];
