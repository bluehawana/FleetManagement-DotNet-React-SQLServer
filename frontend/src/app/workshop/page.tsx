'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useState } from 'react';
import {
  Wrench,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Plus,
  Filter,
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';

// US State license plate formats
const generateLicensePlate = (index: number): string => {
  const states = ['CA', 'TX', 'FL', 'NY', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];
  const state = states[index % states.length];
  const letters = 'ABCDEFGHJKLMNPRSTUVWXYZ';
  const numbers = Math.floor(1000 + Math.random() * 9000);
  const letterPart = letters[index % letters.length] + letters[(index + 3) % letters.length] + letters[(index + 7) % letters.length];
  return `${state} ${letterPart}-${numbers}`;
};

function MaintenanceCard({ alert, index }: { alert: any; index: number }) {
  const licensePlate = generateLicensePlate(index);
  const isUrgent = alert.daysUntilDue <= 3;
  const isWarning = alert.daysUntilDue <= 7 && alert.daysUntilDue > 3;

  return (
    <div className={`card border-l-4 ${isUrgent ? 'border-l-[var(--danger)]' : isWarning ? 'border-l-[var(--warning)]' : 'border-l-[var(--info)]'}`}>
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isUrgent ? 'bg-[var(--danger-light)]' : isWarning ? 'bg-[var(--warning-light)]' : 'bg-[var(--info-light)]'
            }`}>
              <Wrench size={20} className={isUrgent ? 'text-[var(--danger)]' : isWarning ? 'text-[var(--warning)]' : 'text-[var(--info)]'} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[var(--foreground)]">Bus {alert.busNumber}</h3>
                <span className="text-xs font-mono text-[var(--foreground-muted)]">{licensePlate}</span>
              </div>
              <p className="text-sm text-[var(--foreground-secondary)] mt-1">{alert.recommendation || 'Scheduled Maintenance'}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-[var(--foreground-muted)]">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  Due in {alert.daysUntilDue} days
                </span>
                <span>{(alert.currentMileage || 0).toLocaleString()} miles</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`badge ${isUrgent ? 'badge-danger' : isWarning ? 'badge-warning' : 'badge-info'}`}>
              {isUrgent ? 'Urgent' : isWarning ? 'Soon' : 'Scheduled'}
            </span>
            <button className="btn btn-secondary btn-sm">Schedule</button>
          </div>
        </div>
        {alert.costIfBreakdown && (
          <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between">
            <span className="text-xs text-[var(--foreground-muted)]">Estimated cost if breakdown</span>
            <span className="text-sm font-semibold text-[var(--danger)]">${alert.costIfBreakdown.toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WorkshopPage() {
  const [activeTab, setActiveTab] = useState<'queue' | 'scheduled' | 'completed'>('queue');

  const { data: maintenanceAlerts, isLoading } = useQuery({
    queryKey: ['maintenance-alerts'],
    queryFn: async () => (await api.insights.maintenanceAlerts()).data,
  });

  const { data: buses } = useQuery({
    queryKey: ['buses'],
    queryFn: async () => (await api.bus.getAll()).data,
  });

  const maintenanceBuses = buses?.filter((b: any) => b.status === 'InMaintenance') || [];
  const urgentCount = maintenanceAlerts?.urgentAlerts?.length || 0;
  const upcomingCount = maintenanceAlerts?.upcomingMaintenance?.length || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-[var(--foreground-muted)] mt-3">Loading maintenance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Maintenance</h1>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">
            Schedule and track vehicle maintenance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary">
            <Filter size={16} />
            Filter
          </button>
          <button className="btn btn-primary">
            <Plus size={16} />
            New Work Order
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-cols-4">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon yellow">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="stat-value">{urgentCount}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon blue">
              <Wrench size={20} />
            </div>
          </div>
          <div className="stat-value">{maintenanceBuses.length}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon green">
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="stat-value">3</div>
          <div className="stat-label">Completed Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon red">
              <Clock size={20} />
            </div>
          </div>
          <div className="stat-value">{upcomingCount}</div>
          <div className="stat-label">Upcoming</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)] pb-4">
        {(['queue', 'scheduled', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                : 'text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)]'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'queue' && urgentCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-[var(--danger)] text-white rounded-full">
                {urgentCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {maintenanceAlerts?.urgentAlerts?.map((alert: any, idx: number) => (
            <MaintenanceCard key={idx} alert={alert} index={idx} />
          ))}
          {(!maintenanceAlerts?.urgentAlerts || maintenanceAlerts.urgentAlerts.length === 0) && (
            <div className="card">
              <div className="card-body py-12 text-center">
                <CheckCircle size={48} className="mx-auto text-[var(--success)] mb-4" />
                <h3 className="text-lg font-semibold text-[var(--foreground)]">All caught up!</h3>
                <p className="text-sm text-[var(--foreground-muted)] mt-1">
                  No urgent maintenance needed
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'scheduled' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Scheduled Maintenance</h3>
              <p className="card-description">Upcoming service appointments</p>
            </div>
          </div>
          <div className="card-body">
            {maintenanceAlerts?.upcomingMaintenance?.slice(0, 5).map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--background-tertiary)] flex items-center justify-center">
                    <Calendar size={18} className="text-[var(--foreground-muted)]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">Bus {item.busNumber}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">{item.maintenanceType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[var(--foreground-muted)]">In {item.daysUntilDue} days</span>
                  <ChevronRight size={16} className="text-[var(--foreground-muted)]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'completed' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Completed Work Orders</h3>
              <p className="card-description">Recently finished maintenance</p>
            </div>
          </div>
          <div className="card-body">
            {[1, 2, 3].map((_, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--success-light)] flex items-center justify-center">
                    <CheckCircle size={18} className="text-[var(--success)]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">Bus {5 + idx} - Oil Change</p>
                    <p className="text-xs text-[var(--foreground-muted)]">Completed {idx + 1} hours ago</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-[var(--foreground)]">$245</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Currently In Workshop */}
      {maintenanceBuses.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Currently In Workshop</h3>
              <p className="card-description">Vehicles being serviced</p>
            </div>
          </div>
          <div className="card-body">
            {maintenanceBuses.map((bus: any, idx: number) => (
              <div key={bus.id} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[var(--info)] animate-pulse"></div>
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">Bus {bus.busNumber}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">Oil Change + Inspection</p>
                  </div>
                </div>
                <span className="badge badge-info">In Progress</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
