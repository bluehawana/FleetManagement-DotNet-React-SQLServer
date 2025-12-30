# API Design for Real-World Bus Fleet Management
## RESTful Endpoints That Actually Matter to Bus Companies

---

## 🎯 API Design Philosophy

**Every endpoint solves a real business problem**

Not just CRUD operations - each API call helps managers:
- Save money
- Prevent problems
- Make decisions
- Improve operations

---

## 📊 Core API Modules

### 1. Real-Time Fleet Monitoring
### 2. Fuel Management & Optimization
### 3. Driver Performance & Safety
### 4. Route Optimization
### 5. Predictive Maintenance
### 6. Passenger Analytics
### 7. Business Intelligence & Reports

---

## 1️⃣ Real-Time Fleet Monitoring API

### GET /api/fleet/status/realtime
**Purpose**: Show manager where every bus is RIGHT NOW

**Response**:
```json
{
  "timestamp": "2024-12-30T08:45:23Z",
  "totalBuses": 24,
  "operational": 18,
  "maintenance": 4,
  "breakdown": 0,
  "delayed": 2,
  "buses": [
    {
      "busId": 12,
      "busNumber": "BUS-012",
      "status": "operational",
      "currentLocation": {
        "lat": 40.7128,
        "lng": -74.0060,
        "address": "Main St & 5th Ave"
      },
      "routeId": 3,
      "routeName": "Downtown Loop",
      "currentOccupancy": 42,
      "capacity": 50,
      "occupancyPercent": 84,
      "nextStop": "City Hall",
      "eta": "2 minutes",
      "onTimeStatus": "on-time",
      "driverId": 15,
      "driverName": "John Smith",
      "currentSpeed": 35,
      "fuelLevel": 75,
      "alerts": []
    },
    {
      "busId": 8,
      "busNumber": "BUS-008",
      "status": "delayed",
      "delayMinutes": 12,
      "delayReason": "Heavy traffic on Main St",
      "alerts": [
        {
          "type": "maintenance",
          "severity": "high",
          "message": "Brake pads at 15% - service needed in 3 days"
        }
      ]
    }
  ]
}
```

**Business Value**: Manager sees problems instantly, can dispatch help

---

### POST /api/fleet/telemetry/bulk
**Purpose**: Receive real-time data from bus sensors (called every 30 seconds)

**Request** (from bus telematics system):
```json
{
  "busId": 12,
  "timestamp": "2024-12-30T08:45:23Z",
  "location": {
    "lat": 40.7128,
    "lng": -74.0060,
    "speed": 35,
    "heading": 180
  },
  "engine": {
    "rpm": 1850,
    "temperature": 92,
    "oilPressure": 45,
    "fuelLevel": 75,
    "instantFuelConsumption": 6.5
  },
  "performance": {
    "odometer": 125450,
    "tripDistance": 12.5,
    "tripFuelConsumed": 0.85,
    "idleTime": 120,
    "harshBrakingCount": 2,
    "harshAccelerationCount": 1,
    "topSpeed": 65
  },
  "passengers": {
    "currentCount": 42,
    "boardedThisStop": 8,
    "alightedThisStop": 3
  },
  "diagnostics": {
    "brakeWear": 15,
    "tirePress ure": [32, 32, 31, 32],
    "batteryVoltage": 13.8,
    "errorCodes": []
  }
}
```

**What System Does**:
1. Stores data in database
2. Checks for anomalies (harsh braking, low fuel, etc.)
3. Triggers alerts if needed
4. Updates real-time dashboard

---

## 2️⃣ Fuel Management API

### GET /api/fuel/efficiency/analysis
**Purpose**: Show which buses/drivers are wasting fuel

**Query Parameters**:
- `startDate`: 2024-12-01
- `endDate`: 2024-12-30
- `groupBy`: bus | driver | route

