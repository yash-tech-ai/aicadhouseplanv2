'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Building2,
  LayoutDashboard,
  FileText,
  Upload,
  Search,
  Sparkles,
  CheckCircle,
  Settings,
  Users,
} from 'lucide-react';

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Drawings',
    href: '/dashboard/drawings',
    icon: FileText,
  },
  {
    title: 'Upload',
    href: '/dashboard/upload',
    icon: Upload,
  },
  {
    title: 'Search & Match',
    href: '/dashboard/search',
    icon: Search,
  },
  {
    title: 'AI Suggestions',
    href: '/dashboard/suggestions',
    icon: Sparkles,
  },
  {
    title: 'Validation',
    href: '/dashboard/validation',
    icon: CheckCircle,
  },
  {
    title: 'Admin',
    href: '/dashboard/admin',
    icon: Users,
    adminOnly: true,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-slate-800">
        <Building2 className="h-8 w-8 text-blue-400" />
        <span className="text-lg font-bold">CAD Manager</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
