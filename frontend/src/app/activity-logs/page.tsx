'use client';

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

const levelColors: Record<string, { bg: string; text: string; icon: string }> = {
    info: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: 'ℹ' },
    warning: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: '⚠' },
    error: { bg: 'bg-red-500/20', text: 'text-red-400', icon: '✕' },
    success: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: '✓' },
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-white">Activity Logs</h2>
                    <p className="text-sm text-slate-500">System logs & Audit trail</p>
                </div>
                <button className="px-4 py-2 bg-white/5 text-slate-400 rounded-lg border border-white/10 hover:border-orange-500/30 transition-all">
                    Export Logs
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#181b1f] rounded-lg border border-white/5 p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <span className="text-blue-400 font-bold">i</span>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">1,245</p>
                        <p className="text-xs text-slate-500">Info Events</p>
                    </div>
                </div>
                <div className="bg-[#181b1f] rounded-lg border border-white/5 p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <span className="text-amber-400 font-bold">!</span>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">23</p>
                        <p className="text-xs text-slate-500">Warnings</p>
                    </div>
                </div>
                <div className="bg-[#181b1f] rounded-lg border border-white/5 p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                        <span className="text-red-400 font-bold">x</span>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">5</p>
                        <p className="text-xs text-slate-500">Errors</p>
                    </div>
                </div>
                <div className="bg-[#181b1f] rounded-lg border border-white/5 p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <span className="text-emerald-400 font-bold">✓</span>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">847</p>
                        <p className="text-xs text-slate-500">Successful</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#181b1f] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    {(['all', 'info', 'warning', 'error', 'success'] as const).map((level) => (
                        <button
                            key={level}
                            onClick={() => setFilter(level)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${filter === level
                                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                    : 'bg-white/5 text-slate-400 border border-white/10 hover:border-orange-500/30'
                                }`}
                        >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Logs Table */}
            <Panel title="Activity Log" actions={<span className="text-xs text-slate-500">Live updates</span>}>
                <div className="space-y-2">
                    {filteredLogs.map((log) => {
                        const colors = levelColors[log.level];
                        return (
                            <div
                                key={log.id}
                                className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
                            >
                                <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                                    <span className={`${colors.text} font-bold`}>{colors.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-slate-400">{log.source}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded ${colors.bg} ${colors.text}`}>{log.level}</span>
                                    </div>
                                    <p className="text-sm text-white mt-1">{log.message}</p>
                                    {log.details && (
                                        <p className="text-xs text-slate-500 mt-0.5">{log.details}</p>
                                    )}
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-xs text-slate-500">{log.timestamp.split(' ')[1]}</p>
                                    <p className="text-xs text-slate-600">{log.timestamp.split(' ')[0]}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Panel>

            {/* System Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Panel title="API Request Log">
                    <div className="font-mono text-xs space-y-1">
                        <div className="flex gap-2">
                            <span className="text-emerald-400">200</span>
                            <span className="text-slate-500">GET</span>
                            <span className="text-slate-400">/api/dashboard/kpis</span>
                            <span className="text-slate-600 ml-auto">12ms</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-emerald-400">200</span>
                            <span className="text-slate-500">GET</span>
                            <span className="text-slate-400">/api/dashboard/fleet-status</span>
                            <span className="text-slate-600 ml-auto">8ms</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-emerald-400">200</span>
                            <span className="text-slate-500">GET</span>
                            <span className="text-slate-400">/api/insights/roi-summary</span>
                            <span className="text-slate-600 ml-auto">45ms</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-amber-400">304</span>
                            <span className="text-slate-500">GET</span>
                            <span className="text-slate-400">/api/buses</span>
                            <span className="text-slate-600 ml-auto">3ms</span>
                        </div>
                    </div>
                </Panel>

                <Panel title="Audit Trail">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 py-2 border-b border-white/5">
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white font-bold">M</div>
                            <div className="flex-1">
                                <p className="text-xs text-white">Manager updated Bus 08 status</p>
                                <p className="text-xs text-slate-500">2 hours ago</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 py-2 border-b border-white/5">
                            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs text-white font-bold">S</div>
                            <div className="flex-1">
                                <p className="text-xs text-white">System generated daily report</p>
                                <p className="text-xs text-slate-500">4 hours ago</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 py-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-xs text-white font-bold">A</div>
                            <div className="flex-1">
                                <p className="text-xs text-white">Admin seeded mock data</p>
                                <p className="text-xs text-slate-500">6 hours ago</p>
                            </div>
                        </div>
                    </div>
                </Panel>
            </div>
        </div>
    );
}
