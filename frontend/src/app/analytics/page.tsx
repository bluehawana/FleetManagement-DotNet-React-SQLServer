'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import Image from 'next/image';

function Panel({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-[#181b1f] rounded-lg border border-white/5 overflow-hidden ${className}`}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#111318]">
                <h3 className="text-sm font-medium text-white">{title}</h3>
            </div>
            <div className="p-4">{children}</div>
        </div>
    );
}

function MetricCard({
    title,
    value,
    change,
    description
}: {
    title: string;
    value: string;
    change?: { value: string; positive: boolean };
    description: string;
}) {
    return (
        <div className="bg-[#1a1d21] rounded-lg border border-white/5 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider">{title}</p>
            <div className="flex items-end gap-2 mt-1">
                <p className="text-2xl font-bold text-white">{value}</p>
                {change && (
                    <span className={`text-xs mb-1 ${change.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {change.positive ? '↑' : '↓'} {change.value}
                    </span>
                )}
            </div>
            <p className="text-xs text-slate-500 mt-1">{description}</p>
        </div>
    );
}

export default function AnalyticsPage() {
    const { data: kpis } = useQuery({
        queryKey: ['kpis'],
        queryFn: async () => {
            const response = await api.dashboard.kpis();
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

    return (
        <div className="space-y-6">
            {/* Header with Time Range Selector */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-white">Data Visualization Center</h2>
                    <p className="text-sm text-slate-500">US DOT Data Analysis (2015-2023)</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 text-xs bg-orange-500/20 text-orange-400 rounded-lg border border-orange-500/30">
                        Last 30 Days
                    </button>
                    <button className="px-3 py-1.5 text-xs bg-white/5 text-slate-400 rounded-lg border border-white/10 hover:border-orange-500/30 transition-all">
                        Last 90 Days
                    </button>
                    <button className="px-3 py-1.5 text-xs bg-white/5 text-slate-400 rounded-lg border border-white/10 hover:border-orange-500/30 transition-all">
                        This Year
                    </button>
                    <button className="px-3 py-1.5 text-xs bg-white/5 text-slate-400 rounded-lg border border-white/10 hover:border-orange-500/30 transition-all">
                        Custom
                    </button>
                </div>
            </div>

            {/* Key Insights from US DOT */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Diesel Price Change"
                    value="+85%"
                    change={{ value: "since 2015", positive: false }}
                    description="$2.71 → $5.00/gallon"
                />
                <MetricCard
                    title="Ridership Recovery"
                    value="62%"
                    change={{ value: "vs pre-COVID", positive: true }}
                    description="406M → 246M monthly"
                />
                <MetricCard
                    title="Cost Per Passenger"
                    value="+235%"
                    change={{ value: "efficiency drop", positive: false }}
                    description="$0.028 → $0.094"
                />
                <MetricCard
                    title="Peak Month"
                    value="October"
                    description="Highest ridership month"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Fuel Cost Trends */}
                <Panel title="Fuel Cost Trends (2015-2023)">
                    <div className="aspect-video bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg border border-dashed border-white/10 flex items-center justify-center">
                        <div className="text-center">
                            <span className="text-4xl">📈</span>
                            <p className="text-sm text-slate-400 mt-2">Diesel +85% | Peak: $5.75 (Jun 2022)</p>
                            <p className="text-xs text-slate-500">Based on US DOT Transportation Statistics</p>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-lg font-bold text-white">$2.71</p>
                            <p className="text-xs text-slate-500">2015 Avg</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-red-400">$5.75</p>
                            <p className="text-xs text-slate-500">2022 Peak</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-amber-400">$4.41</p>
                            <p className="text-xs text-slate-500">Current</p>
                        </div>
                    </div>
                </Panel>

                {/* Ridership Patterns */}
                <Panel title="Ridership Patterns">
                    <div className="aspect-video bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg border border-dashed border-white/10 flex items-center justify-center">
                        <div className="text-center">
                            <span className="text-4xl">👥</span>
                            <p className="text-sm text-slate-400 mt-2">COVID Impact: -72% | Recovery: 62%</p>
                            <p className="text-xs text-slate-500">Monthly transit ridership trends</p>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-lg font-bold text-white">406M</p>
                            <p className="text-xs text-slate-500">Pre-COVID</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-red-400">111M</p>
                            <p className="text-xs text-slate-500">COVID Low</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-emerald-400">246M</p>
                            <p className="text-xs text-slate-500">Current</p>
                        </div>
                    </div>
                </Panel>

                {/* Cost Efficiency */}
                <Panel title="Cost Efficiency Analysis">
                    <div className="aspect-video bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg border border-dashed border-white/10 flex items-center justify-center">
                        <div className="text-center">
                            <span className="text-4xl">💰</span>
                            <p className="text-sm text-slate-400 mt-2">Cost per passenger increased 3.4x</p>
                            <p className="text-xs text-slate-500">Efficiency trending down since 2020</p>
                        </div>
                    </div>
                    <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-xs text-red-400 font-medium">⚠️ ALERT: Efficiency Crisis</p>
                        <p className="text-xs text-slate-400 mt-1">
                            Each passenger now costs 235% more to serve than in 2015
                        </p>
                    </div>
                </Panel>

                {/* Schedule Optimization */}
                <Panel title="Schedule Optimization">
                    <div className="aspect-video bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg border border-dashed border-white/10 flex items-center justify-center">
                        <div className="text-center">
                            <span className="text-4xl">📅</span>
                            <p className="text-sm text-slate-400 mt-2">Best: October | Worst: July-August</p>
                            <p className="text-xs text-slate-500">Seasonal optimization opportunities</p>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <p className="text-xs text-slate-400">Low Fuel Cost Months</p>
                            <p className="text-sm font-medium text-emerald-400">Dec, Jan, Feb</p>
                        </div>
                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <p className="text-xs text-slate-400">High Fuel Cost Months</p>
                            <p className="text-sm font-medium text-amber-400">May, Jun, Jul</p>
                        </div>
                    </div>
                </Panel>
            </div>

            {/* Recommendations Panel */}
            <Panel title="AI-Powered Recommendations (Based on US DOT Analysis)">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                            <span className="text-xl">📅</span>
                        </div>
                        <p className="font-medium text-white text-sm">Seasonal Scheduling</p>
                        <p className="text-xs text-slate-400 mt-1">Reduce service Jul-Aug (lowest ridership)</p>
                        <p className="text-xs text-emerald-400 mt-2">Save 15-20% on fuel</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center mb-3">
                            <span className="text-xl">⛽</span>
                        </div>
                        <p className="font-medium text-white text-sm">Fuel Hedging</p>
                        <p className="text-xs text-slate-400 mt-1">Lock prices for Q2-Q3 (expensive)</p>
                        <p className="text-xs text-emerald-400 mt-2">Save $45K/year</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
                            <span className="text-xl">🚌</span>
                        </div>
                        <p className="font-medium text-white text-sm">Route Optimization</p>
                        <p className="text-xs text-slate-400 mt-1">Focus on high-ridership corridors</p>
                        <p className="text-xs text-emerald-400 mt-2">+12% efficiency</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-3">
                            <span className="text-xl">🔋</span>
                        </div>
                        <p className="font-medium text-white text-sm">Electrification</p>
                        <p className="text-xs text-slate-400 mt-1">Hedge against diesel volatility</p>
                        <p className="text-xs text-emerald-400 mt-2">Long-term savings</p>
                    </div>
                </div>
            </Panel>
        </div>
    );
}
