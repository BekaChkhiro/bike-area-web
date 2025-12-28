import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';

import { useSearchModal } from '@/components/search/search-modal';
import { render } from '../../utils/test-utils';

// Mock scrollIntoView for cmdk
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

describe('useSearchModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with closed state', () => {
    let hookResult: ReturnType<typeof useSearchModal>;

    function TestComponent() {
      hookResult = useSearchModal();
      return null;
    }

    render(<TestComponent />);

    expect(hookResult!.open).toBe(false);
  });

  it('opens modal on Cmd+K', async () => {
    let hookResult: ReturnType<typeof useSearchModal>;

    function TestComponent() {
      hookResult = useSearchModal();
      return <div data-testid="open">{hookResult.open ? 'open' : 'closed'}</div>;
    }

    render(<TestComponent />);

    expect(screen.getByTestId('open')).toHaveTextContent('closed');

    // Simulate Cmd+K
    fireEvent.keyDown(document, { key: 'k', metaKey: true });

    await waitFor(() => {
      expect(screen.getByTestId('open')).toHaveTextContent('open');
    });
  });

  it('opens modal on Ctrl+K', async () => {
    let hookResult: ReturnType<typeof useSearchModal>;

    function TestComponent() {
      hookResult = useSearchModal();
      return <div data-testid="open">{hookResult.open ? 'open' : 'closed'}</div>;
    }

    render(<TestComponent />);

    // Simulate Ctrl+K
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });

    await waitFor(() => {
      expect(screen.getByTestId('open')).toHaveTextContent('open');
    });
  });

  it('toggles modal on repeated Cmd+K', async () => {
    let hookResult: ReturnType<typeof useSearchModal>;

    function TestComponent() {
      hookResult = useSearchModal();
      return <div data-testid="open">{hookResult.open ? 'open' : 'closed'}</div>;
    }

    render(<TestComponent />);

    // First Cmd+K opens
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    await waitFor(() => {
      expect(screen.getByTestId('open')).toHaveTextContent('open');
    });

    // Second Cmd+K closes
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    await waitFor(() => {
      expect(screen.getByTestId('open')).toHaveTextContent('closed');
    });
  });

  it('toggle function works', async () => {
    let hookResult: ReturnType<typeof useSearchModal>;

    function TestComponent() {
      hookResult = useSearchModal();
      return (
        <button onClick={hookResult.toggle} data-testid="toggle">
          {hookResult.open ? 'open' : 'closed'}
        </button>
      );
    }

    const { user } = render(<TestComponent />);

    expect(screen.getByTestId('toggle')).toHaveTextContent('closed');

    await user.click(screen.getByTestId('toggle'));

    expect(screen.getByTestId('toggle')).toHaveTextContent('open');
  });

  it('setOpen function works', () => {
    let hookResult: ReturnType<typeof useSearchModal>;

    function TestComponent() {
      hookResult = useSearchModal();
      return (
        <div>
          <button onClick={() => hookResult.setOpen(true)} data-testid="open-btn">Open</button>
          <button onClick={() => hookResult.setOpen(false)} data-testid="close-btn">Close</button>
          <div data-testid="state">{hookResult.open ? 'open' : 'closed'}</div>
        </div>
      );
    }

    const { user } = render(<TestComponent />);

    expect(screen.getByTestId('state')).toHaveTextContent('closed');
  });

  it('does not trigger on regular k key press', async () => {
    let hookResult: ReturnType<typeof useSearchModal>;

    function TestComponent() {
      hookResult = useSearchModal();
      return <div data-testid="open">{hookResult.open ? 'open' : 'closed'}</div>;
    }

    render(<TestComponent />);

    // Just pressing k without modifier should not open
    fireEvent.keyDown(document, { key: 'k' });

    // Should still be closed
    expect(screen.getByTestId('open')).toHaveTextContent('closed');
  });

  it('cleans up event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

    function TestComponent() {
      useSearchModal();
      return null;
    }

    const { unmount } = render(<TestComponent />);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
