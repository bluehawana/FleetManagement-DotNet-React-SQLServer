import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dashboard APIs
const dashboard = {
  kpis: () => apiClient.get('/dashboard/kpis'),
  fleetStatus: () => apiClient.get('/dashboard/fleet-status'),
  fuelEfficiencyTrends: (days: number = 30) =>
    apiClient.get(`/dashboard/fuel-efficiency-trends?days=${days}`),
  ridershipTrends: (days: number = 30) =>
    apiClient.get(`/dashboard/ridership-trends?days=${days}`),
  costAnalysis: (days: number = 30) =>
    apiClient.get(`/dashboard/cost-analysis?days=${days}`),
  busPerformance: (days: number = 30) =>
    apiClient.get(`/dashboard/bus-performance?days=${days}`),
};

// Business Insights APIs
const insights = {
  fuelWasters: (days: number = 30) =>
    apiClient.get(`/businessinsights/fuel-wasters?days=${days}`),
  emptyBuses: (days: number = 30) =>
    apiClient.get(`/businessinsights/empty-buses?days=${days}`),
  driverPerformance: (days: number = 30) =>
    apiClient.get(`/businessinsights/driver-performance?days=${days}`),
  maintenanceAlerts: () =>
    apiClient.get('/businessinsights/maintenance-alerts'),
  routeOptimization: (days: number = 30) =>
    apiClient.get(`/businessinsights/route-optimization?days=${days}`),
  roiSummary: (days: number = 30) =>
    apiClient.get(`/businessinsights/roi-summary?days=${days}`),
};

// Bus Management APIs
const bus = {
  getAll: () => apiClient.get('/bus'),
  getById: (id: number) => apiClient.get(`/bus/${id}`),
  getByStatus: (status: string) => apiClient.get(`/bus/status/${status}`),
  getMaintenanceRequired: () => apiClient.get('/bus/maintenance/required'),
  getStatistics: () => apiClient.get('/bus/statistics'),
  create: (data: any) => apiClient.post('/bus', data),
  updateMileage: (id: number, data: any) => apiClient.put(`/bus/${id}/mileage`, data),
  scheduleMaintenance: (id: number, data: any) =>
    apiClient.post(`/bus/${id}/maintenance/schedule`, data),
  completeMaintenance: (id: number, data: any) =>
    apiClient.post(`/bus/${id}/maintenance/complete`, data),
  retire: (id: number, reason: string) =>
    apiClient.post(`/bus/${id}/retire`, { reason }),
};

// Seed Data APIs
const seed = {
  mockData: () => apiClient.post('/seed/mock-data'),
};

// Metrics APIs
const metrics = {
  getAll: () => apiClient.get('/metrics'),
};

export const api = {
  dashboard,
  insights,
  bus,
  seed,
  metrics,
};

export default apiClient;
