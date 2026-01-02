'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import {
    Bus,
    Wrench,
    AlertCircle,
    CheckCircle2,
    Clock,
    TrendingUp,
    TrendingDown,
    Fuel,
    DollarSign,
    Users,
    Shield,
    Leaf,
    Calendar,
    Activity,
    Timer,
    Star,
    FileCheck,
    MessageCircle,
    ChevronRight,
    Sun,
    Moon,
    Search,
    Bell,
    Settings,
    LayoutGrid,
    Package,
    CreditCard,
    ShoppingCart,
    BarChart3,
    PieChartIcon,
    Menu,
    ChevronDown
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface FleetKpi {
    totalBuses: number;
    activeBuses: number;
    inactiveBuses: number;
    inMaintenance: number;
    outOfService: number;
    costPerMile: number;
    avgFuelEfficiencyMpg: number;
    maintenanceCostMtd: number;
    fuelCostMtd: number;
    ecoSavingsMtd: number;
    utilizationRate: number;
    fleetAvailability: number;
    downtimePct: number;
    harshEventsToday: number;
    speedingEventsToday: number;
    safetyIncidentsMtd: number;
    daysWithoutIncident: number;
    safetyScore: number;
    ecoScore: number;
    onTimePerformancePct: number;
    routesCompletedToday: number;
    passengersToday: number;
    avgDelayMinutes: number;
    customerSatisfactionRating: number;
    pmComplianceRate: number;
    maintenanceDue7Days: number;
    maintenanceOverdue: number;
    inspectionPassRate: number;
    mtbfDays: number;
    serviceRemindersOverdue: number;
    serviceRemindersDueSoon: number;
    driverScores: Array<{
        driverName: string;
        overallScore: number;
        fuelEfficiencyMpg: number;
        harshEventsPer100km: number;
        tripsCompleted: number;
    }>;
    excellentDrivers: number;
    goodDrivers: number;
    needsTrainingDrivers: number;
    weeklyTrends: Array<{
        date: string;
        dayName: string;
        harshBrakeEvents: number;
        rapidAccelEvents: number;
        speedingEvents: number;
        costPerMile: number;
        fuelConsumed: number;
        passengers: number;
        revenue: number;
    }>;
    lastUpdated: string;
}

// Theme-aware color palette
const getColors = (isDark: boolean) => ({
    primary: '#8b5cf6',
    primaryLight: '#a78bfa',
    secondary: '#ec4899',
    accent: '#06b6d4',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',

    // Background colors
    bgPrimary: isDark ? '#1e1e2d' : '#ffffff',
    bgSecondary: isDark ? '#151521' : '#f8fafc',
    bgCard: isDark ? '#1e1e2d' : '#ffffff',
    bgHover: isDark ? '#2d2d3a' : '#f1f5f9',
    bgSidebar: isDark ? '#151521' : '#ffffff',

    // Text colors
    textPrimary: isDark ? '#ffffff' : '#1e293b',
    textSecondary: isDark ? '#9ca3af' : '#64748b',
    textMuted: isDark ? '#6b7280' : '#94a3b8',

    // Border
    border: isDark ? '#2d2d3a' : '#e2e8f0',

    // Chart colors
    chartBlue: '#3b82f6',
    chartPurple: '#8b5cf6',
    chartPink: '#ec4899',
    chartCyan: '#06b6d4',
    chartGreen: '#22c55e',
    chartOrange: '#f97316',
});

// Big Stat Card with sparkline
function BigStatCard({
    title,
    value,
    subValue,
    trend,
    trendUp,
    sparklineData,
    icon: Icon,
    iconBgColor,
    iconColor,
    colors
}: {
    title: string;
    value: string | number;
    subValue?: string;
    trend?: string;
    trendUp?: boolean;
    sparklineData?: number[];
    icon?: any;
    iconBgColor?: string;
    iconColor?: string;
    colors: ReturnType<typeof getColors>;
}) {
    const data = sparklineData?.map((v, i) => ({ value: v })) || [];

    return (
        <div
            className="rounded-2xl p-5 transition-all duration-200 hover:shadow-lg"
            style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}
        >
            <div className="flex items-start justify-between mb-3">
                <div>
                    <div className="text-3xl font-bold mb-1" style={{ color: colors.textPrimary }}>
                        {value}
                    </div>
                    <div className="text-sm" style={{ color: colors.textMuted }}>{title}</div>
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${trendUp ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                        {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {trend}
                    </div>
                )}
            </div>

            {sparklineData && (
                <div className="h-16 mt-3">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={colors.primary} stopOpacity={0.4} />
                                    <stop offset="100%" stopColor={colors.primary} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={colors.primary}
                                strokeWidth={2}
                                fill={`url(#gradient-${title})`}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            {subValue && (
                <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: colors.textSecondary }}>
                    {subValue}
                </div>
            )}
        </div>
    );
}

