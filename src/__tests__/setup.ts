import '@testing-library/jest-dom';
import { afterEach, afterAll, beforeAll, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';
import { resetMockState } from './mocks/handlers';

// Mock ResizeObserver for Radix UI components
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;

// Mock pointer capture methods for Radix UI components
Element.prototype.hasPointerCapture = vi.fn().mockReturnValue(false);
Element.prototype.setPointerCapture = vi.fn();
Element.prototype.releasePointerCapture = vi.fn();

// Mock IntersectionObserver
class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Start MSW server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' });
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
  resetMockState();
  cleanup();
});

// Close server after all tests
afterAll(() => {
  server.close();
});

// Mock Next.js router
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Export for tests to access
export { mockRouter };

// Mock next-auth with configurable state
let mockSession: {
  data: { user: { id: string; email: string; name: string; username: string } | null; accessToken?: string; refreshToken?: string } | null;
  status: 'authenticated' | 'unauthenticated' | 'loading';
} = {
  data: null,
  status: 'unauthenticated',
};

export const setMockSession = (session: typeof mockSession) => {
  mockSession = session;
};

export const clearMockSession = () => {
  mockSession = { data: null, status: 'unauthenticated' };
};

const mockSignIn = vi.fn();
const mockSignOut = vi.fn();
const mockGetSession = vi.fn();

vi.mock('next-auth/react', () => ({
  useSession: () => mockSession,
  signIn: (...args: unknown[]) => mockSignIn(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
  getSession: () => mockGetSession(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

export { mockSignIn, mockSignOut, mockGetSession };

// Mock sonner toast
export const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  loading: vi.fn(),
  promise: vi.fn(),
  message: vi.fn(),
  dismiss: vi.fn(),
};

vi.mock('sonner', () => ({
  toast: mockToast,
  Toaster: () => null,
}));

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  clearMockSession();
});
