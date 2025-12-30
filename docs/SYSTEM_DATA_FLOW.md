# System Data Flow
## From Bus Sensors to Business Decisions

```
🚌 BUS SENSORS (Every 30 seconds)
   ├─ GPS: Location, Speed, Route
   ├─ Fuel: Consumption, Tank level
   ├─ Passengers: Count, Boarding
   ├─ Driver: Braking, Speed, Idle
   ├─ Engine: Temp, RPM, Diagnostics
   └─ Maintenance: Brake, Tire, Battery
   
   ↓ IoT Gateway
   
📡 .NET 8 API
   POST /api/telemetry/bulk
   ├─ Validate data
   ├─ Store in SQL
   ├─ Trigger alerts
   └─ Update Prometheus
   
   ↓
   
🗄️ SQL SERVER
   ├─ RealTimeTelemetry (24h hot data)
   ├─ DailyOperations (trips)
   ├─ FuelConsumption (analysis)
   ├─ DriverBehavior (performance)
   ├─ PassengerData (ridership)
   ├─ VehicleHealth (maintenance)
   └─ Alerts (notifications)
   
   ↓ Hourly
   
🐍 PYTHON ANALYSIS
   ├─ Fuel efficiency patterns
   ├─ Driver behavior issues
   ├─ Route inefficiencies
   ├─ Maintenance predictions (ML)
   ├─ Cost savings opportunities
   └─ Daily recommendations
   
   ↓
   
📊 BUSINESS INSIGHTS
   ├─ DailyRecommendations
   ├─ CostSavingsOpportunities
   ├─ PerformanceAnomalies
   └─ PredictiveMaintenance
   
   ↓
   
┌──────────────┬──────────────┬──────────────┐
│  GRAFANA     │  REACT       │  MOBILE APP  │
│  (Ops)       │  (Mgmt)      │  (Drivers)   │
│  Real-time   │  Business    │  Personal    │
│  Monitoring  │  Intelligence│  Performance │
└──────────────┴──────────────┴──────────────┘
```

## 💰 Business Model

### Revenue Tracking
- Ticket sales per trip
- Revenue per km/passenger
- Route profitability

### Cost Tracking
- Fuel costs (real-time)
- Driver wages
- Maintenance costs
- Insurance, depreciation

### Profit Analysis
- Per route, per bus, per driver
- Identify losing routes
- Optimize profitable routes

## 📊 Monitoring Stack

### Prometheus Metrics
```
bus_fuel_consumption_rate
bus_passenger_count
driver_harsh_braking_count
fleet_buses_operational
route_occupancy_percent
```

### Grafana Dashboards
1. Fleet Status (real-time)
2. Fuel Efficiency
3. Passenger Load
4. Driver Performance
5. Maintenance Alerts

## 🤖 AI Recommendations

Python script runs nightly:
1. Analyze fuel efficiency
2. Predict maintenance needs
3. Identify route issues
4. Generate recommendations
5. Calculate ROI

Manager sees actionable insights every morning.
