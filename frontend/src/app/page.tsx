'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['kpis'],
    queryFn: async () => {
      const response = await api.dashboard.kpis();
      return response.data;
    },
  });

  const { data: fleetStatus } = useQuery({
    queryKey: ['fleet-status'],
    queryFn: async () => {
      const response = await api.dashboard.fleetStatus();
      return response.data;
    },
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
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'}}>
        <div className="text-center">
          <div className="spinner mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading Fleet Command Center...</p>
        </div>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'}}>
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 glass border-r border-white/10 z-50 hidden lg:block">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-white text-xl">🚌</span>
            </div>
            <div>
              <h1 className="font-bold text-white">FleetCommand</h1>
              <p className="text-xs text-slate-400">Management System</p>
            </div>
          </div>
          
          <nav className="space-y-2">
            <Link href="/" className="nav-link active">
              <span>📊</span>
              <span>Dashboard</span>
            </Link>
            <Link href="/fleet" className="nav-link">
              <span>🗺️</span>
              <span>Fleet Map</span>
            </Link>
            <Link href="/insights" className="nav-link">
              <span>💡</span>
              <span>Insights</span>
            </Link>
            <Link href="/analytics" className="nav-link">
              <span>📈</span>
              <span>Analytics</span>
            </Link>
            <Link href="/maintenance" className="nav-link">
              <span>🔧</span>
              <span>Maintenance</span>
            </Link>
            <Link href="/drivers" className="nav-link">
              <span>👨‍✈️</span>
              <span>Drivers</span>
            </Link>
            <Link href="/reports" className="nav-link">
              <span>📋</span>
              <span>Reports</span>
            </Link>
          </nav>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="glass-subtle rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-2">System Status</p>
            <div className="flex items-center gap-2">
              <div className="status-dot active"></div>
              <span className="text-sm text-slate-300">All systems operational</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="glass border-b border-white/10 sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">{greeting}, Manager</h1>
                <p className="text-sm text-slate-400">{currentDate}</p>
              </div>
              <div className="flex items-center gap-4">
                <button className="btn-secondary">
                  <span className="mr-2">🔔</span>
                  Alerts
                  {maintenanceAlerts?.urgentAlerts?.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 rounded-full">
                      {maintenanceAlerts.urgentAlerts.length}
                    </span>
                  )}
                </button>
                <button className="btn-primary">
                  <span className="mr-2">➕</span>
                  New Report
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* KPI Cards */}
          <section className="mb-8">
            <div className="section-header">
              <span className="icon">📊</span>
              <h2>Fleet Overview</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 grid-fade-in">
              {/* Total Buses */}
              <div className="kpi-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Total Buses</p>
                    <p className="metric-value">{kpis?.totalBuses || 0}</p>
                    <p className="text-sm text-slate-400 mt-1">
                      <span className="text-emerald-400">{kpis?.activeBuses || 0}</span> active now
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                    <span className="text-2xl">🚌</span>
                  </div>
                </div>
              </div>

              {/* Passengers */}
              <div className="kpi-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Passengers (30d)</p>
                    <p className="metric-value">{((kpis?.totalPassengersLast30Days || 0) / 1000).toFixed(0)}K</p>
                    <p className="text-sm text-emerald-400 mt-1">
                      +12.5% vs last month
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl gradient-purple flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                </div>
              </div>

              {/* Revenue */}
              <div className="kpi-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Revenue (30d)</p>
                    <p className="metric-value">${((kpis?.totalRevenueLast30Days || 0) / 1000).toFixed(0)}K</p>
                    <p className="text-sm text-emerald-400 mt-1">
                      +8.3% vs target
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl gradient-success flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
              </div>

              {/* Fuel Efficiency */}
              <div className="kpi-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Fuel Efficiency</p>
                    <p className="metric-value">{(kpis?.averageFuelEfficiencyMPG || 0).toFixed(1)}</p>
                    <p className="text-sm text-slate-400 mt-1">
                      MPG fleet average
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl gradient-warning flex items-center justify-center">
                    <span className="text-2xl">⛽</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Fleet Status */}
          {fleetStatus && (
            <section className="mb-8">
              <div className="section-header">
                <span className="icon">🚦</span>
                <h2>Real-Time Fleet Status</h2>
              </div>
              <div className="glass rounded-2xl p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-3">
                      <span className="text-3xl font-bold text-emerald-400">{fleetStatus.activeBuses}</span>
                    </div>
                    <p className="text-sm text-slate-400">Operating</p>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <div className="status-dot active"></div>
                      <span className="text-xs text-emerald-400">Live</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 flex items-center justify-center mb-3">
                      <span className="text-3xl font-bold text-amber-400">{fleetStatus.delaysToday}</span>
                    </div>
                    <p className="text-sm text-slate-400">Delayed</p>
                    <p className="text-xs text-amber-400 mt-1">Avg 8 min</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-500/20 flex items-center justify-center mb-3">
                      <span className="text-3xl font-bold text-orange-400">{fleetStatus.inMaintenance}</span>
                    </div>
                    <p className="text-sm text-slate-400">In Maintenance</p>
                    <p className="text-xs text-orange-400 mt-1">Scheduled</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/20 flex items-center justify-center mb-3">
                      <span className="text-3xl font-bold text-red-400">{fleetStatus.outOfService}</span>
                    </div>
                    <p className="text-sm text-slate-400">Out of Service</p>
                    <p className="text-xs text-red-400 mt-1">Needs attention</p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Operations Today</span>
                    <span className="font-semibold text-white">{fleetStatus.operationsToday}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Passengers Today</span>
                    <span className="font-semibold text-white">{fleetStatus.passengersToday?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Urgent Alerts */}
          {maintenanceAlerts && maintenanceAlerts.urgentAlerts?.length > 0 && (
            <section className="mb-8">
              <div className="section-header">
                <span className="icon">🚨</span>
                <h2>Urgent Alerts</h2>
                <span className="ml-auto px-3 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-full">
                  {maintenanceAlerts.urgentAlerts.length} requiring action
                </span>
              </div>
              <div className="space-y-3">
                {maintenanceAlerts.urgentAlerts.slice(0, 3).map((alert: any, idx: number) => (
                  <div key={idx} className={`alert-card ${alert.daysUntilDue <= 3 ? 'critical' : 'warning'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-white">
                          Bus {alert.busNumber}: {alert.recommendation}
                        </h4>
                        <p className="text-sm text-slate-400 mt-1">
                          {alert.daysUntilDue} days until due • Current mileage: {alert.currentMileage?.toLocaleString()} miles
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Potential cost if breakdown</p>
                        <p className="font-bold text-red-400">${alert.costIfBreakdown?.toLocaleString()}</p>
                      </div>
                    </div>
                    <button className="btn-secondary mt-3 text-sm">
                      Schedule Maintenance →
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* AI Recommendations & Savings */}
          {roiSummary && (
            <section className="mb-8">
              <div className="section-header">
                <span className="icon">💡</span>
                <h2>AI Recommendations - Savings Opportunities</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Fuel Waste */}
                <div className="savings-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                      <span className="text-xl">⛽</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">Fuel Waste</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                        {roiSummary.problem1_FuelWaste.priority}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{roiSummary.problem1_FuelWaste.problem}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Potential savings</span>
                    <span className="font-bold text-emerald-400">
                      ${roiSummary.problem1_FuelWaste.potentialAnnualSavings?.toLocaleString()}/yr
                    </span>
                  </div>
                </div>

                {/* Empty Buses */}
                <div className="savings-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                      <span className="text-xl">🚌</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">Empty Buses</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                        {roiSummary.problem2_EmptyBuses.priority}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{roiSummary.problem2_EmptyBuses.problem}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Potential savings</span>
                    <span className="font-bold text-emerald-400">
                      ${roiSummary.problem2_EmptyBuses.potentialAnnualSavings?.toLocaleString()}/yr
                    </span>
                  </div>
                </div>

                {/* Maintenance */}
                <div className="savings-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <span className="text-xl">🔧</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">Maintenance</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                        {roiSummary.problem4_MaintenanceSurprises?.priority || 'High'}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">Prevent unplanned breakdowns</p>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Potential savings</span>
                    <span className="font-bold text-emerald-400">
                      ${roiSummary.problem4_MaintenanceSurprises?.potentialAnnualSavings?.toLocaleString() || '0'}/yr
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Savings Highlight */}
              <div className="savings-highlight">
                <p className="text-slate-400 text-sm mb-2">Total Potential Annual Savings</p>
                <p className="amount">${roiSummary.totalPotentialAnnualSavings?.toLocaleString()}</p>
                <div className="flex items-center justify-center gap-6 mt-4">
                  <div>
                    <span className="text-slate-400 text-sm">ROI</span>
                    <p className="font-bold text-white text-xl">{roiSummary.roiPercentage?.toFixed(0)}%</p>
                  </div>
                  <div className="w-px h-10 bg-white/20"></div>
                  <div>
                    <span className="text-slate-400 text-sm">Payback Period</span>
                    <p className="font-bold text-white text-xl">{roiSummary.paybackMonths} months</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Quick Actions */}
          <section>
            <div className="section-header">
              <span className="icon">⚡</span>
              <h2>Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/fleet" className="glass rounded-xl p-6 text-center hover:border-blue-500/30 transition-all hover:-translate-y-1 cursor-pointer">
                <div className="w-14 h-14 mx-auto rounded-xl gradient-primary flex items-center justify-center mb-3">
                  <span className="text-2xl">🗺️</span>
                </div>
                <p className="font-semibold text-white">Fleet Map</p>
                <p className="text-xs text-slate-400 mt-1">Real-time tracking</p>
              </Link>
              <Link href="/insights/fuel" className="glass rounded-xl p-6 text-center hover:border-amber-500/30 transition-all hover:-translate-y-1 cursor-pointer">
                <div className="w-14 h-14 mx-auto rounded-xl gradient-warning flex items-center justify-center mb-3">
                  <span className="text-2xl">⛽</span>
                </div>
                <p className="font-semibold text-white">Fuel Analysis</p>
                <p className="text-xs text-slate-400 mt-1">Cost optimization</p>
              </Link>
              <Link href="/insights/drivers" className="glass rounded-xl p-6 text-center hover:border-purple-500/30 transition-all hover:-translate-y-1 cursor-pointer">
                <div className="w-14 h-14 mx-auto rounded-xl gradient-purple flex items-center justify-center mb-3">
                  <span className="text-2xl">👨‍✈️</span>
                </div>
                <p className="font-semibold text-white">Drivers</p>
                <p className="text-xs text-slate-400 mt-1">Performance metrics</p>
              </Link>
              <Link href="/monitoring" className="glass rounded-xl p-6 text-center hover:border-emerald-500/30 transition-all hover:-translate-y-1 cursor-pointer">
                <div className="w-14 h-14 mx-auto rounded-xl gradient-success flex items-center justify-center mb-3">
                  <span className="text-2xl">📈</span>
                </div>
                <p className="font-semibold text-white">Live Monitor</p>
                <p className="text-xs text-slate-400 mt-1">Real-time data</p>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
