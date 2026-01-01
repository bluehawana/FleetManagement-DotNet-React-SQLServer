'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import {
  TrendingUp,
  TrendingDown,
  Fuel,
  Users,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  ArrowRight
} from 'lucide-react';

function MetricCard({ title, value, change, changeLabel, isPositive, icon: Icon }: any) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <div className="stat-icon blue">
          <Icon size={20} />
        </div>
        {change && (
          <div className={`stat-trend ${isPositive ? 'up' : 'down'}`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {change}
          </div>
        )}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{title}</div>
      {changeLabel && <p className="text-xs text-[var(--foreground-muted)] mt-1">{changeLabel}</p>}
    </div>
  );
}

function ChartPlaceholder({ title, description, icon: Icon }: { title: string; description: string; icon: any }) {
  return (
    <div className="h-48 bg-gradient-to-br from-[var(--background-secondary)] to-[var(--background-tertiary)] rounded-lg flex items-center justify-center">
      <div className="text-center">
        <Icon size={32} className="mx-auto text-[var(--foreground-muted)] mb-2" />
        <p className="text-sm text-[var(--foreground-muted)]">{title}</p>
        <p className="text-xs text-[var(--foreground-muted)] mt-1">{description}</p>
      </div>
    </div>
  );
}

function InsightCard({ icon, title, description, savings, color }: any) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-[var(--info-light)] border-blue-200',
    amber: 'bg-[var(--warning-light)] border-amber-200',
    purple: 'bg-purple-50 border-purple-200',
    green: 'bg-[var(--success-light)] border-green-200',
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-[var(--foreground)]">{title}</h4>
          <p className="text-xs text-[var(--foreground-muted)] mt-1">{description}</p>
          {savings && (
            <p className="text-sm font-semibold text-[var(--primary)] mt-2">{savings}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: kpis } = useQuery({
    queryKey: ['kpis'],
    queryFn: async () => (await api.dashboard.kpis()).data,
  });

  const { data: roiSummary } = useQuery({
    queryKey: ['roi-summary'],
    queryFn: async () => (await api.insights.roiSummary(30)).data,
  });

  const { data: dotInsights } = useQuery({
    queryKey: ['us-dot-insights'],
    queryFn: async () => (await api.analytics.usDotInsights()).data,
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Analytics</h1>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">
            Performance insights and industry benchmarks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost btn-sm">Last 7 Days</button>
          <button className="btn btn-secondary btn-sm">Last 30 Days</button>
          <button className="btn btn-ghost btn-sm">Last 90 Days</button>
          <button className="btn btn-ghost btn-sm">Custom</button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid-cols-4">
        <MetricCard
          title="Diesel Price Change"
          value="+85%"
          change="since 2015"
          isPositive={false}
          icon={Fuel}
        />
        <MetricCard
          title="Ridership Recovery"
          value="62%"
          change="vs pre-COVID"
          isPositive={true}
          icon={Users}
        />
        <MetricCard
          title="Cost Per Passenger"
          value="+235%"
          change="efficiency drop"
          isPositive={false}
          icon={DollarSign}
        />
        <MetricCard
          title="Peak Month"
          value="October"
          changeLabel="Highest ridership"
          icon={Calendar}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Fuel Cost Trends</h3>
              <p className="card-description">2015-2023 diesel price analysis</p>
            </div>
          </div>
          <div className="card-body">
            <ChartPlaceholder 
              title="Diesel +85%" 
              description="Peak: $5.75 (Jun 2022)" 
              icon={BarChart3}
            />
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-[var(--background-secondary)] rounded-lg">
                <p className="text-lg font-bold text-[var(--foreground)]">$2.71</p>
                <p className="text-xs text-[var(--foreground-muted)]">2015 Avg</p>
              </div>
              <div className="p-3 bg-[var(--danger-light)] rounded-lg">
                <p className="text-lg font-bold text-[var(--danger)]">$5.75</p>
                <p className="text-xs text-[var(--foreground-muted)]">2022 Peak</p>
              </div>
              <div className="p-3 bg-[var(--warning-light)] rounded-lg">
                <p className="text-lg font-bold text-[var(--warning)]">$4.41</p>
                <p className="text-xs text-[var(--foreground-muted)]">Current</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Ridership Patterns</h3>
              <p className="card-description">Monthly transit ridership trends</p>
            </div>
          </div>
          <div className="card-body">
            <ChartPlaceholder 
              title="COVID Impact: -72%" 
              description="Recovery: 62%" 
              icon={PieChart}
            />
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-[var(--background-secondary)] rounded-lg">
                <p className="text-lg font-bold text-[var(--foreground)]">406M</p>
                <p className="text-xs text-[var(--foreground-muted)]">Pre-COVID</p>
              </div>
              <div className="p-3 bg-[var(--danger-light)] rounded-lg">
                <p className="text-lg font-bold text-[var(--danger)]">111M</p>
                <p className="text-xs text-[var(--foreground-muted)]">COVID Low</p>
              </div>
              <div className="p-3 bg-[var(--success-light)] rounded-lg">
                <p className="text-lg font-bold text-[var(--success)]">246M</p>
                <p className="text-xs text-[var(--foreground-muted)]">Current</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROI Summary */}
      {roiSummary && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Cost Savings Potential</h3>
              <p className="card-description">Based on your fleet data analysis</p>
            </div>
            <button className="btn btn-primary btn-sm">
              View Full Report
              <ArrowRight size={14} />
            </button>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-4 gap-6">
              <div className="col-span-1 text-center p-6 bg-[var(--primary-light)] rounded-lg">
                <p className="text-3xl font-bold text-[var(--primary)]">
                  ${roiSummary.totalPotentialAnnualSavings?.toLocaleString()}
                </p>
                <p className="text-sm text-[var(--foreground-muted)] mt-1">Annual Savings Potential</p>
                <div className="mt-4 flex items-center justify-center gap-4 text-sm">
                  <div>
                    <span className="font-semibold">{roiSummary.roiPercentage}%</span>
                    <span className="text-[var(--foreground-muted)]"> ROI</span>
                  </div>
                  <div>
                    <span className="font-semibold">{roiSummary.paybackMonths}</span>
                    <span className="text-[var(--foreground-muted)]"> mo payback</span>
                  </div>
                </div>
              </div>
              <div className="col-span-3 grid grid-cols-2 gap-4">
                <div className="p-4 border border-[var(--border)] rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[var(--foreground-secondary)]">Fuel Optimization</span>
                    <span className="text-sm font-semibold text-[var(--primary)]">
                      ${roiSummary.problem1_FuelWaste?.potentialAnnualSavings?.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div className="p-4 border border-[var(--border)] rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[var(--foreground-secondary)]">Route Efficiency</span>
                    <span className="text-sm font-semibold text-[var(--warning)]">
                      ${roiSummary.problem2_EmptyBuses?.potentialAnnualSavings?.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--warning)] rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">AI-Powered Recommendations</h3>
            <p className="card-description">Based on US DOT industry analysis</p>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-4 gap-4">
            <InsightCard
              icon="📅"
              title="Seasonal Scheduling"
              description="Reduce service Jul-Aug (lowest ridership)"
              savings="Save 15-20% on fuel"
              color="blue"
            />
            <InsightCard
              icon="⛽"
              title="Fuel Hedging"
              description="Lock prices for Q2-Q3 (expensive months)"
              savings="Save $45K/year"
              color="amber"
            />
            <InsightCard
              icon="🚌"
              title="Route Optimization"
              description="Focus on high-ridership corridors"
              savings="+12% efficiency"
              color="purple"
            />
            <InsightCard
              icon="🔋"
              title="Electrification"
              description="Hedge against diesel volatility"
              savings="Long-term savings"
              color="green"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