// Stat Cards Row (Orders, Income, etc.)
function StatRow({ kpis, colors }: { kpis: FleetKpi; colors: ReturnType<typeof getColors> }) {
    const stats = [
        { icon: Bus, label: 'Total Buses', value: kpis.totalBuses.toLocaleString(), color: colors.chartPurple },
        { icon: DollarSign, label: 'Fuel Cost', value: `$${(kpis.fuelCostMtd / 1000).toFixed(1)}k`, color: colors.chartBlue },
        { icon: Bell, label: 'Alerts', value: kpis.harshEventsToday, color: colors.secondary },
        { icon: CreditCard, label: 'Savings', value: `$${(kpis.ecoSavingsMtd / 1000).toFixed(1)}k`, color: colors.chartGreen },
    ];

    return (
        <div className="grid grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
                <div
                    key={idx}
                    className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200 hover:shadow-md"
                    style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}
                >
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${stat.color}20` }}
                    >
                        <stat.icon size={22} style={{ color: stat.color }} />
                    </div>
                    <div>
                        <div className="text-xl font-bold" style={{ color: colors.textPrimary }}>{stat.value}</div>
                        <div className="text-sm" style={{ color: colors.textMuted }}>{stat.label}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// User Stats Card (Total Users, Active Users with donut)
function UserStatsCard({
    title,
    value,
    percentage,
    trendText,
    trendUp,
    donutData,
    colors
}: {
    title: string;
    value: string;
    percentage?: number;
    trendText: string;
    trendUp: boolean;
    donutData?: { value: number; color: string }[];
    colors: ReturnType<typeof getColors>;
}) {
    return (
        <div
            className="rounded-2xl p-5 transition-all hover:shadow-lg"
            style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}
        >
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>{value}</div>
                    <div className="text-sm mb-3" style={{ color: colors.textMuted }}>{title}</div>
                    <div className={`text-xs ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
                        {trendUp ? <TrendingUp size={12} className="inline mr-1" /> : <TrendingDown size={12} className="inline mr-1" />}
                        {trendText}
                    </div>
                </div>
                {donutData && (
                    <div className="relative w-20 h-20">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={donutData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={25}
                                    outerRadius={35}
                                    dataKey="value"
                                    startAngle={90}
                                    endAngle={-270}
                                >
                                    {donutData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        {percentage !== undefined && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-bold" style={{ color: colors.textPrimary }}>{percentage}%</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// Sales & Views Chart
function SalesViewsChart({ trends, colors }: { trends: FleetKpi['weeklyTrends']; colors: ReturnType<typeof getColors> }) {
    const data = trends.map((t, idx) => ({
        name: t.dayName,
        passengers: t.passengers,
        revenue: Math.round(t.revenue / 100),
    }));

    return (
        <div
            className="rounded-2xl p-5 transition-all hover:shadow-lg"
            style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold" style={{ color: colors.textPrimary }}>Passengers & Revenue</h3>
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.chartBlue }}></span>
                        <span style={{ color: colors.textMuted }}>Passengers</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.chartCyan }}></span>
                        <span style={{ color: colors.textMuted }}>Revenue</span>
                    </div>
                </div>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barGap={8}>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: colors.textMuted }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: colors.textMuted }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: colors.bgCard,
                                border: `1px solid ${colors.border}`,
                                borderRadius: '12px',
                                color: colors.textPrimary
                            }}
                        />
                        <Bar dataKey="passengers" fill={colors.chartBlue} radius={[6, 6, 0, 0]} />
                        <Bar dataKey="revenue" fill={colors.chartCyan} radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// Monthly/Yearly Stats
