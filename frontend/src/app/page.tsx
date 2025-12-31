'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { KPICard } from '@/components/dashboard/KPICard';
import { AlertCard } from '@/components/dashboard/AlertCard';
import { SavingsCard } from '@/components/dashboard/SavingsCard';
import { Card } from '@/components/ui/Card';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🌅 Good Morning, Manager</h1>
              <p className="text-sm text-gray-600">{currentDate}</p>
            </div>
            <div className="flex gap-3">
              <Link href="/fleet" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Fleet Map
              </Link>
              <Link href="/insights" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                Insights
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPIs */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Fleet Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Total Buses"
              value={kpis?.totalBuses || 0}
              subtitle={`${kpis?.activeBuses || 0} active`}
              icon="🚌"
            />
            <KPICard
              title="Passengers (30d)"
              value={(kpis?.totalPassengersLast30Days || 0).toLocaleString()}
              icon="👥"
            />
            <KPICard
              title="Revenue (30d)"
              value={`$${(kpis?.totalRevenueLast30Days || 0).toLocaleString()}`}
              trend="up"
              change={5}
              icon="💰"
            />
            <KPICard
              title="Fuel Efficiency"
              value={`${(kpis?.averageFuelEfficiencyMPG || 0).toFixed(1)} MPG`}
              subtitle="Fleet average"
              icon="⛽"
            />
          </div>
        </section>

        {/* Urgent Alerts */}
        {maintenanceAlerts && maintenanceAlerts.urgentAlerts?.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">🚨 Urgent (Needs Attention TODAY)</h2>
            <div className="space-y-3">
              {maintenanceAlerts.urgentAlerts.slice(0, 3).map((alert: any, idx: number) => (
                <AlertCard
                  key={idx}
                  severity={alert.daysUntilDue <= 3 ? 'critical' : 'warning'}
                  title={`Bus ${alert.busNumber}: ${alert.recommendation}`}
                  description={`${alert.daysUntilDue} days until due • Current mileage: ${alert.currentMileage.toLocaleString()} miles`}
                  cost={alert.costIfBreakdown}
                  action="Schedule Now"
                  onAction={() => alert(`Scheduling maintenance for Bus ${alert.busNumber}`)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Fleet Status */}
        {fleetStatus && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">🚦 Fleet Status</h2>
            <Card>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{fleetStatus.activeBuses}</div>
                  <div className="text-sm text-gray-600">🟢 Operating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{fleetStatus.delaysToday}</div>
                  <div className="text-sm text-gray-600">🟡 Delayed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{fleetStatus.inMaintenance}</div>
                  <div className="text-sm text-gray-600">🔧 Maintenance</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{fleetStatus.outOfService}</div>
                  <div className="text-sm text-gray-600">🔴 Out of Service</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Operations Today:</span>
                  <span className="font-medium">{fleetStatus.operationsToday}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Passengers Today:</span>
                  <span className="font-medium">{fleetStatus.passengersToday.toLocaleString()}</span>
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* Savings Opportunities */}
        {roiSummary && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">💡 AI Recommendations - Save Money</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SavingsCard
                problem={roiSummary.problem1_FuelWaste.problem}
                currentCost={roiSummary.problem1_FuelWaste.currentAnnualCost}
                potentialSavings={roiSummary.problem1_FuelWaste.potentialAnnualSavings}
                actionRequired={roiSummary.problem1_FuelWaste.actionRequired}
                priority={roiSummary.problem1_FuelWaste.priority}
              />
              <SavingsCard
                problem={roiSummary.problem2_EmptyBuses.problem}
                currentCost={roiSummary.problem2_EmptyBuses.currentAnnualCost}
                potentialSavings={roiSummary.problem2_EmptyBuses.potentialAnnualSavings}
                actionRequired={roiSummary.problem2_EmptyBuses.actionRequired}
                priority={roiSummary.problem2_EmptyBuses.priority}
              />
              <SavingsCard
                problem={roiSummary.problem3_DriverHabits.problem}
                currentCost={roiSummary.problem3_DriverHabits.currentAnnualCost}
                potentialSavings={roiSummary.problem3_DriverHabits.potentialAnnualSavings}
                actionRequired={roiSummary.problem3_DriverHabits.actionRequired}
                priority={roiSummary.problem3_DriverHabits.priority}
              />
            </div>
            <Card className="mt-4 bg-green-50 border-2 border-green-200">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Potential Annual Savings</p>
                <p className="text-4xl font-bold text-green-600 mt-2">
                  ${roiSummary.totalPotentialAnnualSavings.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  ROI: {roiSummary.roiPercentage.toFixed(0)}% • Payback: {roiSummary.paybackMonths} months
                </p>
              </div>
            </Card>
          </section>
        )}

        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">⚡ Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/fleet">
              <Card hover className="text-center cursor-pointer">
                <div className="text-3xl mb-2">🗺️</div>
                <div className="font-medium">Fleet Map</div>
              </Card>
            </Link>
            <Link href="/insights/fuel">
              <Card hover className="text-center cursor-pointer">
                <div className="text-3xl mb-2">⛽</div>
                <div className="font-medium">Fuel Analysis</div>
              </Card>
            </Link>
            <Link href="/insights/drivers">
              <Card hover className="text-center cursor-pointer">
                <div className="text-3xl mb-2">👨‍✈️</div>
                <div className="font-medium">Driver Performance</div>
              </Card>
            </Link>
            <Link href="/monitoring">
              <Card hover className="text-center cursor-pointer">
                <div className="text-3xl mb-2">📈</div>
                <div className="font-medium">Live Monitoring</div>
              </Card>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
