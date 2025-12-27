// API Endpoints organized by module

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    CHANGE_PASSWORD: '/auth/change-password',
  },

  // Users
  USERS: {
    ME: '/users/me',
    BY_ID: (id: string) => `/users/${id}`,
    BY_USERNAME: (username: string) => `/users/username/${username}`,
    CHECK_USERNAME: (username: string) => `/users/check-username/${username}`,
    UPDATE_PROFILE: '/users/me',
    UPLOAD_AVATAR: '/users/me/avatar',
    UPLOAD_COVER: '/users/me/cover',
    DELETE_AVATAR: '/users/me/avatar',
    DELETE_COVER: '/users/me/cover',
    SEARCH: '/users/search',
    SUGGESTIONS: '/users/suggestions',
  },

  // Follow/Block
  SOCIAL: {
    FOLLOW: (userId: string) => `/users/${userId}/follow`,
    UNFOLLOW: (userId: string) => `/users/${userId}/unfollow`,
    FOLLOWERS: (userId: string) => `/users/${userId}/followers`,
    FOLLOWING: (userId: string) => `/users/${userId}/following`,
    BLOCK: (userId: string) => `/users/${userId}/block`,
    UNBLOCK: (userId: string) => `/users/${userId}/unblock`,
    BLOCKED_USERS: '/users/me/blocked',
  },

  // Posts
  POSTS: {
    LIST: '/posts',
    FEED: '/posts/feed',
    BY_ID: (id: string) => `/posts/${id}`,
    BY_USER: (userId: string) => `/users/${userId}/posts`,
    CREATE: '/posts',
    UPDATE: (id: string) => `/posts/${id}`,
    DELETE: (id: string) => `/posts/${id}`,
    LIKE: (id: string) => `/posts/${id}/like`,
    UNLIKE: (id: string) => `/posts/${id}/unlike`,
    BOOKMARK: (id: string) => `/posts/${id}/bookmark`,
    UNBOOKMARK: (id: string) => `/posts/${id}/unbookmark`,
    BOOKMARKS: '/posts/bookmarks',
    HASHTAG: (tag: string) => `/posts/hashtag/${tag}`,
    TRENDING: '/posts/trending',
  },

  // Comments
  COMMENTS: {
    BY_POST: (postId: string) => `/posts/${postId}/comments`,
    BY_ID: (postId: string, commentId: string) =>
      `/posts/${postId}/comments/${commentId}`,
    CREATE: (postId: string) => `/posts/${postId}/comments`,
    UPDATE: (postId: string, commentId: string) =>
      `/posts/${postId}/comments/${commentId}`,
    DELETE: (postId: string, commentId: string) =>
      `/posts/${postId}/comments/${commentId}`,
    LIKE: (postId: string, commentId: string) =>
      `/posts/${postId}/comments/${commentId}/like`,
    REPLIES: (postId: string, commentId: string) =>
      `/posts/${postId}/comments/${commentId}/replies`,
  },

  // Stories
  STORIES: {
    LIST: '/stories',
    FEED: '/stories/feed',
    BY_ID: (id: string) => `/stories/${id}`,
    BY_USER: (userId: string) => `/users/${userId}/stories`,
    CREATE: '/stories',
    DELETE: (id: string) => `/stories/${id}`,
    VIEW: (id: string) => `/stories/${id}/view`,
    VIEWERS: (id: string) => `/stories/${id}/viewers`,
  },

  // Marketplace
  MARKETPLACE: {
    LISTINGS: '/marketplace/listings',
    BY_ID: (id: string) => `/marketplace/listings/${id}`,
    CREATE: '/marketplace/listings',
    UPDATE: (id: string) => `/marketplace/listings/${id}`,
    DELETE: (id: string) => `/marketplace/listings/${id}`,
    MY_LISTINGS: '/marketplace/listings/me',
    FAVORITES: '/marketplace/favorites',
    FAVORITE: (id: string) => `/marketplace/listings/${id}/favorite`,
    CATEGORIES: '/marketplace/categories',
    CONTACT_SELLER: (id: string) => `/marketplace/listings/${id}/contact`,
  },

  // Parts
  PARTS: {
    LIST: '/parts',
    BY_ID: (id: string) => `/parts/${id}`,
    CREATE: '/parts',
    UPDATE: (id: string) => `/parts/${id}`,
    DELETE: (id: string) => `/parts/${id}`,
    CATEGORIES: '/parts/categories',
    COMPATIBILITY: '/parts/compatibility',
  },

  // Forum
  FORUM: {
    CATEGORIES: '/forum/categories',
    THREADS: '/forum/threads',
    THREAD_BY_ID: (id: string) => `/forum/threads/${id}`,
    CREATE_THREAD: '/forum/threads',
    REPLIES: (threadId: string) => `/forum/threads/${threadId}/replies`,
    CREATE_REPLY: (threadId: string) => `/forum/threads/${threadId}/replies`,
    LIKE_THREAD: (id: string) => `/forum/threads/${id}/like`,
    PIN_THREAD: (id: string) => `/forum/threads/${id}/pin`,
    CLOSE_THREAD: (id: string) => `/forum/threads/${id}/close`,
  },

  // Services
  SERVICES: {
    LIST: '/services',
    BY_ID: (id: string) => `/services/${id}`,
    CREATE: '/services',
    UPDATE: (id: string) => `/services/${id}`,
    DELETE: (id: string) => `/services/${id}`,
    CATEGORIES: '/services/categories',
    REVIEWS: (id: string) => `/services/${id}/reviews`,
    ADD_REVIEW: (id: string) => `/services/${id}/reviews`,
    NEARBY: '/services/nearby',
  },

  // Messages/Chat
  MESSAGES: {
    CONVERSATIONS: '/messages/conversations',
    CONVERSATION: (id: string) => `/messages/conversations/${id}`,
    MESSAGES: (conversationId: string) =>
      `/messages/conversations/${conversationId}/messages`,
    SEND: (conversationId: string) =>
      `/messages/conversations/${conversationId}/messages`,
    START_CONVERSATION: '/messages/conversations',
    MARK_READ: (conversationId: string) =>
      `/messages/conversations/${conversationId}/read`,
    DELETE_CONVERSATION: (id: string) => `/messages/conversations/${id}`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    PREFERENCES: '/notifications/preferences',
    UPDATE_PREFERENCES: '/notifications/preferences',
  },

  // Search
  SEARCH: {
    ALL: '/search',
    USERS: '/search/users',
    POSTS: '/search/posts',
    LISTINGS: '/search/listings',
    THREADS: '/search/threads',
    HASHTAGS: '/search/hashtags',
    SUGGESTIONS: '/search/suggestions',
  },

  // Settings
  SETTINGS: {
    ACCOUNT: '/settings/account',
    PRIVACY: '/settings/privacy',
    NOTIFICATIONS: '/settings/notifications',
    SECURITY: '/settings/security',
    DELETE_ACCOUNT: '/settings/delete-account',
  },

  // Reports
  REPORTS: {
    CREATE: '/reports',
    BY_ID: (id: string) => `/reports/${id}`,
  },

  // Upload
  UPLOAD: {
    IMAGE: '/upload/image',
    IMAGES: '/upload/images',
    VIDEO: '/upload/video',
  },
} as const;

