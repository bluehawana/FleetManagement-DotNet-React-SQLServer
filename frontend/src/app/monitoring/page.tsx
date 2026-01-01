'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

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

function BusCard({ bus }: { bus: any }) {
    const statusColors: Record<string, string> = {
        Operating: 'bg-emerald-500',
        InMaintenance: 'bg-amber-500',
        OutOfService: 'bg-red-500',
        Delayed: 'bg-yellow-500',
    };

    return (
        <div className="bg-[#1a1d21] rounded-lg border border-white/5 p-4 hover:border-orange-500/30 transition-all">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${statusColors[bus.status] || 'bg-gray-500'}`}></div>
                    <span className="font-bold text-white">Bus {bus.busNumber}</span>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-slate-400">
                    {bus.status}
                </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                    <p className="text-slate-500">Route</p>
                    <p className="text-white font-medium">{bus.currentRoute || 'N/A'}</p>
                </div>
                <div>
                    <p className="text-slate-500">Driver</p>
                    <p className="text-white font-medium">{bus.assignedDriver || 'Unassigned'}</p>
                </div>
                <div>
                    <p className="text-slate-500">Mileage</p>
                    <p className="text-white font-medium">{bus.currentMileage?.toLocaleString()} mi</p>
                </div>
                <div>
                    <p className="text-slate-500">Fuel</p>
                    <p className="text-white font-medium">{bus.fuelLevel || '75'}%</p>
                </div>
            </div>
        </div>
    );
}

export default function MonitoringPage() {
    const { data: fleetStatus, isLoading } = useQuery({
        queryKey: ['fleet-status'],
        queryFn: async () => {
            const response = await api.dashboard.fleetStatus();
            return response.data;
        },
        refetchInterval: 5000,
    });

    const { data: buses } = useQuery({
        queryKey: ['buses'],
        queryFn: async () => {
            const response = await api.buses.getAll();
            return response.data;
        },
        refetchInterval: 10000,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Live Status Header */}
            <div className="bg-[#181b1f] rounded-lg border border-white/5 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-lg font-semibold text-white">Live Monitoring</span>
                        <span className="text-xs text-slate-500">Auto-refresh: 5s</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-emerald-400">{fleetStatus?.activeBuses || 0}</p>
                            <p className="text-xs text-slate-500">Operating</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-amber-400">{fleetStatus?.delaysToday || 0}</p>
                            <p className="text-xs text-slate-500">Delayed</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-400">{fleetStatus?.inMaintenance || 0}</p>
                            <p className="text-xs text-slate-500">Maintenance</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-red-400">{fleetStatus?.outOfService || 0}</p>
                            <p className="text-xs text-slate-500">Out of Service</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Placeholder */}
            <Panel title="Fleet Map" className="h-64">
                <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg border border-dashed border-white/10">
                    <div className="text-center">
                        <span className="text-4xl">🗺️</span>
                        <p className="text-sm text-slate-400 mt-2">Map integration coming soon</p>
                        <p className="text-xs text-slate-500">Google Maps API or OpenStreetMap</p>
                    </div>
                </div>
            </Panel>

            {/* Bus Grid */}
            <Panel title="Fleet Vehicles">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {buses?.slice(0, 12).map((bus: any) => (
                        <BusCard key={bus.id} bus={bus} />
                    ))}
                </div>
            </Panel>

            {/* Real-time Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Panel title="Today's Performance">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">Operations</span>
                            <span className="font-semibold text-white">{fleetStatus?.operationsToday || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">Passengers</span>
                            <span className="font-semibold text-white">{(fleetStatus?.passengersToday || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">On-Time Rate</span>
                            <span className="font-semibold text-emerald-400">94.2%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">Avg Delay</span>
                            <span className="font-semibold text-amber-400">4.5 min</span>
                        </div>
                    </div>
                </Panel>

                <Panel title="Fuel Consumption">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">Today</span>
                            <span className="font-semibold text-white">1,245 gal</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">This Week</span>
                            <span className="font-semibold text-white">8,432 gal</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">Fleet Avg MPG</span>
                            <span className="font-semibold text-emerald-400">5.9</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">Cost Today</span>
                            <span className="font-semibold text-amber-400">$3,735</span>
                        </div>
                    </div>
                </Panel>

                <Panel title="Active Alerts">
                    <div className="space-y-2">
                        <div className="flex items-start gap-2 p-2 rounded bg-red-500/10">
                            <span className="text-red-400">🔴</span>
                            <div>
                                <p className="text-xs text-white">Bus 08 - Engine Warning</p>
                                <p className="text-xs text-slate-500">2 min ago</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2 p-2 rounded bg-amber-500/10">
                            <span className="text-amber-400">🟡</span>
                            <div>
                                <p className="text-xs text-white">Bus 12 - Delayed 8 min</p>
                                <p className="text-xs text-slate-500">5 min ago</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2 p-2 rounded bg-blue-500/10">
                            <span className="text-blue-400">🔵</span>
                            <div>
                                <p className="text-xs text-white">Bus 05 - Maint. Due</p>
                                <p className="text-xs text-slate-500">10 min ago</p>
                            </div>
                        </div>
                    </div>
                </Panel>
            </div>
        </div>
    );
}