**Response**:
```json
{
  "period": "2024-12-01 to 2024-12-30",
  "fleetAverage": 6.8,
  "targetEfficiency": 6.5,
  "totalFuelCost": 28450,
  "targetFuelCost": 25000,
  "overBudget": 3450,
  "topPerformers": [
    {
      "busId": 15,
      "busNumber": "BUS-015",
      "efficiency": 6.2,
      "fuelCost": 980,
      "savingsVsAverage": 120,
      "driverName": "Sarah Johnson"
    }
  ],
  "worstPerformers": [
    {
      "busId": 12,
      "busNumber": "BUS-012",
      "efficiency": 8.5,
      "fuelCost": 1450,
      "excessCost": 450,
      "driverName": "John Smith",
      "issues": [
        "30% more harsh braking than average",
        "45 min/day excessive idling",
        "12 speeding events"
      ],
      "recommendations": [
        "Send driver to eco-driving training",
        "Review route schedule to reduce idle time",
        "Set speed limit alerts"
      ]
    }
  ],
  "potentialSavings": 3450,
  "savingsBreakdown": {
    "driverTraining": 2100,
    "routeOptimization": 850,
    "maintenanceImprovements": 500
  }
}
```

**Business Value**: Manager knows EXACTLY who to train and how much to save

---

### GET /api/fuel/predictions/monthly
**Purpose**: Predict next month's fuel costs based on trends

**Response**:
```json
{
  "currentMonth": {
    "actual": 28450,
    "target": 25000
  },
  "nextMonth": {
    "predicted": 26800,
    "confidence": 0.87,
    "factors": [
      {
        "factor": "Diesel price trend",
        "impact": "+5%",
        "description": "Prices rising $0.15/gallon"
      },
      {
        "factor": "Driver improvements",
        "impact": "-8%",
        "description": "3 drivers completed eco-training"
      },
      {
        "factor": "Route optimization",
        "impact": "-3%",
        "description": "Route 7 schedule adjusted"
      }
    ]
  },
  "recommendations": [
    "Lock in fuel prices now (predicted +5% increase)",
    "Complete driver training for remaining 2 drivers",
    "Implement Route 3 alternative path"
  ]
}
```

**Business Value**: Manager can budget accurately and take preventive action

---

## 3️⃣ Driver Performance API

### GET /api/drivers/performance/ranking
**Purpose**: Show which drivers are costing money

**Response**:
```json
{
  "period": "2024-12-01 to 2024-12-30",
  "totalDrivers": 28,
  "rankings": [
    {
      "rank": 1,
      "driverId": 15,
      "driverName": "Sarah Johnson",
      "overallScore": 95,
      "safetyScore": 98,
      "ecoScore": 92,
      "fuelEfficiency": 6.2,
      "onTimePercentage": 96,
      "passengerComplaints": 0,
      "harshBrakingCount": 5,
      "speedingEvents": 0,
      "monthlyBonus": 200,
      "costToCompany": 980
    },
    {
      "rank": 28,
      "driverId": 8,
      "driverName": "John Smith",
      "overallScore": 62,
      "safetyScore": 65,
      "ecoScore": 58,
      "fuelEfficiency": 8.5,
      "onTimePercentage": 78,
      "passengerComplaints": 2,
      "harshBrakingCount": 45,
      "speedingEvents": 12,
      "monthlyBonus": 0,
      "costToCompany": 1450,
      "excessCost": 450,
      "issues": [
        "30% more fuel consumption than average",
        "45 harsh braking events (fleet avg: 15)",
        "12 speeding events",
        "2 passenger complaints"
      ],
      "requiredActions": [
        "Mandatory eco-driving training",
        "Safety review meeting",
        "Probation period (30 days)"
      ]
    }
  ],
  "fleetStats": {
    "averageScore": 82,
    "averageFuelEfficiency": 6.8,
    "totalExcessCost": 8500,
    "potentialSavings": "If all drivers matched top 10: $102,000/year"
  }
}
```

**Business Value**: Clear data for performance reviews and training decisions

---

### POST /api/drivers/{driverId}/training/assign
**Purpose**: Assign driver to training program

**Request**:
```json
{
  "driverId": 8,
  "trainingType": "eco-driving",
  "reason": "Fuel efficiency 37% below fleet average",
  "mandatory": true,
  "deadline": "2025-01-15"
}
```

