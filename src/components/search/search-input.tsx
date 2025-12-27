'use client';

import { forwardRef } from 'react';
import { Search, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  onSubmit?: () => void;
  showKeyboardHint?: boolean;
  containerClassName?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      onClear,
      onSubmit,
      showKeyboardHint = true,
      placeholder = 'Search...',
      className,
      containerClassName,
      ...props
    },
    ref
  ) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onSubmit?.();
      }
      if (e.key === 'Escape') {
        onClear?.();
      }
    };

    return (
      <div className={cn('relative', containerClassName)}>
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn('pl-9 pr-20', className)}
          {...props}
        />

        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {value && onClear && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={onClear}
            >
              <X className="size-3.5" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}

          {showKeyboardHint && !value && (
            <kbd className="pointer-events-none hidden select-none rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:block">
              <span className="text-xs">⌘</span>K
            </kbd>
          )}
        </div>
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

// Compact button version for mobile header
interface SearchButtonProps {
  onClick: () => void;
  className?: string;
}

export function SearchButton({ onClick, className }: SearchButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={className}
    >
      <Search className="size-5" />
      <span className="sr-only">Search</span>
    </Button>
  );
}

// Expandable search for header (shows input on larger screens, button on mobile)
interface HeaderSearchProps {
  onOpenModal: () => void;
  className?: string;
}

export function HeaderSearch({ onOpenModal, className }: HeaderSearchProps) {
  return (
    <div className={cn('flex items-center', className)}>
      {/* Mobile: Just a button */}
      <SearchButton onClick={onOpenModal} className="sm:hidden" />

      {/* Desktop: Clickable search input lookalike */}
      <button
        type="button"
        onClick={onOpenModal}
        className="hidden h-9 w-64 items-center gap-2 rounded-md border bg-muted/50 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted sm:flex lg:w-80"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="pointer-events-none hidden select-none rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium lg:block">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
    </div>
  );
}
