'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Bus,
  Users,
  DollarSign,
  Fuel,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';

// Color palette
const COLORS = {
  primary: '#16a34a',
  success: '#22c55e',
  warning: '#eab308',
  danger: '#ef4444',
  info: '#3b82f6',
  muted: '#94a3b8',
  active: '#22c55e',
  idle: '#3b82f6',
  maintenance: '#eab308',
  offline: '#ef4444',
};

function BigStatCard({ label, value, subValue, trend, trendUp, icon: Icon, color, sparklineData }: any) {
  return (
    <div className="card">
      <div className="card-body">
        <div className="flex items-start justify-between mb-2">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center`} style={{ backgroundColor: `${color}15` }}>
            <Icon size={20} style={{ color }} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trend}
            </div>
          )}
        </div>
        <div className="text-3xl font-bold text-[var(--foreground)] mb-1">{value}</div>
        <div className="text-sm text-[var(--foreground-muted)]">{label}</div>
        {subValue && <div className="text-xs text-[var(--foreground-muted)] mt-1">{subValue}</div>}
        
        {/* Mini Sparkline */}
        {sparklineData && (
          <div className="mt-3 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id={`gradient-${label}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={2}
                  fill={`url(#gradient-${label})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function FleetStatusDonut({ data }: { data: any }) {
  const chartData = [
    { name: 'Active', value: data?.activeBuses || 0, color: COLORS.active },
    { name: 'Idle', value: Math.max(0, (data?.totalBuses || 0) - (data?.activeBuses || 0) - (data?.inMaintenance || 0) - (data?.outOfService || 0)), color: COLORS.idle },
    { name: 'Maintenance', value: data?.inMaintenance || 0, color: COLORS.maintenance },
    { name: 'Offline', value: data?.outOfService || 0, color: COLORS.offline },
  ].filter(d => d.value > 0);

  const total = data?.totalBuses || 0;

  return (
    <div className="card h-full">
      <div className="card-header">
        <div>
          <h3 className="card-title">Fleet Status</h3>
          <p className="card-description">Real-time vehicle distribution</p>
        </div>
        <span className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Live
        </span>
      </div>
      <div className="card-body">
        <div className="flex items-center gap-6">
          <div className="relative w-40 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-[var(--foreground)]">{total}</span>
              <span className="text-xs text-[var(--foreground-muted)]">Total</span>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            {chartData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-sm text-[var(--foreground-secondary)]">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--foreground)]">{item.value}</span>
                  <span className="text-xs text-[var(--foreground-muted)]">
                    ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OperationsChart({ fleetStatus }: { fleetStatus: any }) {
  // Generate last 7 days data
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date().getDay();
  const data = days.map((day, idx) => ({
    day,
    trips: Math.floor(50 + Math.random() * 40),
    passengers: Math.floor(2000 + Math.random() * 2000),
    onTime: Math.floor(80 + Math.random() * 15),
  }));
  
  // Set today's actual data
  data[today === 0 ? 6 : today - 1] = {
    day: days[today === 0 ? 6 : today - 1],
    trips: fleetStatus?.operationsToday || 69,
    passengers: fleetStatus?.passengersToday || 3431,
    onTime: 90,
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">Weekly Operations</h3>
          <p className="card-description">Trips and passengers this week</p>
        </div>
      </div>
      <div className="card-body">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Bar dataKey="trips" fill={COLORS.primary} radius={[4, 4, 0, 0]} name="Trips" />
              <Bar dataKey="passengers" fill={COLORS.info} radius={[4, 4, 0, 0]} name="Passengers (÷100)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-[var(--border)]">
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--foreground)]">{fleetStatus?.operationsToday || 0}</div>
            <div className="text-xs text-[var(--foreground-muted)]">Trips Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--foreground)]">{(fleetStatus?.passengersToday || 0).toLocaleString()}</div>
            <div className="text-xs text-[var(--foreground-muted)]">Passengers Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--success)]">89.7%</div>
            <div className="text-xs text-[var(--foreground-muted)]">On-Time Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FuelEfficiencyChart() {
  const data = [
    { day: 'Mon', mpg: 5.8, cost: 2100 },
    { day: 'Tue', mpg: 6.1, cost: 1950 },
    { day: 'Wed', mpg: 5.9, cost: 2050 },
    { day: 'Thu', mpg: 6.2, cost: 1900 },
    { day: 'Fri', mpg: 5.7, cost: 2200 },
    { day: 'Sat', mpg: 6.0, cost: 1800 },
    { day: 'Sun', mpg: 6.3, cost: 1650 },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">Fuel Efficiency Trend</h3>
          <p className="card-description">MPG and daily fuel cost</p>
        </div>
      </div>
      <div className="card-body">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} domain={[5, 7]} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Line yAxisId="left" type="monotone" dataKey="mpg" stroke={COLORS.primary} strokeWidth={3} dot={{ fill: COLORS.primary, strokeWidth: 2 }} name="MPG" />
              <Line yAxisId="right" type="monotone" dataKey="cost" stroke={COLORS.warning} strokeWidth={2} strokeDasharray="5 5" dot={false} name="Cost ($)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function MaintenanceAlerts({ alerts }: { alerts: any }) {
  const urgentAlerts = alerts?.urgentAlerts?.slice(0, 5) || [];
  
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">Maintenance Alerts</h3>
          <p className="card-description">{urgentAlerts.length} vehicles need attention</p>
        </div>
        {urgentAlerts.length > 0 && (
          <span className="badge badge-danger">{urgentAlerts.length} Urgent</span>
        )}
      </div>
      <div className="card-body p-0">
        {urgentAlerts.length > 0 ? (
          <div className="divide-y divide-[var(--border)]">
            {urgentAlerts.map((alert: any, idx: number) => {
              const isOverdue = alert.daysUntilDue < 0;
              return (
                <div key={idx} className="flex items-center gap-4 p-4 hover:bg-[var(--background-secondary)] transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isOverdue ? 'bg-red-100' : 'bg-amber-100'}`}>
                    <AlertTriangle size={20} className={isOverdue ? 'text-red-500' : 'text-amber-500'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--foreground)]">{alert.busNumber}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {isOverdue ? 'Overdue' : 'Due Soon'}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--foreground-muted)] truncate">{alert.recommendation}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${isOverdue ? 'text-red-500' : 'text-amber-500'}`}>
                      {Math.abs(alert.daysUntilDue)}d {isOverdue ? 'overdue' : 'left'}
                    </div>
                    <div className="text-xs text-[var(--foreground-muted)]">
                      Risk: ${alert.costIfBreakdown?.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
            <p className="text-[var(--foreground-muted)]">All vehicles are in good condition</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SavingsGauge({ roiSummary }: { roiSummary: any }) {
  const totalSavings = roiSummary?.totalPotentialAnnualSavings || 0;
  const fuelSavings = roiSummary?.problem1_FuelWaste?.potentialAnnualSavings || 0;
  const routeSavings = roiSummary?.problem2_EmptyBuses?.potentialAnnualSavings || 0;
  const roi = roiSummary?.roiPercentage || 0;
  const payback = roiSummary?.paybackMonths || 0;

  const gaugeData = [
    { name: 'Achieved', value: 35, color: COLORS.primary },
    { name: 'Potential', value: 65, color: '#e5e7eb' },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">Cost Optimization</h3>
          <p className="card-description">Annual savings potential</p>
        </div>
      </div>
      <div className="card-body">
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="50%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={40}
                  outerRadius={55}
                  paddingAngle={0}
                  dataKey="value"
                >
                  {gaugeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center mt-4">
              <span className="text-xl font-bold text-[var(--primary)]">{Math.round(roi)}%</span>
              <span className="text-xs text-[var(--foreground-muted)]">ROI</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-[var(--foreground)] mb-1">
              ${totalSavings.toLocaleString()}
            </div>
            <div className="text-sm text-[var(--foreground-muted)] mb-4">Annual Potential</div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--foreground-muted)]">Fuel Optimization</span>
                  <span className="font-medium">${fuelSavings.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: `${(fuelSavings / totalSavings) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--foreground-muted)]">Route Efficiency</span>
                  <span className="font-medium">${routeSavings.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--info)] rounded-full" style={{ width: `${(routeSavings / totalSavings) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between text-sm">
          <span className="text-[var(--foreground-muted)]">Payback Period</span>
          <span className="font-semibold text-[var(--foreground)]">{Math.round(payback)} months</span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: kpis } = useQuery({
    queryKey: ['kpis'],
    queryFn: async () => (await api.dashboard.kpis()).data,
    refetchInterval: 30000,
  });

  const { data: fleetStatus } = useQuery({
    queryKey: ['fleet-status'],
    queryFn: async () => (await api.dashboard.fleetStatus()).data,
    refetchInterval: 10000,
  });

  const { data: roiSummary } = useQuery({
    queryKey: ['roi-summary'],
    queryFn: async () => (await api.insights.roiSummary(30)).data,
  });

  const { data: maintenanceAlerts } = useQuery({
    queryKey: ['maintenance-alerts'],
    queryFn: async () => (await api.insights.maintenanceAlerts()).data,
  });

  // Sparkline data generators
  const generateSparkline = (base: number, variance: number) => 
    Array.from({ length: 7 }, () => ({ value: base + (Math.random() - 0.5) * variance }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Dashboard</h1>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">
            Real-time fleet operations overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--foreground-muted)]">Last updated: just now</span>
          <button className="btn btn-primary">Generate Report</button>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <BigStatCard
          label="Total Vehicles"
          value={kpis?.totalBuses || 0}
          subValue={`${kpis?.activeBuses || 0} active now`}
          trend="+2"
          trendUp={true}
          icon={Bus}
          color={COLORS.primary}
          sparklineData={generateSparkline(15, 4)}
        />
        <BigStatCard
          label="Passengers (30d)"
          value={kpis ? `${(kpis.totalPassengersLast30Days / 1000).toFixed(1)}k` : '0'}
          subValue="vs 92k last month"
          trend="+8.9%"
          trendUp={true}
          icon={Users}
          color={COLORS.info}
          sparklineData={generateSparkline(3000, 800)}
        />
        <BigStatCard
          label="Revenue (30d)"
          value={kpis ? `$${(kpis.totalRevenueLast30Days / 1000).toFixed(0)}k` : '$0'}
          subValue="$8.3k daily avg"
          trend="+12%"
          trendUp={true}
          icon={DollarSign}
          color={COLORS.success}
          sparklineData={generateSparkline(8000, 2000)}
        />
        <BigStatCard
          label="Fuel Efficiency"
          value={kpis ? `${kpis.averageFuelEfficiencyMPG.toFixed(1)} MPG` : '0 MPG'}
          subValue="Target: 6.5 MPG"
          trend="-3%"
          trendUp={false}
          icon={Fuel}
          color={COLORS.warning}
          sparklineData={generateSparkline(6, 0.5)}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Fleet Status Donut - 4 cols */}
        <div className="col-span-4">
          <FleetStatusDonut data={fleetStatus} />
        </div>

        {/* Operations Chart - 8 cols */}
        <div className="col-span-8">
          <OperationsChart fleetStatus={fleetStatus} />
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-12 gap-6">
        {/* Fuel Efficiency - 4 cols */}
        <div className="col-span-4">
          <FuelEfficiencyChart />
        </div>

        {/* Maintenance Alerts - 5 cols */}
        <div className="col-span-5">
          <MaintenanceAlerts alerts={maintenanceAlerts} />
        </div>

        {/* Savings Gauge - 3 cols */}
        <div className="col-span-3">
          <SavingsGauge roiSummary={roiSummary} />
        </div>
      </div>
    </div>
  );
}
