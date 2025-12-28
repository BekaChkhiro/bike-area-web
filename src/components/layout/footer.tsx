import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-5">
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/Rideway-logo.svg"
                alt="Rideway"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The ultimate community for motorcycle enthusiasts. Connect, share, and ride together.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-5">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/explore" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                  Explore
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/forum" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                  Forum
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                  Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-5">
            <h4 className="font-semibold text-foreground">Company</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-5">
            <h4 className="font-semibold text-foreground">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} Rideway. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              Twitter
            </Link>
            <Link
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              Instagram
            </Link>
            <Link
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              Facebook
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
