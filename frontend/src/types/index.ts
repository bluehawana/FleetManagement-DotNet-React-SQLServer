// Business Insights Types
export interface FuelWaster {
  busNumber: string;
  actualMPG: number;
  targetMPG: number;
  percentWorse: number;
  wastedCostThisPeriod: number;
  annualizedWaste: number;
  actionRequired: string;
}

export interface FuelWasterAnalysis {
  period: string;
  fleetAverageMPG: number;
  topWasters: FuelWaster[];
  totalWastedThisPeriod: number;
  annualizedTotalWaste: number;
  potentialSavings: number;
}

export interface WastefulRoute {
  routeNumber: string;
  timeSlot: string;
  averagePassengers: number;
  occupancyPercent: number;
  tripsPerPeriod: number;
  wastedCost: number;
  recommendation: string;
  annualSavingsIfCancelled: number;
}

export interface OvercrowdedRoute {
  routeNumber: string;
  timeSlot: string;
  averagePassengers: number;
  occupancyPercent: number;
  lostRevenueEstimate: number;
  recommendation: string;
}

export interface EmptyBusAnalysis {
  period: string;
  wastefulRoutes: WastefulRoute[];
  overcrowdedRoutes: OvercrowdedRoute[];
  totalWastedThisPeriod: number;
  annualizedWaste: number;
  potentialRevenueLoss: number;
  netOpportunity: number;
}

export interface DriverScore {
  driverName: string;
  performanceScore: number;
  mpg: number;
  averageDelayMinutes: number;
  tripCount: number;
  excessCostThisPeriod?: number;
  annualizedExcessCost?: number;
  status: string;
}

export interface DriverPerformanceAnalysis {
  period: string;
  fleetAverageMPG: number;
  fleetAverageDelay: number;
  topPerformers: DriverScore[];
  poorPerformers: DriverScore[];
  totalExcessCostThisPeriod: number;
  annualizedExcessCost: number;
  potentialSavings: number;
  driversNeedingTraining: number;
}

export interface MaintenanceAlert {
  busNumber: string;
  daysUntilDue: number;
  currentMileage: number;
  lastMaintenanceDate: string;
  estimatedCost: number;
  breakdownRisk: string;
  costIfBreakdown: number;
  savings: number;
  recommendation: string;
}

export interface MaintenanceAlertAnalysis {
  urgentAlerts: MaintenanceAlert[];
  upcomingMaintenance: MaintenanceAlert[];
  totalBusesNeedingAttention: number;
  estimatedCostIfAllPlanned: number;
  estimatedCostIfBreakdowns: number;
  potentialSavings: number;
  preventedBreakdownsThisYear: number;
  totalSavedThisYear: number;
  preventionRate: number;
}

export interface RouteIssue {
  routeNumber: string;
  routeName: string;
  averageDelayMinutes: number;
  profitMargin: number;
  tripCount: number;
  potentialSavingsThisPeriod: number;
  annualizedSavings: number;
  recommendation: string;
  priority: string;
}

export interface RouteOptimizationAnalysis {
  period: string;
  problematicRoutes: RouteIssue[];
  totalRoutesWithIssues: number;
  totalPotentialSavingsThisPeriod: number;
  annualizedSavings: number;
}

export interface SavingsOpportunity {
  problem: string;
  currentAnnualCost: number;
  potentialAnnualSavings: number;
  actionRequired: string;
  priority: string;
}

export interface ROISummary {
  period: string;
  problem1_FuelWaste: SavingsOpportunity;
  problem2_EmptyBuses: SavingsOpportunity;
  problem3_DriverHabits: SavingsOpportunity;
  problem4_MaintenanceSurprises: SavingsOpportunity;
  problem5_InefficientRoutes: SavingsOpportunity;
  totalPotentialAnnualSavings: number;
  systemCostYear1: number;
  roiPercentage: number;
  paybackMonths: number;
}

// Dashboard Types
export interface DashboardKPIs {
  totalBuses: number;
  activeBuses: number;
  totalOperationsLast30Days: number;
  totalPassengersLast30Days: number;
  totalRevenueLast30Days: number;
  totalFuelCostLast30Days: number;
  netProfitLast30Days: number;
  averageFuelEfficiencyMPG: number;
  onTimePercentage: number;
  totalDistanceMiles: number;
  busesRequiringMaintenance: number;
}

export interface FleetStatus {
  timestamp: string;
  totalBuses: number;
  activeBuses: number;
  inMaintenance: number;
  outOfService: number;
  retired: number;
  operationsToday: number;
  passengersToday: number;
  delaysToday: number;
  averageDelayMinutes: number;
}

export interface FuelEfficiencyTrend {
  date: string;
  averageMPG: number;
  totalDistance: number;
  totalFuelConsumed: number;
  operationCount: number;
}

export interface RidershipTrend {
  date: string;
  totalPassengers: number;
  totalOperations: number;
  averagePassengersPerTrip: number;
  revenue: number;
}

export interface CostAnalysis {
  period: string;
  totalRevenue: number;
  totalFuelCost: number;
  totalMaintenanceCost: number;
  totalOperatingCost: number;
  netProfit: number;
  profitMargin: number;
  fuelCostPerMile: number;
  costPerPassenger: number;
}

export interface BusPerformance {
  busId: number;
  busNumber: string;
  totalOperations: number;
  totalPassengers: number;
  totalDistance: number;
  averageFuelEfficiency: number;
  totalRevenue: number;
  totalFuelCost: number;
  averageDelayMinutes: number;
  onTimePercentage: number;
}

// Bus Management Types
export interface Bus {
  busId: number;
  busNumber: string;
  model: string;
  year: number;
  capacity: number;
  fuelTankCapacity: number;
  status: string;
  purchaseDate: string;
  purchasePrice: number;
  purchaseCurrency: string;
  currentMileage: number;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  daysUntilMaintenance: number;
  requiresMaintenance: boolean;
}

export interface BusStatistics {
  totalBuses: number;
  activeBuses: number;
  inMaintenance: number;
  retired: number;
  requiresMaintenance: number;
}
