'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
      { name: 'Dashboard', href: '/', icon: 'dashboard' },
      { name: 'Invoices', href: '/invoices', icon: 'receipt_long' },
      { name: 'Clients', href: '/clients', icon: 'group' },
      { name: 'Reports', href: '/reports', icon: 'bar_chart_4_bars' },
      { name: 'Settings', href: '/settings', icon: 'settings' },
];

export function Sidebar() {
      const pathname = usePathname();

      return (
            <aside className="w-64 flex-shrink-0 bg-white dark:bg-[#1a1a1a] border-r border-neutral-200 dark:border-neutral-800 flex flex-col sticky top-0 h-screen z-20 font-sans">
                  <div className="p-6 flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#1a1a1a] dark:bg-white rounded flex items-center justify-center">
                              <span className="material-symbols-outlined text-white dark:text-[#1a1a1a] text-xl font-variation-fill">dataset</span>
                        </div>
                        <div>
                              <h1 className="text-[#1a1a1a] dark:text-white text-sm font-bold leading-none tracking-tight">VocalRoute</h1>
                              <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-tighter mt-1">Enterprise Suite</p>
                        </div>
                  </div>

                  <nav className="flex-1 px-4 flex flex-col gap-1 mt-4">
                        {navItems.map((item) => {
                              const isActive = pathname === item.href;
                              return (
                                    <Link
                                          key={item.name}
                                          href={item.href}
                                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${isActive
                                                      ? 'bg-neutral-100 dark:bg-white/10 text-[#1a1a1a] dark:text-white font-semibold'
                                                      : 'text-neutral-500 hover:text-[#1a1a1a] dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-white/5'
                                                }`}
                                    >
                                          <span className={`material-symbols-outlined text-xl ${isActive ? 'font-variation-fill' : ''}`}>{item.icon}</span>
                                          <span className="text-sm font-medium">{item.name}</span>
                                    </Link>
                              );
                        })}
                  </nav>

                  <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-1">
                        <a className="flex items-center gap-3 px-3 py-2 text-neutral-500 hover:text-[#1a1a1a] dark:hover:text-white transition-colors" href="#">
                              <span className="material-symbols-outlined text-xl">help_outline</span>
                              <span className="text-sm font-medium">Help Center</span>
                        </a>
                        <a className="flex items-center gap-3 px-3 py-2 text-neutral-500 hover:text-red-500 transition-colors" href="#">
                              <span className="material-symbols-outlined text-xl">logout</span>
                              <span className="text-sm font-medium">Logout</span>
                        </a>
                  </div>
            </aside>
      );
}
