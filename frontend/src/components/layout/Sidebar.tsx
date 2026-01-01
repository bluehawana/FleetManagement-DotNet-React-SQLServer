'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
    { icon: '📊', label: 'Dashboard', href: '/' },
    { icon: '📡', label: 'Monitoring', href: '/monitoring' },
    { icon: '🔧', label: 'Workshop', href: '/workshop' },
    { icon: '📈', label: 'Analytics', href: '/analytics' },
    { icon: '📋', label: 'Logs', href: '/activity-logs' },
];

const reportItems = [
    { icon: '📄', label: 'Daily Report', href: '/reports/daily' },
    { icon: '📊', label: 'Weekly Summary', href: '/reports/weekly' },
    { icon: '📥', label: 'Export Data', href: '/reports/export' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-full w-60 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] z-50 flex flex-col">
            {/* Logo */}
            <div className="p-4 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[var(--accent-blue)] flex items-center justify-center">
                        <span className="text-white text-lg font-bold">⚡</span>
                    </div>
                    <div>
                        <h1 className="font-semibold text-[var(--text-primary)] text-base">FleetCommand</h1>
                        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Enterprise</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="p-3">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-md px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-blue)] transition-colors"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs">⌘K</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 overflow-y-auto">
                <p className="px-3 py-2 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Main Menu</p>
                <div className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                            >
                                <span className="text-base">{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>

                <p className="px-3 py-2 mt-6 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Reports</p>
                <div className="space-y-1">
                    {reportItems.map((item) => (
                        <Link key={item.href} href={item.href} className="nav-item">
                            <span className="text-base">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-[var(--border-subtle)]">
                <Link href="/settings" className="nav-item">
                    <span className="text-base">⚙️</span>
                    <span>Settings</span>
                </Link>
            </div>

            {/* Status */}
            <div className="p-3 bg-[var(--bg-primary)] border-t border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent-green)] pulse"></span>
                    <span className="text-xs text-[var(--text-muted)]">All systems operational</span>
                </div>
            </div>
        </aside>
    );
}
