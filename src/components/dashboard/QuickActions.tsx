import Link from 'next/link';
import { Send, HandHeart, TrendingUp } from 'lucide-react';

export default function QuickActions() {
  const actions = [
    { icon: Send, label: 'Send', href: '/send', color: 'bg-brand-primary' },
    { icon: HandHeart, label: 'Donate', href: '/onboarding', color: 'bg-brand-success' },
    { icon: TrendingUp, label: 'Request', href: '/request', color: 'bg-brand-secondary' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white hover:bg-background-secondary transition-colors"
        >
          <div className={`${action.color} w-12 h-12 rounded-full flex items-center justify-center`}>
            <action.icon className="w-6 h-6 text-white" />
          </div>
          <span className="text-sm font-medium text-text-primary">{action.label}</span>
        </Link>
      ))}
    </div>
  );
}
