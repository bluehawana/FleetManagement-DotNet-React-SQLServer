'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

export default function InsightsPage() {
  const { data: fuelWasters } = useQuery({
    queryKey: ['fuel-wasters'],
    queryFn: async () => {
      const response = await api.insights.fuelWasters(30);
      return response.data;
    },
  });

  const { data: emptyBuses } = useQuery({
    queryKey: ['empty-buses'],
    queryFn: async () => {
      const response = await api.insights.emptyBuses(30);
      return response.data;
    },
  });

  const { data: driverPerformance } = useQuery({
    queryKey: ['driver-performance'],
    queryFn: async () => {
      const response = await api.insights.driverPerformance(30);
      return response.data;
    },
  });

  const { data: routeOptimization } = useQuery({
    queryKey: ['route-optimization'],
    queryFn: async () => {
      const response = await api.insights.routeOptimization(30);
      return response.data;
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">💡 Business Insights</h1>
              <p className="text-sm text-gray-600">Data-driven recommendations to save money</p>
            </div>
            <Link href="/" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Fuel Waste */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">⛽ Fuel Waste Analysis</h2>
          <Card>
            {fuelWasters && (
              <>
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Fleet Average MPG</p>
                      <p className="text-2xl font-bold text-gray-900">{fuelWasters.fleetAverageMPG.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Potential Annual Savings</p>
                      <p className="text-2xl font-bold text-green-600">${fuelWasters.potentialSavings.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Top Fuel Wasters</h3>
                  <div className="space-y-2">
                    {fuelWasters.topWasters.slice(0, 5).map((waster: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">Bus {waster.busNumber}</span>
                          <span className="text-sm text-gray-600 ml-2">
                            {waster.actualMPG.toFixed(2)} MPG ({waster.percentWorse.toFixed(0)}% worse than target)
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-red-600">${waster.annualizedWaste.toLocaleString()}/year</p>
                          <p className="text-xs text-gray-600">{waster.actionRequired}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </Card>
        </section>

        {/* Empty Buses */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🚌 Empty Bus Analysis</h2>
          <Card>
            {emptyBuses && (
              <>
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Wasteful Routes</p>
                      <p className="text-2xl font-bold text-gray-900">{emptyBuses.wastefulRoutes.length}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Net Opportunity</p>
                      <p className="text-2xl font-bold text-green-600">${emptyBuses.netOpportunity.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Routes with Low Occupancy (&lt;30%)</h3>
                  <div className="space-y-2">
                    {emptyBuses.wastefulRoutes.slice(0, 5).map((route: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded">
                        <div>
                          <span className="font-medium">Route {route.routeNumber}</span>
                          <Badge status="danger" className="ml-2">{route.occupancyPercent.toFixed(0)}% full</Badge>
                          <p className="text-sm text-gray-600 mt-1">{route.timeSlot}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">${route.annualSavingsIfCancelled.toLocaleString()}/year</p>
                          <p className="text-xs text-gray-600">{route.recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </Card>
        </section>

        {/* Driver Performance */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">👨‍✈️ Driver Performance</h2>
          <Card>
            {driverPerformance && (
              <>
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Drivers Needing Training</p>
                      <p className="text-2xl font-bold text-gray-900">{driverPerformance.driversNeedingTraining}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Potential Savings</p>
                      <p className="text-2xl font-bold text-green-600">${driverPerformance.potentialSavings.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <h3 className="font-semibold mb-3 text-green-600">🏆 Top Performers</h3>
                    <div className="space-y-2">
                      {driverPerformance.topPerformers.slice(0, 3).map((driver: any, idx: number) => (
                        <div key={idx} className="p-3 bg-green-50 rounded">
                          <div className="flex justify-between">
                            <span className="font-medium">{driver.driverName}</span>
                            <Badge status="success">{driver.performanceScore.toFixed(0)}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {driver.mpg.toFixed(2)} MPG • {driver.averageDelayMinutes.toFixed(1)} min avg delay
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3 text-red-600">⚠️ Needs Training</h3>
                    <div className="space-y-2">
                      {driverPerformance.poorPerformers.slice(0, 3).map((driver: any, idx: number) => (
                        <div key={idx} className="p-3 bg-red-50 rounded">
                          <div className="flex justify-between">
                            <span className="font-medium">{driver.driverName}</span>
                            <Badge status="danger">{driver.performanceScore.toFixed(0)}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {driver.mpg.toFixed(2)} MPG • ${driver.annualizedExcessCost?.toLocaleString()}/year waste
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </Card>
        </section>

        {/* Route Optimization */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🗺️ Route Optimization</h2>
          <Card>
            {routeOptimization && (
              <>
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Routes with Issues</p>
                      <p className="text-2xl font-bold text-gray-900">{routeOptimization.totalRoutesWithIssues}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Annual Savings Potential</p>
                      <p className="text-2xl font-bold text-green-600">${routeOptimization.annualizedSavings.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Problematic Routes</h3>
                  <div className="space-y-2">
                    {routeOptimization.problematicRoutes.slice(0, 5).map((route: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-yellow-50 rounded">
                        <div>
                          <span className="font-medium">Route {route.routeNumber}</span>
                          <Badge status="warning" className="ml-2">{route.priority}</Badge>
                          <p className="text-sm text-gray-600 mt-1">
                            {route.averageDelayMinutes.toFixed(1)} min avg delay • {route.profitMargin.toFixed(1)}% margin
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">${route.annualizedSavings.toLocaleString()}/year</p>
                          <p className="text-xs text-gray-600">{route.recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </Card>
        </section>
      </main>
    </div>
  );
}
