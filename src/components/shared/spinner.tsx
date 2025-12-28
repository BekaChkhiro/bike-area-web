'use client';

import { Loader2 } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const spinnerVariants = cva('animate-spin transition-colors', {
  variants: {
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
    variant: {
      default: 'text-primary',
      muted: 'text-muted-foreground',
      white: 'text-white',
      destructive: 'text-destructive',
      secondary: 'text-secondary',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
});

export interface SpinnerProps
  extends React.HTMLAttributes<SVGElement>,
    VariantProps<typeof spinnerVariants> {}

export function Spinner({ className, size, variant, ...props }: SpinnerProps) {
  return (
    <Loader2
      className={cn(spinnerVariants({ size, variant }), className)}
      {...props}
    />
  );
}

// Spinner with text
interface SpinnerWithTextProps extends SpinnerProps {
  text?: string;
  textClassName?: string;
}

export function SpinnerWithText({
  text,
  textClassName,
  ...spinnerProps
}: SpinnerWithTextProps) {
  return (
    <div className="flex items-center gap-2">
      <Spinner {...spinnerProps} />
      {text && (
        <span className={cn('text-sm text-muted-foreground', textClassName)}>
          {text}
        </span>
      )}
    </div>
  );
}

// Centered spinner for containers
interface CenteredSpinnerProps extends SpinnerProps {
  containerClassName?: string;
}

export function CenteredSpinner({
  containerClassName,
  ...spinnerProps
}: CenteredSpinnerProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center p-10',
        containerClassName
      )}
    >
      <Spinner {...spinnerProps} />
    </div>
  );
}

// Overlay spinner for loading states
interface OverlaySpinnerProps extends SpinnerProps {
  show?: boolean;
}

export function OverlaySpinner({ show = true, ...spinnerProps }: OverlaySpinnerProps) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-background/85 backdrop-blur-sm">
      <Spinner {...spinnerProps} />
    </div>
  );
}

// Button spinner (smaller, inline)
export function ButtonSpinner({ className }: { className?: string }) {
  return <Spinner size="sm" className={cn('mr-2', className)} />;
}
