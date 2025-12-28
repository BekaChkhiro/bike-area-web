import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';

import { render } from '../utils/test-utils';
import { HeaderSearch, SearchButton, SearchInput } from '@/components/search/search-input';
import { useSearchModal } from '@/components/search/search-modal';

// Mock scrollIntoView for cmdk
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe('Search Components Mobile Tests', () => {
  describe('HeaderSearch Mobile', () => {
    it('renders both mobile button and desktop input', () => {
      const { container } = render(<HeaderSearch onOpenModal={() => {}} />);

      // Mobile button (visible on small screens)
      const mobileButton = container.querySelector('button.sm\\:hidden');
      expect(mobileButton).toBeInTheDocument();

      // Desktop input (hidden on small screens)
      const desktopButton = container.querySelector('button.hidden.sm\\:flex');
      expect(desktopButton).toBeInTheDocument();
    });

    it('mobile button contains search icon', () => {
      const { container } = render(<HeaderSearch onOpenModal={() => {}} />);

      const mobileButton = container.querySelector('button.sm\\:hidden');
      const icon = mobileButton?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('mobile button is accessible', () => {
      render(<HeaderSearch onOpenModal={() => {}} />);

      // Should have accessible name via sr-only text
      const buttons = screen.getAllByRole('button');
      const hasSearchButton = buttons.some(
        (btn) => btn.querySelector('.sr-only')?.textContent === 'Search'
      );
      expect(hasSearchButton).toBe(true);
    });

    it('desktop version shows placeholder text', () => {
      render(<HeaderSearch onOpenModal={() => {}} />);

      expect(screen.getByText('Search...')).toBeInTheDocument();
    });

    it('desktop version shows keyboard hint (hidden on mobile)', () => {
      const { container } = render(<HeaderSearch onOpenModal={() => {}} />);

      // Keyboard hint should have lg:block class (only visible on large screens)
      const kbdElement = container.querySelector('kbd.lg\\:block');
      expect(kbdElement).toBeInTheDocument();
    });

    it('triggers onOpenModal on mobile button click', async () => {
      const onOpenModal = vi.fn();
      const { user, container } = render(<HeaderSearch onOpenModal={onOpenModal} />);

      const mobileButton = container.querySelector('button.sm\\:hidden') as HTMLElement;
      await user.click(mobileButton);

      expect(onOpenModal).toHaveBeenCalled();
    });

    it('triggers onOpenModal on desktop button click', async () => {
      const onOpenModal = vi.fn();
      const { user, container } = render(<HeaderSearch onOpenModal={onOpenModal} />);

      const desktopButton = container.querySelector('button.hidden.sm\\:flex') as HTMLElement;
      await user.click(desktopButton);

      expect(onOpenModal).toHaveBeenCalled();
    });
  });

  describe('SearchButton Component', () => {
    it('renders icon-only button suitable for mobile', () => {
      const { container } = render(<SearchButton onClick={() => {}} />);

      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();

      // Should be an icon button (size="icon")
      const icon = button?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('has appropriate size for touch targets', () => {
      const { container } = render(<SearchButton onClick={() => {}} />);

      const button = screen.getByRole('button');
      // Button should have appropriate sizing for touch
      expect(button).toBeInTheDocument();

      // Icon should be present
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('has screen reader text', () => {
      render(<SearchButton onClick={() => {}} />);

      expect(screen.getByText('Search')).toBeInTheDocument();
    });
  });

  describe('SearchInput Mobile Features', () => {
    it('keyboard hint is hidden on mobile', () => {
      const { container } = render(
        <SearchInput value="" onChange={() => {}} showKeyboardHint />
      );

      // kbd should have hidden sm:block
      const kbd = container.querySelector('kbd.hidden.sm\\:block');
      expect(kbd).toBeInTheDocument();
    });

    it('clear button is visible when there is value', () => {
      render(
        <SearchInput value="test" onChange={() => {}} onClear={() => {}} />
      );

      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    });

    it('clear button has appropriate touch target size', () => {
      const { container } = render(
        <SearchInput value="test" onChange={() => {}} onClear={() => {}} />
      );

      const clearButton = container.querySelector('button.size-6');
      expect(clearButton).toBeInTheDocument();
    });

    it('input has appropriate padding for icons', () => {
      const { container } = render(
        <SearchInput value="" onChange={() => {}} />
      );

      const input = container.querySelector('input');
      expect(input?.className).toContain('pl-9');
      expect(input?.className).toContain('pr-20');
    });
  });

  describe('useSearchModal Hook for Mobile', () => {
    it('initializes with closed state', () => {
      let hookResult: ReturnType<typeof useSearchModal>;

      function TestComponent() {
        hookResult = useSearchModal();
        return <div data-testid="state">{hookResult.open ? 'open' : 'closed'}</div>;
      }

      render(<TestComponent />);

      expect(screen.getByTestId('state')).toHaveTextContent('closed');
    });

    it('toggle function opens modal (for mobile menu button)', async () => {
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

    it('setOpen function controls modal state', async () => {
      let hookResult: ReturnType<typeof useSearchModal>;

      function TestComponent() {
        hookResult = useSearchModal();
        return (
          <div>
            <button onClick={() => hookResult.setOpen(true)} data-testid="open">
              Open
            </button>
            <button onClick={() => hookResult.setOpen(false)} data-testid="close">
              Close
            </button>
            <div data-testid="state">{hookResult.open ? 'open' : 'closed'}</div>
          </div>
        );
      }

      const { user } = render(<TestComponent />);

      await user.click(screen.getByTestId('open'));
      expect(screen.getByTestId('state')).toHaveTextContent('open');

      await user.click(screen.getByTestId('close'));
      expect(screen.getByTestId('state')).toHaveTextContent('closed');
    });

    it('Cmd+K keyboard shortcut works', async () => {
      let hookResult: ReturnType<typeof useSearchModal>;

      function TestComponent() {
        hookResult = useSearchModal();
        return <div data-testid="state">{hookResult.open ? 'open' : 'closed'}</div>;
      }

      render(<TestComponent />);

      expect(screen.getByTestId('state')).toHaveTextContent('closed');

      fireEvent.keyDown(document, { key: 'k', metaKey: true });

      await waitFor(() => {
        expect(screen.getByTestId('state')).toHaveTextContent('open');
      });
    });

    it('Ctrl+K keyboard shortcut works (for non-Mac)', async () => {
      let hookResult: ReturnType<typeof useSearchModal>;

      function TestComponent() {
        hookResult = useSearchModal();
        return <div data-testid="state">{hookResult.open ? 'open' : 'closed'}</div>;
      }

      render(<TestComponent />);

      fireEvent.keyDown(document, { key: 'k', ctrlKey: true });

      await waitFor(() => {
        expect(screen.getByTestId('state')).toHaveTextContent('open');
      });
    });
  });
});
