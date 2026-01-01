'use client';

import { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Info,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  source: string;
  message: string;
  details?: string;
}

const mockLogs: LogEntry[] = [
  { id: '1', timestamp: '2026-01-01 17:45:23', level: 'success', source: 'Fleet', message: 'Bus 08 completed route 7A', details: '124 passengers, on-time' },
  { id: '2', timestamp: '2026-01-01 17:44:12', level: 'warning', source: 'Maintenance', message: 'Bus 12 maintenance reminder', details: 'Oil change due in 3 days' },
  { id: '3', timestamp: '2026-01-01 17:42:45', level: 'info', source: 'System', message: 'Dashboard data refreshed', details: 'Auto-sync completed' },
  { id: '4', timestamp: '2026-01-01 17:40:33', level: 'error', source: 'Alert', message: 'Bus 05 reported engine warning', details: 'Check engine light activated' },
  { id: '5', timestamp: '2026-01-01 17:38:21', level: 'info', source: 'Driver', message: 'Driver John started shift', details: 'Assigned to Bus 15' },
  { id: '6', timestamp: '2026-01-01 17:35:10', level: 'success', source: 'Fuel', message: 'Bus 10 refueled', details: '45 gallons at $3.89/gal' },
  { id: '7', timestamp: '2026-01-01 17:32:44', level: 'warning', source: 'Route', message: 'Route 3B experiencing delays', details: 'Traffic congestion on Main St' },
  { id: '8', timestamp: '2026-01-01 17:30:15', level: 'info', source: 'API', message: 'External data sync completed', details: 'US DOT data updated' },
];

const levelConfig: Record<string, { icon: any; bg: string; color: string; badge: string }> = {
  info: { icon: Info, bg: 'bg-[var(--info-light)]', color: 'text-[var(--info)]', badge: 'badge-info' },
  warning: { icon: AlertTriangle, bg: 'bg-[var(--warning-light)]', color: 'text-[var(--warning)]', badge: 'badge-warning' },
  error: { icon: XCircle, bg: 'bg-[var(--danger-light)]', color: 'text-[var(--danger)]', badge: 'badge-danger' },
  success: { icon: CheckCircle, bg: 'bg-[var(--success-light)]', color: 'text-[var(--success)]', badge: 'badge-success' },
};

export default function ActivityLogsPage() {
  const [filter, setFilter] = useState<'all' | 'info' | 'warning' | 'error' | 'success'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = mockLogs.filter(log => {
    if (filter !== 'all' && log.level !== filter) return false;
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Activity Logs</h1>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">
            System events and audit trail
          </p>
        </div>
        <button className="btn btn-secondary">
          <Download size={16} />
          Export Logs
        </button>
      </div>

      {/* Stats */}
      <div className="grid-cols-4">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon blue">
              <Info size={20} />
            </div>
          </div>
          <div className="stat-value">1,245</div>
          <div className="stat-label">Info Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon yellow">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="stat-value">23</div>
          <div className="stat-label">Warnings</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon red">
              <XCircle size={20} />
            </div>
          </div>
          <div className="stat-value">5</div>
          <div className="stat-label">Errors</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon green">
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="stat-value">847</div>
          <div className="stat-label">Successful</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body py-3">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" size={18} />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              {(['all', 'info', 'warning', 'error', 'success'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setFilter(level)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filter === level
                      ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                      : 'text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)]'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Recent Activity</h3>
            <p className="card-description">Showing {filteredLogs.length} events</p>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-[var(--foreground-muted)]" />
            <span className="text-xs text-[var(--foreground-muted)]">Live updates</span>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="divide-y divide-[var(--border)]">
            {filteredLogs.map((log) => {
              const config = levelConfig[log.level];
              const Icon = config.icon;
              return (
                <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-[var(--background-secondary)] transition-colors">
                  <div className={`w-9 h-9 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge badge-default">{log.source}</span>
                      <span className={`badge ${config.badge}`}>{log.level}</span>
                    </div>
                    <p className="text-sm text-[var(--foreground)]">{log.message}</p>
                    {log.details && (
                      <p className="text-xs text-[var(--foreground-muted)] mt-1">{log.details}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-[var(--foreground-muted)]">{log.timestamp.split(' ')[1]}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">{log.timestamp.split(' ')[0]}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* API & Audit */}
      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">API Request Log</h3>
              <p className="card-description">Recent API calls</p>
            </div>
          </div>
          <div className="card-body">
            <div className="font-mono text-xs space-y-2">
              <div className="flex items-center gap-3 p-2 bg-[var(--background-secondary)] rounded">
                <span className="text-[var(--success)] font-semibold">200</span>
                <span className="text-[var(--foreground-muted)]">GET</span>
                <span className="text-[var(--foreground-secondary)] flex-1 truncate">/api/dashboard/kpis</span>
                <span className="text-[var(--foreground-muted)]">12ms</span>
              </div>
              <div className="flex items-center gap-3 p-2 bg-[var(--background-secondary)] rounded">
                <span className="text-[var(--success)] font-semibold">200</span>
                <span className="text-[var(--foreground-muted)]">GET</span>
                <span className="text-[var(--foreground-secondary)] flex-1 truncate">/api/dashboard/fleet-status</span>
                <span className="text-[var(--foreground-muted)]">8ms</span>
              </div>
              <div className="flex items-center gap-3 p-2 bg-[var(--background-secondary)] rounded">
                <span className="text-[var(--success)] font-semibold">200</span>
                <span className="text-[var(--foreground-muted)]">GET</span>
                <span className="text-[var(--foreground-secondary)] flex-1 truncate">/api/insights/roi-summary</span>
                <span className="text-[var(--foreground-muted)]">45ms</span>
              </div>
              <div className="flex items-center gap-3 p-2 bg-[var(--background-secondary)] rounded">
                <span className="text-[var(--warning)] font-semibold">304</span>
                <span className="text-[var(--foreground-muted)]">GET</span>
                <span className="text-[var(--foreground-secondary)] flex-1 truncate">/api/buses</span>
                <span className="text-[var(--foreground-muted)]">3ms</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Audit Trail</h3>
              <p className="card-description">User actions</p>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              <div className="flex items-center gap-3 py-2 border-b border-[var(--border)]">
                <div className="w-8 h-8 rounded-full bg-[var(--info)] flex items-center justify-center text-xs text-white font-semibold">M</div>
                <div className="flex-1">
                  <p className="text-sm text-[var(--foreground)]">Manager updated Bus 08 status</p>
                  <p className="text-xs text-[var(--foreground-muted)]">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2 border-b border-[var(--border)]">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-xs text-white font-semibold">S</div>
                <div className="flex-1">
                  <p className="text-sm text-[var(--foreground)]">System generated daily report</p>
                  <p className="text-xs text-[var(--foreground-muted)]">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 rounded-full bg-[var(--success)] flex items-center justify-center text-xs text-white font-semibold">A</div>
                <div className="flex-1">
                  <p className="text-sm text-[var(--foreground)]">Admin seeded mock data</p>
                  <p className="text-xs text-[var(--foreground-muted)]">6 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
