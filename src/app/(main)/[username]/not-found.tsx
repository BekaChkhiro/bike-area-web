import Link from 'next/link';
import { UserX } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ProfileNotFound() {
  return (
    <Card className="mx-auto max-w-md">
      <CardContent className="flex flex-col items-center py-12 text-center">
        <UserX className="mb-4 size-16 text-muted-foreground" />
        <h1 className="mb-2 text-2xl font-bold">User Not Found</h1>
        <p className="mb-6 text-muted-foreground">
          The user you&apos;re looking for doesn&apos;t exist or may have been
          removed.
        </p>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
