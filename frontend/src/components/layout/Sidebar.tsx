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
  Truck,
  Gauge,
  LineChart,
  ExternalLink
} from 'lucide-react';

const mainNav = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Gauge, label: 'KPI Dashboard', href: '/kpi-dashboard', badge: 'New' },
  { icon: Bus, label: 'Fleet Overview', href: '/comprehensive' },
  { icon: Activity, label: 'Live Tracking', href: '/monitoring' },
  { icon: Wrench, label: 'Maintenance', href: '/workshop' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
];

const secondaryNav = [
  { icon: LineChart, label: 'Grafana', href: 'http://localhost:3001', external: true },
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
          {mainNav.map((item: any) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
              >
                <Icon className="sidebar-link-icon" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[var(--primary)] text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">System</div>
          {secondaryNav.map((item: any) => {
            const Icon = item.icon;
            if (item.external) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sidebar-link"
                >
                  <Icon className="sidebar-link-icon" />
                  <span>{item.label}</span>
                  <ExternalLink size={12} className="ml-auto opacity-50" />
                </a>
              );
            }
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
