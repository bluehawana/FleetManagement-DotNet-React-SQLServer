'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

// Stat Card Component
function StatCard({ label, value, change, icon, iconBg }: {
  label: string;
  value: string | number;
  change?: { value: string; positive: boolean };
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <div className="stat-box fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="stat-label">{label}</p>
          <p className="stat-value">{value}</p>
          {change && (
            <span className={`stat-change ${change.positive ? 'positive' : 'negative'}`}>
              {change.positive ? '↑' : '↓'} {change.value}
            </span>
          )}
        </div>
        <div className={`action-item-icon ${iconBg}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Panel Component
function Panel({ title, actions, children, className = '' }: {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`card fade-in ${className}`}>
      <div className="card-header">
        <h3>{title}</h3>
        {actions}
      </div>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['kpis'],
    queryFn: async () => {
      const response = await api.dashboard.kpis();
      return response.data;
    },
    refetchInterval: 30000,
  });

  const { data: fleetStatus } = useQuery({
    queryKey: ['fleet-status'],
    queryFn: async () => {
      const response = await api.dashboard.fleetStatus();
      return response.data;
    },
    refetchInterval: 10000,
  });

  const { data: roiSummary } = useQuery({
    queryKey: ['roi-summary'],
    queryFn: async () => {
      const response = await api.insights.roiSummary(30);
      return response.data;
    },
  });

  const { data: maintenanceAlerts } = useQuery({
    queryKey: ['maintenance-alerts'],
    queryFn: async () => {
      const response = await api.insights.maintenanceAlerts();
      return response.data;
    },
  });

  if (kpisLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[var(--accent-blue)] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[var(--text-secondary)] mt-4 text-sm">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid-responsive">
        <StatCard
          label="Total Fleet"
          value={kpis?.totalBuses || 0}
          change={{ value: '+5%', positive: true }}
          icon={<span className="text-xl">🚌</span>}
          iconBg="blue"
        />
        <StatCard
          label="Passengers (30d)"
          value={`${((kpis?.totalPassengersLast30Days || 0) / 1000).toFixed(0)}K`}
          change={{ value: '+12.5%', positive: true }}
          icon={<span className="text-xl">👥</span>}
          iconBg="green"
        />
        <StatCard
          label="Revenue (30d)"
          value={`$${((kpis?.totalRevenueLast30Days || 0) / 1000).toFixed(0)}K`}
          change={{ value: '+8.3%', positive: true }}
          icon={<span className="text-xl">💰</span>}
          iconBg="yellow"
        />
        <StatCard
          label="Fuel Efficiency"
          value={`${(kpis?.averageFuelEfficiencyMPG || 0).toFixed(1)} MPG`}
          change={{ value: '-3%', positive: false }}
          icon={<span className="text-xl">⛽</span>}
          iconBg="purple"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fleet Status */}
        <Panel title="Fleet Status" actions={<span className="badge badge-success pulse">Live</span>}>
          <div className="space-y-1">
            <div className="metric-row">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-green)]"></span>
                <span className="metric-row-label">Operating</span>
              </div>
              <span className="metric-row-value">{fleetStatus?.activeBuses || 0}</span>
            </div>
            <div className="metric-row">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-yellow)]"></span>
                <span className="metric-row-label">Delayed</span>
              </div>
              <span className="metric-row-value">{fleetStatus?.delaysToday || 0}</span>
            </div>
            <div className="metric-row">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-blue)]"></span>
                <span className="metric-row-label">In Maintenance</span>
              </div>
              <span className="metric-row-value">{fleetStatus?.inMaintenance || 0}</span>
            </div>
            <div className="metric-row">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-red)]"></span>
                <span className="metric-row-label">Out of Service</span>
              </div>
              <span className="metric-row-value">{fleetStatus?.outOfService || 0}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[var(--border-subtle)]">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{fleetStatus?.operationsToday || 0}</p>
              <p className="text-xs text-[var(--text-muted)]">Trips Today</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{(fleetStatus?.passengersToday || 0).toLocaleString()}</p>
              <p className="text-xs text-[var(--text-muted)]">Passengers</p>
            </div>
          </div>
        </Panel>

        {/* Alerts */}
        <Panel
          title="Maintenance Alerts"
          className="lg:col-span-2"
          actions={
            maintenanceAlerts?.urgentAlerts?.length > 0 && (
              <span className="badge badge-danger">{maintenanceAlerts.urgentAlerts.length} urgent</span>
            )
          }
        >
          <div className="space-y-3">
            {maintenanceAlerts?.urgentAlerts?.slice(0, 4).map((alert: any, idx: number) => (
              <div key={idx} className={`alert ${alert.daysUntilDue <= 3 ? 'alert-danger' : 'alert-warning'}`}>
                <span className="text-lg">{alert.daysUntilDue <= 3 ? '🔴' : '🟡'}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Bus {alert.busNumber} - {alert.recommendation}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Due in {alert.daysUntilDue} days • {alert.currentMileage?.toLocaleString()} miles
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[var(--accent-red)]">
                    ${alert.costIfBreakdown?.toLocaleString()}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">breakdown cost</p>
                </div>
              </div>
            ))}
            {(!maintenanceAlerts?.urgentAlerts || maintenanceAlerts.urgentAlerts.length === 0) && (
              <div className="text-center py-8 text-[var(--text-muted)]">
                <span className="text-3xl">✅</span>
                <p className="text-sm mt-2">No urgent maintenance needed</p>
              </div>
            )}
          </div>
        </Panel>
      </div>

      {/* Cost Optimization Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {roiSummary && (
          <>
            <Panel title="Fuel Waste">
              <div className="space-y-3">
                <p className="text-xs text-[var(--text-secondary)]">{roiSummary.problem1_FuelWaste?.problem || 'Inefficient fuel usage detected'}</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-bold text-[var(--accent-green)]">
                    ${roiSummary.problem1_FuelWaste?.potentialAnnualSavings?.toLocaleString()}
                  </p>
                  <span className="text-xs text-[var(--text-muted)] pb-1">/year</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill green" style={{ width: '75%' }}></div>
                </div>
              </div>
            </Panel>

            <Panel title="Empty Buses">
              <div className="space-y-3">
                <p className="text-xs text-[var(--text-secondary)]">{roiSummary.problem2_EmptyBuses?.problem || 'Low utilization routes identified'}</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-bold text-[var(--accent-green)]">
                    ${roiSummary.problem2_EmptyBuses?.potentialAnnualSavings?.toLocaleString()}
                  </p>
                  <span className="text-xs text-[var(--text-muted)] pb-1">/year</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill yellow" style={{ width: '60%' }}></div>
                </div>
              </div>
            </Panel>

            <Panel title="Driver Training">
              <div className="space-y-3">
                <p className="text-xs text-[var(--text-secondary)]">Improve driving habits for efficiency</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-bold text-[var(--accent-green)]">
                    ${roiSummary.problem3_DriverHabits?.potentialAnnualSavings?.toLocaleString()}
                  </p>
                  <span className="text-xs text-[var(--text-muted)] pb-1">/year</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill blue" style={{ width: '85%' }}></div>
                </div>
              </div>
            </Panel>

            <Panel title="Total Savings Potential">
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-3xl font-bold text-[var(--accent-green)]">
                    ${roiSummary.totalPotentialAnnualSavings?.toLocaleString()}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">Annual Savings</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-subtle)]">
                  <div className="text-center">
                    <p className="text-lg font-bold text-[var(--text-primary)]">{roiSummary.roiPercentage?.toFixed(0)}%</p>
                    <p className="text-xs text-[var(--text-muted)]">ROI</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-[var(--text-primary)]">{roiSummary.paybackMonths}mo</p>
                    <p className="text-xs text-[var(--text-muted)]">Payback</p>
                  </div>
                </div>
              </div>
            </Panel>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <Panel title="Quick Actions">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="action-item">
            <div className="action-item-icon blue">📍</div>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Fleet Map</p>
              <p className="text-xs text-[var(--text-muted)]">Real-time tracking</p>
            </div>
          </div>
          <div className="action-item">
            <div className="action-item-icon green">🔧</div>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Maintenance</p>
              <p className="text-xs text-[var(--text-muted)]">Schedule service</p>
            </div>
          </div>
          <div className="action-item">
            <div className="action-item-icon yellow">📊</div>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Reports</p>
              <p className="text-xs text-[var(--text-muted)]">Generate analytics</p>
            </div>
          </div>
          <div className="action-item">
            <div className="action-item-icon purple">⛽</div>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Fuel Analysis</p>
              <p className="text-xs text-[var(--text-muted)]">Cost breakdown</p>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