**Response**:
```json
{
  "success": true,
  "trainingAssigned": {
    "driverId": 8,
    "driverName": "John Smith",
    "trainingType": "Eco-Driving Certification",
    "scheduledDate": "2025-01-10",
    "duration": "4 hours",
    "cost": 150,
    "expectedSavings": "450/month after training",
    "roi": "Payback in 10 days"
  },
  "notificationSent": true
}
```

---

## 4️⃣ Route Optimization API

### GET /api/routes/efficiency/analysis
**Purpose**: Show which routes are profitable and which are wasting money

**Response**:
```json
{
  "routes": [
    {
      "routeId": 3,
      "routeName": "Downtown Loop",
      "profitability": "high",
      "metrics": {
        "averageOccupancy": 78,
        "revenuePerKm": 4.50,
        "costPerKm": 2.20,
        "profitMargin": 51,
        "onTimePerformance": 92
      },
      "timeSlots": [
        {
          "period": "6:00-9:00 AM",
          "occupancy": 85,
          "status": "optimal",
          "recommendation": "Maintain current frequency"
        },
        {
          "period": "9:00-3:00 PM",
          "occupancy": 35,
          "status": "underutilized",
          "recommendation": "Reduce frequency from 4 to 2 buses",
          "potentialSavings": 850
        },
        {
          "period": "3:00-7:00 PM",
          "occupancy": 78,
          "status": "optimal",
          "recommendation": "Maintain current frequency"
        }
      ],
      "totalPotentialSavings": 850
    },
    {
      "routeId": 7,
      "routeName": "Suburban Express",
      "profitability": "low",
      "metrics": {
        "averageOccupancy": 42,
        "revenuePerKm": 2.80,
        "costPerKm": 2.50,
        "profitMargin": 12,
        "onTimePerformance": 85
      },
      "issues": [
        "Low ridership during midday (18% occupancy)",
        "High fuel consumption due to traffic",
        "Frequent delays on Main Street"
      ],
      "recommendations": [
        {
          "action": "Cancel 11 AM and 1 PM runs",
          "impact": "Save $1,200/month",
          "reason": "Only 12 passengers average"
        },
        {
          "action": "Use alternative route via Highway 5",
          "impact": "Save $170/month fuel, reduce delays",
          "reason": "Avoid Main Street traffic"
        }
      ],
      "totalPotentialSavings": 1370
    }
  ],
  "fleetTotalSavings": 4550
}
```

**Business Value**: Manager knows exactly which routes to adjust

---

### POST /api/routes/optimize
**Purpose**: Get AI-powered route optimization recommendations

**Request**:
```json
{
  "routeId": 7,
  "optimizationGoals": ["reduce-fuel", "improve-ontime", "increase-ridership"],
  "constraints": {
    "mustServeStops": [1, 5, 12],
    "maxDuration": 45,
    "peakHours": ["7:00-9:00", "17:00-19:00"]
  }
}
```

**Response**:
```json
{
  "currentRoute": {
    "distance": 12.5,
    "duration": 45,
    "fuelCost": 8.50,
    "averageOccupancy": 42
  },
  "optimizedRoute": {
    "distance": 13.2,
    "duration": 42,
    "fuelCost": 7.80,
    "estimatedOccupancy": 48,
    "changes": [
      "Use Highway 5 instead of Main Street",
      "Skip stop #8 (only 2 passengers/day)",
      "Add stop at Shopping Mall (estimated +15 passengers)"
    ]
  },
  "savings": {
    "fuelPerTrip": 0.70,
    "timePerTrip": 3,
    "dailySavings": 5.60,
    "annualSavings": 2044,
    "additionalRevenue": 1200
  },
  "implementation": {
    "difficulty": "easy",
    "requiredChanges": ["Update GPS routes", "Notify passengers", "Update schedules"],
    "estimatedImplementationTime": "2 days"
  }
}
```

---

## 5️⃣ Predictive Maintenance API

### GET /api/maintenance/predictions
**Purpose**: Predict which buses need maintenance BEFORE they break down

