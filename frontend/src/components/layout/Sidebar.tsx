'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bus,
  Activity,
  Wrench,
  BarChart3,
  FileText,
  Settings,
  HelpCircle,
  Truck
} from 'lucide-react';

const mainNav = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Bus, label: 'Fleet Overview', href: '/comprehensive' },
  { icon: Activity, label: 'Live Tracking', href: '/monitoring' },
  { icon: Wrench, label: 'Maintenance', href: '/workshop' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
];

const secondaryNav = [
  { icon: FileText, label: 'Activity Logs', href: '/activity-logs' },
  { icon: Settings, label: 'Settings', href: '/settings' },
  { icon: HelpCircle, label: 'Help & Support', href: '/help' },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    <aside className="app-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-inner">
          <div className="sidebar-logo-icon">
            <Truck size={20} />
          </div>
          <span className="sidebar-logo-text">FleetCommand</span>
          <span className="sidebar-logo-badge">Pro</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <div className="sidebar-section-title">Main Menu</div>
          {mainNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
              >
                <Icon className="sidebar-link-icon" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">System</div>
          {secondaryNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
              >
                <Icon className="sidebar-link-icon" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-status">
          <span className="sidebar-status-dot"></span>
          <span>All systems operational</span>
        </div>
      </div>
    </aside>
  );
}
