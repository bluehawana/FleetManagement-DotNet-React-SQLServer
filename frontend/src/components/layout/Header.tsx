'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const moduleNames: Record<string, string> = {
    '/': 'Dashboard',
    '/monitoring': 'Monitoring Hub',
    '/workshop': 'Workshop',
    '/analytics': 'Analytics',
    '/activity-logs': 'Activity Logs',
    '/settings': 'Settings',
};

export function Header() {
    const pathname = usePathname();
    const moduleName = moduleNames[pathname || '/'] || 'Fleet Command';
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        const updateTime = () => {
            setCurrentTime(new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            }));
        };
        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });

    return (
        <header className="h-14 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] flex items-center justify-between px-6 sticky top-0 z-40">
            {/* Left */}
            <div className="flex items-center gap-4">
                <h1 className="text-base font-semibold text-[var(--text-primary)]">{moduleName}</h1>
                <div className="hidden md:flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <span>FleetCommand</span>
                    <span>/</span>
                    <span className="text-[var(--text-secondary)]">{moduleName}</span>
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-4">
                {/* Time */}
                <div className="hidden lg:flex flex-col items-end">
                    <span className="text-sm font-medium text-[var(--text-primary)]">{currentTime}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{currentDate}</span>
                </div>

                <div className="h-6 w-px bg-[var(--border-color)] hidden lg:block"></div>

                {/* Actions */}
                <button className="p-2 rounded-md hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>

                <button className="relative p-2 rounded-md hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--accent-red)] rounded-full"></span>
                </button>

                <div className="h-6 w-px bg-[var(--border-color)]"></div>

                {/* User */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">FM</span>
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-medium text-[var(--text-primary)]">Fleet Manager</p>
                        <p className="text-[10px] text-[var(--text-muted)]">Admin</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