**Response**:
```json
{
  "urgent": [
    {
      "busId": 8,
      "busNumber": "BUS-008",
      "component": "Brake pads",
      "currentCondition": 15,
      "predictedFailureDate": "2025-01-03",
      "daysUntilFailure": 3,
      "confidence": 0.92,
      "recommendedAction": "Schedule maintenance immediately",
      "costIfPlanned": 800,
      "costIfBreakdown": 3500,
      "potentialSavings": 2700
    }
  ],
  "upcoming": [
    {
      "busId": 12,
      "component": "Oil change",
      "daysUntilDue": 12,
      "cost": 150
    },
    {
      "busId": 15,
      "component": "Tire rotation",
      "daysUntilDue": 18,
      "cost": 200
    }
  ],
  "summary": {
    "totalUpcomingCost": 1150,
    "preventedBreakdowns": 1,
    "totalSavings": 2700,
    "maintenanceEfficiency": 92
  }
}
```

**Business Value**: Prevent expensive breakdowns, plan maintenance budget

---

### POST /api/maintenance/schedule
**Purpose**: Schedule maintenance based on predictions

**Request**:
```json
{
  "busId": 8,
  "maintenanceType": "brake-service",
  "scheduledDate": "2025-01-02",
  "scheduledTime": "06:00",
  "estimatedDuration": 4,
  "assignedMechanic": "Mike Johnson",
  "notes": "Urgent - brake pads at 15%"
}
```

**Response**:
```json
{
  "success": true,
  "maintenanceScheduled": {
    "confirmationNumber": "MAINT-2025-001",
    "busId": 8,
    "scheduledDate": "2025-01-02T06:00:00Z",
    "estimatedCompletion": "2025-01-02T10:00:00Z",
    "partsOrdered": true,
    "replacementBusAssigned": "BUS-022",
    "routesCovered": ["Route 5", "Route 7"],
    "estimatedCost": 800,
    "preventedBreakdownCost": 3500,
    "netSavings": 2700
  }
}
```

---

## 6️⃣ Passenger Analytics API

### GET /api/passengers/patterns/analysis
**Purpose**: Understand when and where passengers travel

**Response**:
```json
{
  "period": "Last 30 days",
  "totalPassengers": 125450,
  "averagePerDay": 4182,
  "peakHours": [
    {
      "time": "7:30-8:30 AM",
      "averagePassengers": 850,
      "topRoutes": [
        {"routeId": 1, "passengers": 320},
        {"routeId": 3, "passengers": 280}
      ]
    },
    {
      "time": "5:00-6:00 PM",
      "averagePassengers": 780,
      "topRoutes": [
        {"routeId": 5, "passengers": 290},
        {"routeId": 1, "passengers": 250}
      ]
    }
  ],
  "lowDemandPeriods": [
    {
      "time": "10:00 AM - 2:00 PM",
      "averagePassengers": 180,
      "recommendation": "Reduce frequency on Routes 1, 5, 7",
      "potentialSavings": 2400
    }
  ],
  "recommendations": [
    {
      "action": "Add bus to Route 1 at 8:00 AM",
      "reason": "Overcrowding (95% capacity)",
      "estimatedAdditionalRevenue": 2500
    },
    {
      "action": "Remove Route 7 midday runs",
      "reason": "Only 12 passengers average",
      "estimatedSavings": 1200
    }
  ]
}
```

---

## 7️⃣ Business Intelligence API

### GET /api/analytics/dashboard/kpis
**Purpose**: Show all key metrics manager needs to see

