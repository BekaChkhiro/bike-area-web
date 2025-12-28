import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';

import { SearchInput, SearchButton, HeaderSearch } from '@/components/search/search-input';
import { render } from '../../utils/test-utils';

describe('SearchInput', () => {
  describe('Display', () => {
    it('renders search input with icon', () => {
      render(<SearchInput value="" onChange={() => {}} />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('shows custom placeholder', () => {
      render(
        <SearchInput
          value=""
          onChange={() => {}}
          placeholder="Find something..."
        />
      );

      expect(screen.getByPlaceholderText('Find something...')).toBeInTheDocument();
    });

    it('shows default placeholder', () => {
      render(<SearchInput value="" onChange={() => {}} />);

      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('displays current value', () => {
      render(<SearchInput value="test query" onChange={() => {}} />);

      expect(screen.getByRole('textbox')).toHaveValue('test query');
    });

    it('shows keyboard hint when empty and hint enabled', () => {
      render(<SearchInput value="" onChange={() => {}} showKeyboardHint />);

      expect(screen.getByText('K')).toBeInTheDocument();
    });

    it('hides keyboard hint when has value', () => {
      render(
        <SearchInput value="test" onChange={() => {}} showKeyboardHint />
      );

      expect(screen.queryByText('K')).not.toBeInTheDocument();
    });

    it('hides keyboard hint when disabled', () => {
      render(
        <SearchInput value="" onChange={() => {}} showKeyboardHint={false} />
      );

      expect(screen.queryByText('K')).not.toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('calls onChange when typing', async () => {
      const onChange = vi.fn();
      const { user } = render(<SearchInput value="" onChange={onChange} />);

      await user.type(screen.getByRole('textbox'), 'a');

      expect(onChange).toHaveBeenCalled();
    });

    it('calls onSubmit on Enter key', async () => {
      const onSubmit = vi.fn();
      const { user } = render(
        <SearchInput value="test" onChange={() => {}} onSubmit={onSubmit} />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, '{Enter}');

      expect(onSubmit).toHaveBeenCalled();
    });

    it('calls onClear on Escape key', async () => {
      const onClear = vi.fn();
      const { user } = render(
        <SearchInput value="test" onChange={() => {}} onClear={onClear} />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, '{Escape}');

      expect(onClear).toHaveBeenCalled();
    });
  });

  describe('Clear Button', () => {
    it('shows clear button when value exists and onClear provided', () => {
      render(
        <SearchInput value="test" onChange={() => {}} onClear={() => {}} />
      );

      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    });

    it('hides clear button when no value', () => {
      render(
        <SearchInput value="" onChange={() => {}} onClear={() => {}} />
      );

      expect(
        screen.queryByRole('button', { name: /clear/i })
      ).not.toBeInTheDocument();
    });

    it('hides clear button when onClear not provided', () => {
      render(<SearchInput value="test" onChange={() => {}} />);

      expect(
        screen.queryByRole('button', { name: /clear/i })
      ).not.toBeInTheDocument();
    });

    it('calls onClear when clear button clicked', async () => {
      const onClear = vi.fn();
      const { user } = render(
        <SearchInput value="test" onChange={() => {}} onClear={onClear} />
      );

      await user.click(screen.getByRole('button', { name: /clear/i }));

      expect(onClear).toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('accepts custom className', () => {
      render(
        <SearchInput
          value=""
          onChange={() => {}}
          className="custom-input-class"
        />
      );

      expect(screen.getByRole('textbox')).toHaveClass('custom-input-class');
    });

    it('accepts custom containerClassName', () => {
      const { container } = render(
        <SearchInput
          value=""
          onChange={() => {}}
          containerClassName="custom-container"
        />
      );

      expect(container.firstChild).toHaveClass('custom-container');
    });
  });

  describe('Forwarded Ref', () => {
    it('forwards ref to input element', () => {
      const ref = vi.fn();
      render(<SearchInput ref={ref} value="" onChange={() => {}} />);

      expect(ref).toHaveBeenCalled();
    });
  });
});

describe('SearchButton', () => {
  it('renders search button with icon', () => {
    render(<SearchButton onClick={() => {}} />);

    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    const { user } = render(<SearchButton onClick={onClick} />);

    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalled();
  });

  it('accepts custom className', () => {
    render(<SearchButton onClick={() => {}} className="custom-class" />);

    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });
});

describe('HeaderSearch', () => {
  it('renders search button for mobile', () => {
    render(<HeaderSearch onOpenModal={() => {}} />);

    // Mobile button is visible (no sm:hidden check in JSDOM)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders desktop search input lookalike', () => {
    render(<HeaderSearch onOpenModal={() => {}} />);

    expect(screen.getByText('Search...')).toBeInTheDocument();
  });

  it('shows keyboard hint on desktop', () => {
    render(<HeaderSearch onOpenModal={() => {}} />);

    expect(screen.getByText('K')).toBeInTheDocument();
  });

  it('calls onOpenModal when clicked', async () => {
    const onOpenModal = vi.fn();
    const { user } = render(<HeaderSearch onOpenModal={onOpenModal} />);

    // Click the desktop search trigger
    const searchTrigger = screen.getByText('Search...').closest('button');
    if (searchTrigger) {
      await user.click(searchTrigger);
    }

    expect(onOpenModal).toHaveBeenCalled();
  });

  it('accepts custom className', () => {
    const { container } = render(
      <HeaderSearch onOpenModal={() => {}} className="custom-header-search" />
    );

    expect(container.firstChild).toHaveClass('custom-header-search');
  });
});
