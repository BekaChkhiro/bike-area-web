import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '../client';
import { API_ENDPOINTS, QUERY_KEYS } from '../endpoints';
import { parseApiError } from '../errors';
import type { User, UpdateProfileData } from '@/types/auth';

// Get current user
export function useCurrentUser() {
  return useQuery({
    queryKey: QUERY_KEYS.currentUser,
    queryFn: () => api.get<User>(API_ENDPOINTS.USERS.ME),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

// Get user by ID
export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.user(id || ''),
    queryFn: () => api.get<User>(API_ENDPOINTS.USERS.BY_ID(id!)),
    enabled: !!id,
  });
}

// Get user by username
export function useUserByUsername(username: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.userByUsername(username || ''),
    queryFn: () => api.get<User>(API_ENDPOINTS.USERS.BY_USERNAME(username!)),
    enabled: !!username,
  });
}

// Update profile mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileData) =>
      api.patch<User>(API_ENDPOINTS.USERS.UPDATE_PROFILE, data),
    onSuccess: (data) => {
      // Update cache with new user data
      queryClient.setQueryData(QUERY_KEYS.currentUser, data);
      toast.success('Profile updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(parseApiError(error));
    },
  });
}

// Upload avatar mutation
export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return api.upload<{ avatarUrl: string }>(
        API_ENDPOINTS.USERS.UPLOAD_AVATAR,
        formData
      );
    },
    onSuccess: (data) => {
      // Invalidate user query to refetch with new avatar
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.currentUser });
      toast.success('Avatar updated successfully!');
      return data;
    },
    onError: (error: Error) => {
      toast.error(parseApiError(error));
    },
  });
}

// Upload cover photo mutation
export function useUploadCover() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('cover', file);
      return api.upload<{ coverUrl: string }>(
        API_ENDPOINTS.USERS.UPLOAD_COVER,
        formData
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.currentUser });
      toast.success('Cover photo updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(parseApiError(error));
    },
  });
}

// Delete avatar mutation
export function useDeleteAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.delete(API_ENDPOINTS.USERS.DELETE_AVATAR),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.currentUser });
      toast.success('Avatar removed successfully!');
    },
    onError: (error: Error) => {
      toast.error(parseApiError(error));
    },
  });
}

// Delete cover photo mutation
export function useDeleteCover() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.delete(API_ENDPOINTS.USERS.DELETE_COVER),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.currentUser });
      toast.success('Cover photo removed successfully!');
    },
    onError: (error: Error) => {
      toast.error(parseApiError(error));
    },
  });
}

// Search users
export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: QUERY_KEYS.search(query, 'users'),
    queryFn: () =>
      api.get<{ users: User[] }>(API_ENDPOINTS.USERS.SEARCH, { q: query }),
    enabled: query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Get user suggestions
export function useUserSuggestions() {
  return useQuery({
    queryKey: QUERY_KEYS.userSuggestions,
    queryFn: () => api.get<{ users: User[] }>(API_ENDPOINTS.USERS.SUGGESTIONS),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get user followers
export function useUserFollowers(userId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.userFollowers(userId || ''),
    queryFn: () =>
      api.get<{ users: User[]; total: number }>(
        API_ENDPOINTS.SOCIAL.FOLLOWERS(userId!)
      ),
    enabled: !!userId,
  });
}

// Get user following
export function useUserFollowing(userId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.userFollowing(userId || ''),
    queryFn: () =>
      api.get<{ users: User[]; total: number }>(
        API_ENDPOINTS.SOCIAL.FOLLOWING(userId!)
      ),
    enabled: !!userId,
  });
}

// Follow user mutation
export function useFollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      api.post<{ followed: boolean }>(API_ENDPOINTS.SOCIAL.FOLLOW(userId), {}),
    onSuccess: (_, userId) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user(userId) });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.userFollowers(userId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userSuggestions });
      toast.success('Following!');
    },
    onError: (error: Error) => {
      toast.error(parseApiError(error));
    },
  });
}

// Unfollow user mutation
export function useUnfollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      api.post<{ unfollowed: boolean }>(
        API_ENDPOINTS.SOCIAL.UNFOLLOW(userId),
        {}
      ),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user(userId) });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.userFollowers(userId),
      });
      toast.success('Unfollowed');
    },
    onError: (error: Error) => {
      toast.error(parseApiError(error));
    },
  });
}

// Block user mutation
export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      api.post<{ blocked: boolean }>(API_ENDPOINTS.SOCIAL.BLOCK(userId), {}),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user(userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.blockedUsers });
      toast.success('User blocked');
    },
    onError: (error: Error) => {
      toast.error(parseApiError(error));
    },
  });
}

// Unblock user mutation
export function useUnblockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      api.post<{ unblocked: boolean }>(
        API_ENDPOINTS.SOCIAL.UNBLOCK(userId),
        {}
      ),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user(userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.blockedUsers });
      toast.success('User unblocked');
    },
    onError: (error: Error) => {
      toast.error(parseApiError(error));
    },
  });
}

// Get blocked users
export function useBlockedUsers() {
  return useQuery({
    queryKey: QUERY_KEYS.blockedUsers,
    queryFn: () =>
      api.get<{ users: User[] }>(API_ENDPOINTS.SOCIAL.BLOCKED_USERS),
  });
}

// Paginated response type
interface PaginatedUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Infinite query for followers
export function useInfiniteFollowers(userId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ['infinite', ...QUERY_KEYS.userFollowers(userId || '')],
    queryFn: ({ pageParam = 1 }) =>
      api.get<PaginatedUsersResponse>(
        API_ENDPOINTS.SOCIAL.FOLLOWERS(userId!),
        { page: String(pageParam), limit: '20' }
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: !!userId,
  });
}

// Infinite query for following
export function useInfiniteFollowing(userId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ['infinite', ...QUERY_KEYS.userFollowing(userId || '')],
    queryFn: ({ pageParam = 1 }) =>
      api.get<PaginatedUsersResponse>(
        API_ENDPOINTS.SOCIAL.FOLLOWING(userId!),
        { page: String(pageParam), limit: '20' }
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: !!userId,
  });
}

// Get mutual followers (users that both you and the target user follow)
export function useMutualFollowers(userId: string | undefined) {
  return useQuery({
    queryKey: ['mutual-followers', userId],
    queryFn: () =>
      api.get<{ users: User[] }>(
        `${API_ENDPOINTS.SOCIAL.FOLLOWERS(userId!)}/mutual`
      ),
    enabled: !!userId,
  });
}
