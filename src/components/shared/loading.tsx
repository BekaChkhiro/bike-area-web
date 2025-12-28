'use client';

import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export function Loading({
  className,
  size = 'md',
  text,
  fullScreen = false,
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <Image
              src="/Rideway-logo.svg"
              alt="Rideway"
              width={120}
              height={40}
              className="h-12 w-auto animate-pulse"
            />
            <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background shadow-md">
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            </div>
          </div>
          {text && (
            <p className="text-sm font-medium text-muted-foreground animate-pulse">{text}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-3',
        className
      )}
    >
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && <span className="text-sm font-medium text-muted-foreground">{text}</span>}
    </div>
  );
}

// Simple spinner variant
export function Spinner({ className, size = 'md' }: Omit<LoadingProps, 'text' | 'fullScreen'>) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <Loader2
      className={cn('animate-spin text-primary transition-colors', sizeClasses[size], className)}
    />
  );
}