**Response**:
```json
{
  "date": "2024-12-30",
  "realTime": {
    "operationalBuses": 18,
    "delayedBuses": 2,
    "maintenanceBuses": 4,
    "breakdownBuses": 0,
    "currentPassengers": 420,
    "todayRevenue": 8450,
    "todayFuelCost": 1245
  },
  "thisMonth": {
    "revenue": 125450,
    "revenueChange": 5.2,
    "fuelCost": 28200,
    "fuelCostChange": -12.3,
    "maintenanceCost": 4500,
    "maintenanceCostChange": -30.1,
    "profitMargin": 42,
    "profitMarginChange": 8.5,
    "totalPassengers": 125450,
    "passengerChange": 3.8,
    "onTimePerformance": 92,
    "onTimeChange": 4.2
  },
  "alerts": [
    {
      "severity": "high",
      "type": "maintenance",
      "message": "Bus #08: Brake maintenance due in 3 days",
      "action": "Schedule immediately"
    },
    {
      "severity": "medium",
      "type": "performance",
      "message": "Driver John: 3rd speeding event this week",
      "action": "Review and counsel"
    }
  ],
  "aiRecommendations": [
    {
      "priority": 1,
      "action": "Reduce Route 7 midday frequency",
      "impact": "$1,800/month savings",
      "effort": "Low",
      "roi": "Immediate"
    },
    {
      "priority": 2,
      "action": "Send 3 drivers to eco-training",
      "impact": "$2,100/month savings",
      "effort": "Medium",
      "roi": "2 weeks"
    }
  ],
  "potentialMonthlySavings": 7570
}
```

**Business Value**: Everything manager needs in one API call

---

## 🔄 CRUD Operations (Supporting the Business Logic)

### Buses
```
POST   /api/buses                    # Add new bus to fleet
GET    /api/buses                    # List all buses
GET    /api/buses/{id}               # Get bus details
PUT    /api/buses/{id}               # Update bus info
DELETE /api/buses/{id}               # Retire bus
GET    /api/buses/{id}/history       # Full maintenance/trip history
```

### Drivers
```
POST   /api/drivers                  # Hire new driver
GET    /api/drivers                  # List all drivers
GET    /api/drivers/{id}             # Get driver details
PUT    /api/drivers/{id}             # Update driver info
GET    /api/drivers/{id}/performance # Performance history
POST   /api/drivers/{id}/training    # Assign training
```

### Routes
```
POST   /api/routes                   # Create new route
GET    /api/routes                   # List all routes
GET    /api/routes/{id}              # Get route details
PUT    /api/routes/{id}              # Update route
DELETE /api/routes/{id}              # Discontinue route
GET    /api/routes/{id}/performance  # Route performance data
```

### Trips
```
POST   /api/trips                    # Record completed trip
GET    /api/trips                    # List trips (with filters)
GET    /api/trips/{id}               # Get trip details
PUT    /api/trips/{id}               # Update trip info
GET    /api/trips/active             # Currently running trips
```

### Maintenance
```
POST   /api/maintenance              # Schedule maintenance
GET    /api/maintenance              # List maintenance records
GET    /api/maintenance/{id}         # Get maintenance details
PUT    /api/maintenance/{id}         # Update maintenance record
GET    /api/maintenance/upcoming     # Upcoming maintenance
GET    /api/maintenance/overdue      # Overdue maintenance
```

---

## 🎯 API Usage Example: Morning Manager Routine

```javascript
// 1. Check fleet status
const status = await fetch('/api/fleet/status/realtime');
// See: 18 buses operational, 2 delayed, 4 in maintenance

// 2. Check today's costs
const costs = await fetch('/api/analytics/dashboard/kpis');
// See: Fuel $1,245 (under budget ✅)

// 3. Check urgent alerts
const alerts = await fetch('/api/maintenance/predictions?urgent=true');
// See: Bus #08 needs brake service in 3 days

// 4. Schedule maintenance
await fetch('/api/maintenance/schedule', {
  method: 'POST',
  body: JSON.stringify({
    busId: 8,
    scheduledDate: '2025-01-02',
    maintenanceType: 'brake-service'
  })
});
// Done: Maintenance scheduled, replacement bus assigned

// 5. Check driver performance
const drivers = await fetch('/api/drivers/performance/ranking');
// See: John needs training (costing $450/month extra)

// 6. Assign training
await fetch('/api/drivers/8/training/assign', {
  method: 'POST',
  body: JSON.stringify({
    trainingType: 'eco-driving',
    mandatory: true
  })
});
// Done: Training scheduled, notification sent

// Total time: 5 minutes
// Actions taken: 2 (maintenance + training)
// Potential savings: $3,150/month
```

---

**This is how the API actually helps managers run a profitable bus company!** 🚀

Every endpoint solves a real problem. Every response includes actionable insights. Every action saves money or prevents problems.