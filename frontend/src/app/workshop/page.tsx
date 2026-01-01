'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useState } from 'react';

function Panel({ title, children, className = '', actions }: { title: string; children: React.ReactNode; className?: string; actions?: React.ReactNode }) {
    return (
        <div className={`bg-[#181b1f] rounded-lg border border-white/5 overflow-hidden ${className}`}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#111318]">
                <h3 className="text-sm font-medium text-white">{title}</h3>
                {actions}
            </div>
            <div className="p-4">{children}</div>
        </div>
    );
}

function MaintenanceCard({ item }: { item: any }) {
    const priorityColors: Record<string, string> = {
        Critical: 'border-red-500 bg-red-500/10',
        High: 'border-amber-500 bg-amber-500/10',
        Medium: 'border-blue-500 bg-blue-500/10',
        Low: 'border-slate-500 bg-slate-500/10',
    };

    return (
        <div className={`rounded-lg border-l-4 p-4 ${priorityColors[item.priority] || priorityColors.Medium}`}>
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-white">Bus {item.busNumber}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${item.priority === 'Critical' ? 'bg-red-500 text-white' :
                                item.priority === 'High' ? 'bg-amber-500 text-white' :
                                    'bg-white/10 text-slate-400'
                            }`}>
                            {item.priority}
                        </span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{item.recommendation || 'Scheduled Maintenance'}</p>
                    <p className="text-xs text-slate-500 mt-1">
                        Due in {item.daysUntilDue} days • {item.currentMileage?.toLocaleString()} miles
                    </p>
                </div>
                <button className="px-3 py-1.5 text-xs bg-orange-500/20 text-orange-400 rounded-lg border border-orange-500/30 hover:bg-orange-500/30 transition-all">
                    Schedule
                </button>
            </div>
        </div>
    );
}

export default function WorkshopPage() {
    const [activeTab, setActiveTab] = useState<'queue' | 'scheduled' | 'completed'>('queue');

    const { data: maintenanceAlerts } = useQuery({
        queryKey: ['maintenance-alerts'],
        queryFn: async () => {
            const response = await api.insights.maintenanceAlerts();
            return response.data;
        },
    });

    const { data: buses } = useQuery({
        queryKey: ['buses'],
        queryFn: async () => {
            const response = await api.buses.getAll();
            return response.data;
        },
    });

    const maintenanceBuses = buses?.filter((b: any) => b.status === 'InMaintenance') || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-white">Workshop</h2>
                    <p className="text-sm text-slate-500">Maintenance & Operations Center</p>
                </div>
                <button className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-all">
                    + New Work Order
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#181b1f] rounded-lg border border-white/5 p-4">
                    <p className="text-xs text-slate-500 uppercase">Pending</p>
                    <p className="text-2xl font-bold text-amber-400 mt-1">{maintenanceAlerts?.urgentAlerts?.length || 0}</p>
                </div>
                <div className="bg-[#181b1f] rounded-lg border border-white/5 p-4">
                    <p className="text-xs text-slate-500 uppercase">In Progress</p>
                    <p className="text-2xl font-bold text-blue-400 mt-1">{maintenanceBuses.length}</p>
                </div>
                <div className="bg-[#181b1f] rounded-lg border border-white/5 p-4">
                    <p className="text-xs text-slate-500 uppercase">Completed Today</p>
                    <p className="text-2xl font-bold text-emerald-400 mt-1">3</p>
                </div>
                <div className="bg-[#181b1f] rounded-lg border border-white/5 p-4">
                    <p className="text-xs text-slate-500 uppercase">Parts Needed</p>
                    <p className="text-2xl font-bold text-red-400 mt-1">5</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/5 pb-4">
                {(['queue', 'scheduled', 'completed'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Maintenance Queue */}
            {activeTab === 'queue' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Panel title="Urgent Maintenance Queue" className="lg:col-span-2">
                        <div className="space-y-3">
                            {maintenanceAlerts?.urgentAlerts?.map((alert: any, idx: number) => (
                                <MaintenanceCard key={idx} item={{ ...alert, priority: alert.daysUntilDue <= 3 ? 'Critical' : 'High' }} />
                            ))}
                            {(!maintenanceAlerts?.urgentAlerts || maintenanceAlerts.urgentAlerts.length === 0) && (
                                <div className="text-center py-8 text-slate-500">
                                    <span className="text-3xl">✓</span>
                                    <p className="text-sm mt-2">No urgent maintenance needed</p>
                                </div>
                            )}
                        </div>
                    </Panel>

                    <Panel title="Preventive Maintenance Schedule">
                        <div className="space-y-3">
                            {maintenanceAlerts?.upcomingMaintenance?.slice(0, 5).map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                    <div>
                                        <p className="text-sm text-white">Bus {item.busNumber}</p>
                                        <p className="text-xs text-slate-500">{item.maintenanceType}</p>
                                    </div>
                                    <span className="text-xs text-slate-400">{item.daysUntilDue} days</span>
                                </div>
                            ))}
                        </div>
                    </Panel>

                    <Panel title="Currently In Workshop">
                        <div className="space-y-3">
                            {maintenanceBuses.map((bus: any) => (
                                <div key={bus.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                        <div>
                                            <p className="text-sm text-white">Bus {bus.busNumber}</p>
                                            <p className="text-xs text-slate-500">Oil Change + Inspection</p>
                                        </div>
                                    </div>
                                    <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400">In Progress</span>
                                </div>
                            ))}
                            {maintenanceBuses.length === 0 && (
                                <p className="text-center text-sm text-slate-500 py-4">No vehicles in workshop</p>
                            )}
                        </div>
                    </Panel>
                </div>
            )}

            {activeTab === 'scheduled' && (
                <Panel title="Scheduled Maintenance">
                    <div className="text-center py-8 text-slate-500">
                        <span className="text-3xl">📅</span>
                        <p className="text-sm mt-2">Calendar view coming soon</p>
                    </div>
                </Panel>
            )}

            {activeTab === 'completed' && (
                <Panel title="Completed Work Orders">
                    <div className="space-y-3">
                        {[1, 2, 3].map((_, idx) => (
                            <div key={idx} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                        <span className="text-emerald-400">✓</span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-white">Bus {5 + idx} - Oil Change</p>
                                        <p className="text-xs text-slate-500">Completed 2 hours ago</p>
                                    </div>
                                </div>
                                <span className="text-xs text-emerald-400">$245</span>
                            </div>
                        ))}
                    </div>
                </Panel>
            )}
        </div>
    );
}
