'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, History, Send, Settings } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/history', label: 'History', icon: History },
    { href: '/send', label: 'Send', icon: Send },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-border-default h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-brand-primary">Flux</h1>
      </div>

      <nav className="flex-1 px-3">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                isActive
                  ? 'bg-brand-primary text-white'
                  : 'text-text-secondary hover:bg-background-secondary hover:text-text-primary'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