function MonthlyYearlyStats({ kpis, colors }: { kpis: FleetKpi; colors: ReturnType<typeof getColors> }) {
    const monthlyData = [
        { name: 'Done', value: 75, color: colors.chartPurple },
        { name: 'Pending', value: 25, color: colors.border },
    ];

    const yearlyData = [
        { name: 'Done', value: 85, color: colors.chartCyan },
        { name: 'Pending', value: 15, color: colors.border },
    ];

    return (
        <div className="grid grid-cols-2 gap-4">
            {/* Monthly */}
            <div
                className="rounded-2xl p-5 transition-all hover:shadow-lg"
                style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}
            >
                <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={monthlyData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={20}
                                    outerRadius={30}
                                    dataKey="value"
                                    startAngle={90}
                                    endAngle={-270}
                                >
                                    {monthlyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div>
                        <div className="text-xs" style={{ color: colors.textMuted }}>Monthly</div>
                        <div className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                            {Math.round(kpis.fuelCostMtd / 1000 * 0.65).toLocaleString()}
                        </div>
                        <div className="text-xs text-green-500">
                            <TrendingUp size={10} className="inline mr-1" />
                            16.5% $5.21 USD
                        </div>
                    </div>
                </div>
            </div>

            {/* Yearly */}
            <div
                className="rounded-2xl p-5 transition-all hover:shadow-lg"
                style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}
            >
                <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={yearlyData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={20}
                                    outerRadius={30}
                                    dataKey="value"
                                    startAngle={90}
                                    endAngle={-270}
                                >
                                    {yearlyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div>
                        <div className="text-xs" style={{ color: colors.textMuted }}>Yearly</div>
                        <div className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                            {Math.round(kpis.fuelCostMtd * 12 / 1000).toLocaleString()},246
                        </div>
                        <div className="text-xs text-green-500">
                            <TrendingUp size={10} className="inline mr-1" />
                            24.9% 267.35 USD
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Driver Performance Table
function DriverPerformanceTable({ drivers, colors }: { drivers: FleetKpi['driverScores']; colors: ReturnType<typeof getColors> }) {
    const topDrivers = drivers.slice(0, 5);
    const avatarColors = ['from-purple-400 to-purple-600', 'from-blue-400 to-blue-600', 'from-pink-400 to-pink-600', 'from-cyan-400 to-cyan-600', 'from-green-400 to-green-600'];

    return (
        <div
            className="rounded-2xl p-5 transition-all hover:shadow-lg"
            style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold" style={{ color: colors.textPrimary }}>Top Drivers</h3>
                <button className="text-xs hover:underline" style={{ color: colors.primary }}>View All</button>
            </div>
            <div className="space-y-3">
                {topDrivers.map((driver, idx) => (
                    <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                        style={{ backgroundColor: colors.bgHover }}
                    >
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColors[idx]} flex items-center justify-center text-white text-sm font-bold`}>
                            {driver.driverName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                            <div className="font-medium" style={{ color: colors.textPrimary }}>{driver.driverName}</div>
                            <div className="text-xs" style={{ color: colors.textMuted }}>{driver.tripsCompleted} trips</div>
                        </div>
                        <div className="text-right">
                            <div
                                className="text-lg font-bold"
                                style={{
                                    color: driver.overallScore >= 80 ? colors.chartGreen :
                                        driver.overallScore >= 60 ? colors.warning : colors.danger
                                }}
                            >
                                {driver.overallScore.toFixed(0)}
                            </div>
                            <div className="text-xs" style={{ color: colors.textMuted }}>{driver.fuelEfficiencyMpg.toFixed(1)} MPG</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Campaign / KPI Cards
function CampaignCards({ kpis, colors }: { kpis: FleetKpi; colors: ReturnType<typeof getColors> }) {
    const campaigns = [
        {
            title: 'Safety Score',
            value: `${Math.round(kpis.safetyScore)}%`,
            progress: kpis.safetyScore,
            color: colors.chartGreen
        },
        {
            title: 'Eco Score',
            value: `${Math.round(kpis.ecoScore)}%`,
            progress: kpis.ecoScore,
            color: colors.chartCyan
        },
        {
            title: 'On-Time %',
            value: `${kpis.onTimePerformancePct.toFixed(1)}%`,
            progress: kpis.onTimePerformancePct,
            color: colors.chartPurple
        },
    ];

    return (
        <div
            className="rounded-2xl p-5 transition-all hover:shadow-lg"
            style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold" style={{ color: colors.textPrimary }}>Key Metrics</h3>
            </div>
            <div className="space-y-4">
                {campaigns.map((campaign, idx) => (
                    <div key={idx}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm" style={{ color: colors.textSecondary }}>{campaign.title}</span>
                            <span className="text-sm font-bold" style={{ color: colors.textPrimary }}>{campaign.value}</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.border }}>
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${campaign.progress}%`,
                                    backgroundColor: campaign.color
                                }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Sidebar Component
function Sidebar({ isDark, colors }: { isDark: boolean; colors: ReturnType<typeof getColors> }) {
    const [activeItem, setActiveItem] = useState('Dashboard');

    const menuItems = [
        { icon: LayoutGrid, label: 'Dashboard', active: true },
        { icon: ShoppingCart, label: 'Fleet', hasSubmenu: true },
        { icon: Package, label: 'Drivers' },
        { icon: BarChart3, label: 'Routes' },
        { icon: Wrench, label: 'Maintenance' },
        { icon: Fuel, label: 'Fuel History' },
        { icon: FileCheck, label: 'Inspections' },
        { icon: CreditCard, label: 'Costs' },
        { icon: Settings, label: 'Settings' },
    ];

    return (
        <div
            className="w-64 h-screen fixed left-0 top-0 flex flex-col"
            style={{ backgroundColor: colors.bgSidebar, borderRight: `1px solid ${colors.border}` }}
        >
            {/* Logo */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Bus size={20} className="text-white" />
                </div>
                <span className="text-xl font-bold" style={{ color: colors.textPrimary }}>FleetKPI</span>
            </div>

            {/* Menu */}
            <nav className="flex-1 px-4 py-2">
                <div className="space-y-1">
                    {menuItems.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveItem(item.label)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${activeItem === item.label
                                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400'
                                    : ''
                                }`}
                            style={{ color: activeItem === item.label ? colors.primary : colors.textSecondary }}
                        >
                            <item.icon size={18} />
                            <span className="flex-1 text-left">{item.label}</span>
                            {item.hasSubmenu && <ChevronDown size={14} />}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Bottom */}
            <div className="p-4 border-t" style={{ borderColor: colors.border }}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500"></div>
                    <div className="flex-1">
                        <div className="text-sm font-medium" style={{ color: colors.textPrimary }}>Admin</div>
                        <div className="text-xs" style={{ color: colors.textMuted }}>Fleet Manager</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Header Component
function Header({ isDark, toggleTheme, colors }: { isDark: boolean; toggleTheme: () => void; colors: ReturnType<typeof getColors> }) {
    return (
        <header
            className="h-16 px-6 flex items-center justify-between fixed top-0 right-0 left-64 z-10"
            style={{ backgroundColor: colors.bgPrimary, borderBottom: `1px solid ${colors.border}` }}
        >
            <div className="flex items-center gap-4">
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Menu size={20} style={{ color: colors.textSecondary }} />
                </button>
                <div
                    className="flex items-center gap-2 px-4 py-2 rounded-xl"
                    style={{ backgroundColor: colors.bgSecondary }}
                >
                    <Search size={16} style={{ color: colors.textMuted }} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent outline-none text-sm w-64"
                        style={{ color: colors.textPrimary }}
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-xl transition-colors"
                    style={{ backgroundColor: colors.bgSecondary }}
                >
                    {isDark ? <Sun size={18} style={{ color: colors.warning }} /> : <Moon size={18} style={{ color: colors.primary }} />}
                </button>

                <button
                    className="p-2 rounded-xl relative"
                    style={{ backgroundColor: colors.bgSecondary }}
                >
                    <LayoutGrid size={18} style={{ color: colors.textSecondary }} />
                </button>

                <button
                    className="p-2 rounded-xl relative"
                    style={{ backgroundColor: colors.bgSecondary }}
                >
                    <Bell size={18} style={{ color: colors.textSecondary }} />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">3</span>
                </button>

                <div className="flex items-center gap-3 pl-4 border-l" style={{ borderColor: colors.border }}>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-500"></div>
                </div>
            </div>
        </header>
    );
}

export default function FleetKpiDashboard() {
    const [isDark, setIsDark] = useState(true);
    const colors = getColors(isDark);

    // Load theme preference
    useEffect(() => {
        const saved = localStorage.getItem('fleet-kpi-theme');
        if (saved) setIsDark(saved === 'dark');
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        localStorage.setItem('fleet-kpi-theme', newTheme ? 'dark' : 'light');
    };

    const { data: kpis, isLoading, error } = useQuery<FleetKpi>({
        queryKey: ['fleet-kpis'],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/api/fleet-kpis`);
            if (!res.ok) throw new Error('Failed to fetch KPIs');
            return res.json();
        },
        refetchInterval: 30000,
    });

    if (isLoading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: colors.bgSecondary }}
            >
                <div className="flex items-center gap-3" style={{ color: colors.textSecondary }}>
                    <Activity className="w-5 h-5 animate-spin" />
                    <span>Loading Fleet KPIs...</span>
                </div>
            </div>
        );
    }

    if (error || !kpis) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: colors.bgSecondary }}
            >
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <p style={{ color: colors.textSecondary }}>Failed to load dashboard data</p>
                    <p className="text-sm mt-1" style={{ color: colors.textMuted }}>Make sure the backend is running</p>
                </div>
            </div>
        );
    }

    const sparkline1 = [40, 45, 42, 50, 48, 55, 52, 58];
    const sparkline2 = [30, 35, 38, 42, 40, 45, 48, 50];

    return (
        <div className="min-h-screen" style={{ backgroundColor: colors.bgSecondary }}>
            <Sidebar isDark={isDark} colors={colors} />
            <Header isDark={isDark} toggleTheme={toggleTheme} colors={colors} />

            {/* Main Content */}
            <main className="ml-64 pt-16 p-6">
                <div className="space-y-6">
                    {/* Top Row - Big Stats */}
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-4">
                            <BigStatCard
                                title="Average Weekly Revenue"
                                value={`$${((kpis.fuelCostMtd + kpis.maintenanceCostMtd) / 4).toLocaleString()}`}
                                trend="+5.0%"
                                trendUp={true}
                                sparklineData={sparkline1}
                                colors={colors}
                            />
                        </div>
                        <div className="col-span-8">
                            <StatRow kpis={kpis} colors={colors} />
                        </div>
                    </div>

                    {/* Second Row - User Stats + Sales Chart */}
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-4 space-y-4">
                            <UserStatsCard
                                title="Total Buses"
                                value={`${(kpis.totalBuses * 5.4).toFixed(1)}K`}
                                trendText="12.5% from last month"
                                trendUp={true}
                                donutData={[
                                    { value: 70, color: colors.chartPurple },
                                    { value: 30, color: colors.chartPink },
                                ]}
                                colors={colors}
                            />
                            <UserStatsCard
                                title="Active Buses"
                                value={`${(kpis.activeBuses * 2.3).toFixed(1)}K`}
                                percentage={78}
                                trendText="24k users increased from last month"
                                trendUp={true}
                                donutData={[
                                    { value: 78, color: colors.chartCyan },
                                    { value: 22, color: colors.border },
                                ]}
                                colors={colors}
                            />
                        </div>
                        <div className="col-span-8">
                            <SalesViewsChart trends={kpis.weeklyTrends} colors={colors} />
                        </div>
                    </div>

                    {/* Third Row - Sales Stats + Ongoing Projects */}
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-3">
                            <BigStatCard
                                title="Fleet Value"
                                value={`$${(kpis.totalBuses * 45).toLocaleString()},129`}
                                subValue="285 left to Goal"
                                trend="+8.5%"
                                trendUp={true}
                                colors={colors}
                            />
                        </div>
                        <div className="col-span-5">
                            <MonthlyYearlyStats kpis={kpis} colors={colors} />
                        </div>
                        <div className="col-span-4">
                            <CampaignCards kpis={kpis} colors={colors} />
                        </div>
                    </div>

                    {/* Fourth Row - Driver Performance */}
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-6">
                            <DriverPerformanceTable drivers={kpis.driverScores} colors={colors} />
                        </div>
                        <div className="col-span-6">
                            <div
                                className="rounded-2xl p-5 transition-all hover:shadow-lg h-full"
                                style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}
                            >
                                <h3 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>Vehicle Status Overview</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Active', value: kpis.activeBuses, color: colors.chartGreen, icon: CheckCircle2 },
                                        { label: 'Inactive', value: kpis.inactiveBuses, color: colors.textMuted, icon: Clock },
                                        { label: 'In Shop', value: kpis.inMaintenance, color: colors.warning, icon: Wrench },
                                        { label: 'Out of Service', value: kpis.outOfService, color: colors.danger, icon: AlertCircle },
                                    ].map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="p-4 rounded-xl"
                                            style={{ backgroundColor: colors.bgHover }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                                    style={{ backgroundColor: `${item.color}20` }}
                                                >
                                                    <item.icon size={18} style={{ color: item.color }} />
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>{item.value}</div>
                                                    <div className="text-xs" style={{ color: colors.textMuted }}>{item.label}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
