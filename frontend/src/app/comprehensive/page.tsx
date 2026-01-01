'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import {
  Bus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Fuel,
  MapPin,
  User,
  MoreHorizontal,
  Filter,
  Plus,
  Search
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

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  Operating: { color: 'text-green-600', bg: 'bg-green-50 border-green-200', label: 'Active' },
  InMaintenance: { color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', label: 'In Service' },
  OutOfService: { color: 'text-red-600', bg: 'bg-red-50 border-red-200', label: 'Out of Service' },
  Delayed: { color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', label: 'Delayed' },
};

function VehicleCard({ bus, index }: { bus: any; index: number }) {
  const status = statusConfig[bus.status] || statusConfig.Operating;
  const licensePlate = generateLicensePlate(index);
  const fuelLevel = 45 + (index * 7) % 55; // Simulated fuel level 45-100%

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="card-body">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[var(--background-tertiary)] flex items-center justify-center">
              <Bus size={24} className="text-[var(--foreground-secondary)]" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--foreground)]">Bus {bus.busNumber}</h3>
              <p className="text-xs font-mono text-[var(--foreground-muted)]">{licensePlate}</p>
            </div>
          </div>
          <span className={`badge ${status.bg} ${status.color} border`}>
            {status.label}
          </span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-[var(--foreground-muted)]" />
            <span className="text-[var(--foreground-secondary)]">{bus.currentRoute || 'Depot'}</span>
          </div>
          <div className="flex items-center gap-2">
            <User size={14} className="text-[var(--foreground-muted)]" />
            <span className="text-[var(--foreground-secondary)]">{bus.assignedDriver || 'Unassigned'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-[var(--foreground-muted)]" />
            <span className="text-[var(--foreground-secondary)]">{(bus.currentMileage || 0).toLocaleString()} mi</span>
          </div>
          <div className="flex items-center gap-2">
            <Fuel size={14} className="text-[var(--foreground-muted)]" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${fuelLevel > 30 ? 'bg-[var(--primary)]' : 'bg-[var(--warning)]'}`}
                    style={{ width: `${fuelLevel}%` }}
                  />
                </div>
                <span className="text-xs text-[var(--foreground-muted)]">{fuelLevel}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between">
          <span className="text-xs text-[var(--foreground-muted)]">
            {bus.make} {bus.model} • {bus.year}
          </span>
          <button className="btn btn-ghost btn-sm">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, trend, color }: any) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <div className={`stat-icon ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function FleetOverviewPage() {
  const { data: buses, isLoading } = useQuery({
    queryKey: ['buses'],
    queryFn: async () => (await api.bus.getAll()).data,
  });

  const { data: fleetStatus } = useQuery({
    queryKey: ['fleet-status'],
    queryFn: async () => (await api.dashboard.fleetStatus()).data,
  });

  const { data: stats } = useQuery({
    queryKey: ['bus-statistics'],
    queryFn: async () => (await api.bus.getStatistics()).data,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-[var(--foreground-muted)] mt-3">Loading fleet data...</p>
        </div>
      </div>
    );
  }

  const activeBuses = buses?.filter((b: any) => b.status === 'Operating') || [];
  const maintenanceBuses = buses?.filter((b: any) => b.status === 'InMaintenance') || [];
  const outOfServiceBuses = buses?.filter((b: any) => b.status === 'OutOfService') || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Fleet Overview</h1>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">
            Manage and monitor all vehicles in your fleet
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary">
            <Filter size={16} />
            Filter
          </button>
          <button className="btn btn-primary">
            <Plus size={16} />
            Add Vehicle
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-cols-4">
        <StatCard
          label="Total Vehicles"
          value={buses?.length || 0}
          icon={Bus}
          color="blue"
        />
        <StatCard
          label="Active"
          value={activeBuses.length}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          label="In Maintenance"
          value={maintenanceBuses.length}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          label="Out of Service"
          value={outOfServiceBuses.length}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Search */}
      <div className="card">
        <div className="card-body py-3">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" size={18} />
              <input
                type="text"
                placeholder="Search by bus number, license plate, or driver..."
                className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-ghost btn-sm">All</button>
              <button className="btn btn-ghost btn-sm">Active</button>
              <button className="btn btn-ghost btn-sm">Maintenance</button>
              <button className="btn btn-ghost btn-sm">Out of Service</button>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {buses?.map((bus: any, index: number) => (
          <VehicleCard key={bus.id} bus={bus} index={index} />
        ))}
      </div>

      {/* Empty State */}
      {(!buses || buses.length === 0) && (
        <div className="card">
          <div className="card-body py-12 text-center">
            <Bus size={48} className="mx-auto text-[var(--foreground-muted)] mb-4" />
            <h3 className="text-lg font-semibold text-[var(--foreground)]">No vehicles found</h3>
            <p className="text-sm text-[var(--foreground-muted)] mt-1">
              Add your first vehicle to get started
            </p>
            <button className="btn btn-primary mt-4">
              <Plus size={16} />
              Add Vehicle
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
