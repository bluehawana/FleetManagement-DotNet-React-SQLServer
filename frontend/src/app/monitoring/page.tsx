'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import {
  Activity,
  MapPin,
  Clock,
  Fuel,
  AlertTriangle,
  CheckCircle,
  Users,
  TrendingUp,
  Radio
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

const statusColors: Record<string, string> = {
  Operating: 'bg-green-500',
  InMaintenance: 'bg-blue-500',
  OutOfService: 'bg-red-500',
  Delayed: 'bg-amber-500',
};

function LiveBusRow({ bus, index }: { bus: any; index: number }) {
  const licensePlate = generateLicensePlate(index);
  const speed = 15 + (index * 3) % 35; // Simulated speed
  const passengers = 12 + (index * 5) % 40; // Simulated passengers
  
  return (
    <tr className="hover:bg-[var(--background-secondary)]">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full ${statusColors[bus.status] || 'bg-gray-400'}`}></span>
          <div>
            <p className="font-medium text-[var(--foreground)]">Bus {bus.busNumber}</p>
            <p className="text-xs font-mono text-[var(--foreground-muted)]">{licensePlate}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-[var(--foreground-secondary)]">
        {bus.currentRoute || 'At Depot'}
      </td>
      <td className="px-4 py-3 text-sm text-[var(--foreground-secondary)]">
        {bus.assignedDriver || 'Unassigned'}
      </td>
      <td className="px-4 py-3 text-sm text-[var(--foreground-secondary)]">
        {bus.status === 'Operating' ? `${speed} mph` : '--'}
      </td>
      <td className="px-4 py-3 text-sm text-[var(--foreground-secondary)]">
        {bus.status === 'Operating' ? passengers : '--'}
      </td>
      <td className="px-4 py-3">
        <span className={`badge ${
          bus.status === 'Operating' ? 'badge-success' : 
          bus.status === 'InMaintenance' ? 'badge-info' :
          bus.status === 'Delayed' ? 'badge-warning' : 'badge-danger'
        }`}>
          {bus.status === 'Operating' ? 'On Route' : 
           bus.status === 'InMaintenance' ? 'In Service' :
           bus.status === 'Delayed' ? 'Delayed' : 'Offline'}
        </span>
      </td>
    </tr>
  );
}

export default function MonitoringPage() {
  const { data: fleetStatus, isLoading } = useQuery({
    queryKey: ['fleet-status'],
    queryFn: async () => (await api.dashboard.fleetStatus()).data,
    refetchInterval: 5000,
  });

  const { data: buses } = useQuery({
    queryKey: ['buses'],
    queryFn: async () => (await api.bus.getAll()).data,
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-[var(--foreground-muted)] mt-3">Connecting to live feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Live Tracking</h1>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">
            Real-time fleet monitoring and status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--success-light)] rounded-full">
            <span className="w-2 h-2 bg-[var(--success)] rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-green-700">Live</span>
          </div>
          <span className="text-sm text-[var(--foreground-muted)]">Auto-refresh: 5s</span>
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid-cols-4">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon green">
              <Activity size={20} />
            </div>
          </div>
          <div className="stat-value">{fleetStatus?.activeBuses || 0}</div>
          <div className="stat-label">Active Vehicles</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon yellow">
              <Clock size={20} />
            </div>
          </div>
          <div className="stat-value">{fleetStatus?.delaysToday || 0}</div>
          <div className="stat-label">Delayed</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon blue">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="stat-value">{fleetStatus?.operationsToday || 0}</div>
          <div className="stat-label">Trips Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon green">
              <Users size={20} />
            </div>
          </div>
          <div className="stat-value">{(fleetStatus?.passengersToday || 0).toLocaleString()}</div>
          <div className="stat-label">Passengers Today</div>
        </div>
      </div>

      {/* Grafana Embedded Panels */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Live Metrics Dashboard</h3>
            <p className="card-description">Powered by Grafana • Real-time fleet analytics</p>
          </div>
          <a 
            href="http://localhost:3001/d/fleet-overview/fleet-overview?orgId=1&kiosk" 
            target="_blank"
            className="btn btn-secondary btn-sm"
          >
            <Activity size={14} />
            Open Grafana
          </a>
        </div>
        <div className="card-body p-0">
          <div className="grid grid-cols-2 gap-0 border-t border-[var(--border)]">
            {/* Fleet Status Panel */}
            <div className="border-r border-b border-[var(--border)]">
              <iframe
                src="http://localhost:3001/d-solo/fleet-overview/fleet-overview?orgId=1&panelId=1&theme=light"
                width="100%"
                height="200"
                frameBorder="0"
                className="bg-white"
              />
            </div>
            {/* Passengers Panel */}
            <div className="border-b border-[var(--border)]">
              <iframe
                src="http://localhost:3001/d-solo/fleet-overview/fleet-overview?orgId=1&panelId=2&theme=light"
                width="100%"
                height="200"
                frameBorder="0"
                className="bg-white"
              />
            </div>
            {/* Revenue Panel */}
            <div className="border-r border-[var(--border)]">
              <iframe
                src="http://localhost:3001/d-solo/fleet-overview/fleet-overview?orgId=1&panelId=3&theme=light"
                width="100%"
                height="200"
                frameBorder="0"
                className="bg-white"
              />
            </div>
            {/* Fuel Efficiency Panel */}
            <div>
              <iframe
                src="http://localhost:3001/d-solo/fleet-overview/fleet-overview?orgId=1&panelId=4&theme=light"
                width="100%"
                height="200"
                frameBorder="0"
                className="bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Fleet Map</h3>
            <p className="card-description">Real-time vehicle locations</p>
          </div>
          <button className="btn btn-secondary btn-sm">
            <MapPin size={14} />
            Full Screen
          </button>
        </div>
        <div className="card-body p-0">
          <div className="h-64 bg-gradient-to-br from-[var(--background-secondary)] to-[var(--background-tertiary)] flex items-center justify-center">
            <div className="text-center">
              <MapPin size={48} className="mx-auto text-[var(--foreground-muted)] mb-3" />
              <p className="text-sm text-[var(--foreground-muted)]">Map integration coming soon</p>
              <p className="text-xs text-[var(--foreground-muted)] mt-1">Google Maps or Mapbox</p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Vehicle Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Vehicle Status</h3>
            <p className="card-description">All vehicles in real-time</p>
          </div>
          <div className="flex items-center gap-2">
            <Radio size={14} className="text-[var(--success)] animate-pulse" />
            <span className="text-xs text-[var(--foreground-muted)]">Live updates</span>
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Route</th>
                <th>Driver</th>
                <th>Speed</th>
                <th>Passengers</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {buses?.map((bus: any, index: number) => (
                <LiveBusRow key={bus.id} bus={bus} index={index} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts Panel */}
      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Active Alerts</h3>
              <p className="card-description">Issues requiring attention</p>
            </div>
          </div>
          <div className="card-body space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--danger-light)] border border-red-200">
              <AlertTriangle size={18} className="text-[var(--danger)] mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Bus 08 - Engine Warning</p>
                <p className="text-xs text-[var(--foreground-muted)]">Check engine light activated • 2 min ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--warning-light)] border border-amber-200">
              <Clock size={18} className="text-[var(--warning)] mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Bus 12 - Running Late</p>
                <p className="text-xs text-[var(--foreground-muted)]">8 minutes behind schedule • 5 min ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--info-light)] border border-blue-200">
              <Fuel size={18} className="text-[var(--info)] mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Bus 05 - Low Fuel</p>
                <p className="text-xs text-[var(--foreground-muted)]">Fuel level below 20% • 10 min ago</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Today's Performance</h3>
              <p className="card-description">Key metrics for today</p>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
                <span className="text-sm text-[var(--foreground-secondary)]">On-Time Rate</span>
                <span className="text-sm font-semibold text-[var(--success)]">94.2%</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
                <span className="text-sm text-[var(--foreground-secondary)]">Average Delay</span>
                <span className="text-sm font-semibold text-[var(--foreground)]">4.5 min</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
                <span className="text-sm text-[var(--foreground-secondary)]">Fuel Consumed</span>
                <span className="text-sm font-semibold text-[var(--foreground)]">1,245 gal</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-[var(--foreground-secondary)]">Miles Driven</span>
                <span className="text-sm font-semibold text-[var(--foreground)]">3,842 mi</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