// Query keys for React Query
export const QUERY_KEYS = {
  // Auth
  currentUser: ['user', 'me'] as const,

  // Users
  user: (id: string) => ['user', id] as const,
  userByUsername: (username: string) => ['user', 'username', username] as const,
  userFollowers: (id: string) => ['user', id, 'followers'] as const,
  userFollowing: (id: string) => ['user', id, 'following'] as const,
  blockedUsers: ['user', 'blocked'] as const,
  userSuggestions: ['user', 'suggestions'] as const,

  // Posts
  posts: ['posts'] as const,
  feed: ['posts', 'feed'] as const,
  post: (id: string) => ['posts', id] as const,
  userPosts: (userId: string) => ['posts', 'user', userId] as const,
  bookmarks: ['posts', 'bookmarks'] as const,
  trending: ['posts', 'trending'] as const,
  hashtag: (tag: string) => ['posts', 'hashtag', tag] as const,

  // Comments
  comments: (postId: string) => ['posts', postId, 'comments'] as const,

  // Stories
  stories: ['stories'] as const,
  storyFeed: ['stories', 'feed'] as const,
  userStories: (userId: string) => ['stories', 'user', userId] as const,

  // Marketplace
  listings: ['marketplace', 'listings'] as const,
  listing: (id: string) => ['marketplace', 'listings', id] as const,
  myListings: ['marketplace', 'listings', 'me'] as const,
  favorites: ['marketplace', 'favorites'] as const,
  marketplaceCategories: ['marketplace', 'categories'] as const,

  // Parts
  parts: ['parts'] as const,
  part: (id: string) => ['parts', id] as const,
  partCategories: ['parts', 'categories'] as const,

  // Forum
  forumCategories: ['forum', 'categories'] as const,
  threads: ['forum', 'threads'] as const,
  thread: (id: string) => ['forum', 'threads', id] as const,
  threadReplies: (threadId: string) =>
    ['forum', 'threads', threadId, 'replies'] as const,

  // Services
  services: ['services'] as const,
  service: (id: string) => ['services', id] as const,
  serviceReviews: (id: string) => ['services', id, 'reviews'] as const,
  serviceCategories: ['services', 'categories'] as const,

  // Messages
  conversations: ['messages', 'conversations'] as const,
  conversation: (id: string) => ['messages', 'conversations', id] as const,
  messages: (conversationId: string) =>
    ['messages', 'conversations', conversationId, 'messages'] as const,

  // Notifications
  notifications: ['notifications'] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
  notificationPreferences: ['notifications', 'preferences'] as const,

  // Search
  search: (query: string, type?: string) =>
    ['search', query, type].filter(Boolean) as string[],

  // Settings
  settings: (type: string) => ['settings', type] as const,
} as const;
