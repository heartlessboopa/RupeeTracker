import Link from 'next/link';
import { Activity } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/90">
            <Activity className="h-7 w-7" />
            <h1 className="text-2xl font-headline font-bold">RupeeTrack</h1>
          </Link>
          {/* Future navigation items can go here */}
        </div>
      </div>
    </header>
  );
}
