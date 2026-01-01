'use client';

import { usePathname } from 'next/navigation';
import { Search, Bell, Settings, ChevronRight } from 'lucide-react';

const pageNames: Record<string, string> = {
  '/': 'Dashboard',
  '/comprehensive': 'Fleet Overview',
  '/monitoring': 'Live Tracking',
  '/workshop': 'Maintenance',
  '/analytics': 'Analytics',
  '/activity-logs': 'Activity Logs',
  '/settings': 'Settings',
};

export function Header() {
  const pathname = usePathname();
  const currentPage = pageNames[pathname || '/'] || 'Dashboard';

  return (
    <header className="app-header">
      {/* Left: Breadcrumb */}
      <div className="header-breadcrumb">
        <span className="header-breadcrumb-item">FleetCommand</span>
        <ChevronRight size={14} className="header-breadcrumb-separator" />
        <span className="header-breadcrumb-current">{currentPage}</span>
      </div>

      {/* Right: Actions */}
      <div className="header-actions">
        {/* Search */}
        <div className="header-search">
          <Search className="header-search-icon" />
          <input type="text" placeholder="Search..." />
          <span className="header-search-kbd">⌘K</span>
        </div>

        {/* Notifications */}
        <button className="header-icon-btn">
          <Bell />
          <span className="header-notification-dot"></span>
        </button>

        {/* Settings */}
        <button className="header-icon-btn">
          <Settings />
        </button>

        {/* Avatar */}
        <div className="header-avatar">
          FM
        </div>
      </div>
    </header>
  );
}
