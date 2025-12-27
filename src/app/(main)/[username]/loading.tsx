import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileLoading() {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        {/* Cover skeleton */}
        <Skeleton className="h-32 w-full sm:h-48 lg:h-56" />

        <div className="relative px-4 pb-4 sm:px-6">
          {/* Avatar skeleton */}
          <div className="-mt-16 mb-4 sm:-mt-20">
            <Skeleton className="size-28 rounded-full sm:size-36" />
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-16 w-full max-w-md" />
              <div className="flex gap-4">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="flex gap-6">
                <Skeleton className="h-12 w-16" />
                <Skeleton className="h-12 w-16" />
                <Skeleton className="h-12 w-16" />
              </div>
            </div>

            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="size-9" />
              <Skeleton className="size-9" />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex gap-4 border-b pb-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
