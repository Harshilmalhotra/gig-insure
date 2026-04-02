'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, AlertTriangle, Sliders, Users, Shield, Menu, X, Bell, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

const NAV = [
  { href: '/dashboard',  icon: LayoutDashboard, label: 'Overview' },
  { href: '/claims',     icon: FileText,         label: 'Claims' },
  { href: '/fraud',      icon: AlertTriangle,    label: 'Fraud' },
  { href: '/simulation', icon: Sliders,          label: 'Simulation' },
  { href: '/workers',    icon: Users,            label: 'Workers' },
];

export default function AdminNav({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#06060f]">
      {open && (
        <div className="fixed inset-0 bg-black/70 z-20 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <aside className={clsx(
        'fixed inset-y-0 left-0 z-30 w-60 bg-[#090915] border-r border-[#1a1a2e] flex flex-col transition-transform duration-300',
        'lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-[#1a1a2e]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Shield size={15} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">GigInsure</div>
              <div className="text-[10px] text-indigo-400 font-mono tracking-wider">ADMIN CONSOLE</div>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden text-gray-600 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Status */}
        <div className="mx-4 my-4 flex items-center gap-2 bg-green-400/5 border border-green-400/15 rounded-xl px-3 py-2.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
          <span className="text-xs text-green-400 font-medium">All systems operational</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = path === href || path.startsWith(href + '/');
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150',
                  active
                    ? 'bg-indigo-600/15 text-indigo-400 font-semibold border border-indigo-500/20'
                    : 'text-gray-500 hover:text-gray-200 hover:bg-[#11111f]'
                )}>
                <Icon size={16} />
                {label}
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-5 border-t border-[#1a1a2e] pt-4 space-y-3">
          <div className="px-3">
            <div className="text-xs font-semibold text-white">Admin User</div>
            <div className="text-[11px] text-gray-600 mt-0.5">admin@giginsure.in</div>
          </div>
          <button className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-400/5 w-full transition-all">
            <LogOut size={15} /> Sign Out
          </button>
          <div className="px-3">
            <div className="text-[10px] text-gray-700 font-mono">Engine v2.1.0 · Build 441</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-60">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#090915] border-b border-[#1a1a2e] sticky top-0 z-10">
          <button onClick={() => setOpen(true)} className="text-gray-400">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <Shield size={15} className="text-indigo-400" />
            <span className="text-sm font-bold text-white">GigInsure Admin</span>
          </div>
          <button className="text-gray-400 relative">
            <Bell size={20} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
