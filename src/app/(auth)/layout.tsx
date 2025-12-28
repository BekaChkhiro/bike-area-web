import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggleSimple } from '@/components/shared/theme-toggle';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Header */}
      <header className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/Rideway-logo.svg"
            alt="Rideway"
            width={120}
            height={40}
            className="h-10 w-auto"
          />
        </Link>
        <ThemeToggleSimple />
      </header>

      {/* Main content */}
      <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 px-4 py-16">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Rideway. All rights reserved.</p>
      </footer>
    </div>
  );
}
