'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { usernameSchema } from '@/lib/validations/profile';

interface UsernameCheckResult {
  isAvailable: boolean;
  isChecking: boolean;
  error: string | null;
  checkUsername: (username: string) => void;
}

export function useUsernameCheck(
  currentUsername?: string,
  debounceMs = 500
): UsernameCheckResult {
  const [username, setUsername] = useState('');
  const [debouncedUsername, setDebouncedUsername] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Debounce the username
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUsername(username);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [username, debounceMs]);

  // Validate username format
  const validateUsername = useCallback((value: string): boolean => {
    const result = usernameSchema.safeParse(value);
    if (!result.success) {
      setValidationError(result.error.errors[0]?.message ?? 'Invalid username');
      return false;
    }
    setValidationError(null);
    return true;
  }, []);

  // Check if the username is the same as current (no need to check)
  const isSameAsCurrent =
    currentUsername &&
    debouncedUsername.toLowerCase() === currentUsername.toLowerCase();

  // Query for checking username availability
  const { data, isLoading, isError } = useQuery({
    queryKey: ['check-username', debouncedUsername],
    queryFn: () =>
      api.get<{ available: boolean }>(
        API_ENDPOINTS.USERS.CHECK_USERNAME(debouncedUsername)
      ),
    enabled:
      debouncedUsername.length >= 3 &&
      !isSameAsCurrent &&
      !validationError,
    staleTime: 30 * 1000, // 30 seconds
    retry: false,
  });

  const checkUsername = useCallback(
    (value: string) => {
      setUsername(value);
      if (value.length >= 3) {
        validateUsername(value);
      } else {
        setValidationError(null);
      }
    },
    [validateUsername]
  );

  // Determine availability
  const isAvailable =
    isSameAsCurrent || (data?.available ?? false);

  return {
    isAvailable: !validationError && isAvailable,
    isChecking: isLoading && !isSameAsCurrent,
    error: validationError || (isError ? 'Failed to check username' : null),
    checkUsername,
  };
}
