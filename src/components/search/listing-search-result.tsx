'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ImageIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Listing } from '@/types/search';

interface ListingSearchResultProps {
  listing: Listing;
  onClick?: () => void;
  className?: string;
}

const conditionLabels: Record<Listing['condition'], string> = {
  new: 'New',
  'like-new': 'Like New',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
};

const conditionColors: Record<Listing['condition'], string> = {
  new: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  'like-new': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  good: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  fair: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
  poor: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
};

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function ListingSearchResult({
  listing,
  onClick,
  className,
}: ListingSearchResultProps) {
  const firstImage = listing.images?.[0];
  const hasImage = !!firstImage;

  return (
    <Link
      href={`/marketplace/${listing.id}`}
      onClick={onClick}
      className={cn(
        'flex gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50',
        className
      )}
    >
      {/* Image */}
      <div className="relative size-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
        {hasImage && firstImage ? (
          <Image
            src={firstImage}
            alt={listing.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="size-8 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-medium">{listing.title}</h3>

        <p className="mt-1 text-lg font-semibold text-primary">
          {formatPrice(listing.price, listing.currency)}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className={cn('text-xs', conditionColors[listing.condition])}
          >
            {conditionLabels[listing.condition]}
          </Badge>

          {listing.location && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3" />
              {listing.location}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// Compact version for command menu
export function ListingSearchResultCompact({
  listing,
  onClick,
  className,
}: ListingSearchResultProps) {
  const firstImage = listing.images?.[0];
  const hasImage = !!firstImage;

  return (
    <Link
      href={`/marketplace/${listing.id}`}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors',
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative size-10 flex-shrink-0 overflow-hidden rounded bg-muted">
        {hasImage && firstImage ? (
          <Image
            src={firstImage}
            alt={listing.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="size-4 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{listing.title}</p>
        <p className="text-xs font-semibold text-primary">
          {formatPrice(listing.price, listing.currency)}
        </p>
      </div>

      <Badge
        variant="secondary"
        className={cn('flex-shrink-0 text-[10px]', conditionColors[listing.condition])}
      >
        {conditionLabels[listing.condition]}
      </Badge>
    </Link>
  );
}
