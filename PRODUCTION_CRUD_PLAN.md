# Production CRUD Operations Plan

## Overview
This document outlines the API endpoints needed for production data management beyond the development seeding functionality.

## Current Status

### ✅ Completed
- **BusController**: Full CRUD operations available
- **Mock Data Seeding**: For development/testing only
- **Read-Only Analytics**: Business insights and metrics
- **Monitoring**: Real-time metrics via Prometheus

### ❌ Missing for Production
- **DriverController**: Create, update, delete drivers
- **RouteController**: Manage routes
- **DailyOperationController**: Record daily operations
- **MaintenanceRecordController**: Track maintenance history

---

## Required API Endpoints for Production

### 1. Driver Management API

**DriverController** - Manage bus drivers

```
GET    /api/drivers                    - List all drivers (with pagination)
GET    /api/drivers/{id}               - Get driver by ID
POST   /api/drivers                    - Create new driver
PUT    /api/drivers/{id}               - Update driver details
DELETE /api/drivers/{id}               - Deactivate driver
GET    /api/drivers/{id}/shifts        - Get driver shift history
POST   /api/drivers/{id}/shifts        - Record new shift
GET    /api/drivers/{id}/performance   - Get performance metrics
PUT    /api/drivers/{id}/status        - Update driver status (active/inactive/on-leave)
```

**Request/Response Examples:**

```json
POST /api/drivers
{
  "driverNumber": "DRV-016",
  "firstName": "Brandon",
  "lastName": "Parker",
  "licenseNumber": "CDL-567890",
  "hireDate": "2025-01-08T00:00:00Z"
}

Response: 201 Created
{
  "driverId": "550e8400-e29b-41d4-a716-446655440016",
  "driverNumber": "DRV-016",
  "firstName": "Brandon",
  "lastName": "Parker",
  "fullName": "Brandon Parker",
  "status": "Active",
  "currentFatigueLevel": 100.0
}
```

---

### 2. Route Management API

**RouteController** - Manage bus routes

```
GET    /api/routes                    - List all routes
GET    /api/routes/{id}               - Get route by ID
POST   /api/routes                    - Create new route
PUT    /api/routes/{id}               - Update route details
DELETE /api/routes/{id}               - Deactivate route
GET    /api/routes/{id}/operations    - Get operations for this route
GET    /api/routes/active             - Get only active routes
PUT    /api/routes/{id}/activate      - Activate route
PUT    /api/routes/{id}/deactivate    - Deactivate route
```

**Request Example:**

```json
POST /api/routes
{
  "routeNumber": "R-111",
  "routeName": "East Side Express",
  "distance": 16.8,
  "estimatedDuration": 55,
  "numberOfStops": 16,
  "startLocation": "Central Station",
  "endLocation": "East Terminal",
  "estimatedFuelCost": {
    "amount": 8.76,
    "currency": "USD"
  }
}
```

---

### 3. Daily Operations API

**DailyOperationController** - Record and manage daily operations

```
GET    /api/operations                       - List operations (with filters)
GET    /api/operations/{id}                  - Get operation by ID
POST   /api/operations                       - Record new operation
PUT    /api/operations/{id}                  - Update operation
DELETE /api/operations/{id}                  - Delete operation
GET    /api/operations/bus/{busId}           - Get operations by bus
GET    /api/operations/route/{routeId}       - Get operations by route
GET    /api/operations/driver/{driverName}   - Get operations by driver
GET    /api/operations/date/{date}           - Get operations by date
```

**Request Example:**

```json
POST /api/operations
{
  "busId": "550e8400-e29b-41d4-a716-446655440001",
  "routeId": "550e8400-e29b-41d4-a716-446655440101",
  "operationDate": "2026-01-08",
  "departureTime": "08:30:00",
  "arrivalTime": "09:15:00",
  "passengerCount": 42,
  "fuelConsumed": 12.5,
  "distanceTraveled": 16.8,
  "delayMinutes": 5,
  "driverName": "James Thompson",
  "revenue": {
    "amount": 105.00,
    "currency": "USD"
  },
  "fuelCost": {
    "amount": 39.00,
    "currency": "USD"
  },
  "notes": "Heavy traffic on Main Street"
}
```

---

### 4. Maintenance Records API

**MaintenanceController** - Track maintenance history

```
GET    /api/maintenance                  - List all maintenance records
GET    /api/maintenance/{id}             - Get maintenance record by ID
POST   /api/maintenance                  - Create maintenance record
PUT    /api/maintenance/{id}             - Update maintenance record
GET    /api/maintenance/bus/{busId}      - Get maintenance history for bus
GET    /api/maintenance/overdue          - Get buses with overdue maintenance
GET    /api/maintenance/upcoming         - Get upcoming maintenance
POST   /api/maintenance/{id}/complete    - Mark maintenance as completed
```

---

## Implementation Strategy

### Phase 1: Driver Management (PRIORITY)
Since driver monitoring is critical for your Friday presentation:

1. Create `DriverController.cs`
2. Implement basic CRUD operations
3. Add validation for driver license numbers (CDL format)
4. Add endpoints for shift recording
5. Update Swagger documentation

### Phase 2: Route Management
1. Create `RouteController.cs`
2. Implement CRUD operations
3. Add route activation/deactivation
4. Link to operations data

### Phase 3: Operations Management
1. Create `DailyOperationController.cs`
2. Implement operation recording
3. Add filtering and search capabilities
4. Link to bus, route, and driver data

### Phase 4: Maintenance Management
1. Create `MaintenanceController.cs`
2. Implement maintenance tracking
3. Add overdue/upcoming alerts
4. Integrate with bus health monitoring

---

## Data Validation & Business Rules

### Driver Validation
- ✅ CDL license number format validation
- ✅ Unique driver number enforcement
- ✅ Unique license number enforcement
- ✅ Minimum age requirement (21+ for CDL)
- ✅ Fatigue level calculations (DOT compliance)
- ✅ Mandatory rest enforcement

### Route Validation
- ✅ Unique route number
- ✅ Positive distance and duration
- ✅ At least 2 stops required
- ✅ Valid start/end locations

### Operation Validation
- ✅ Valid bus, route, and driver references
- ✅ Arrival time after departure time
- ✅ Passenger count not exceeding bus capacity
- ✅ Reasonable fuel consumption based on distance
- ✅ Date not in the future

---

## Security Considerations

### Authentication & Authorization (TODO)
Currently, the API has no authentication. For production, implement:

1. **JWT Authentication**
   - Login endpoint: `POST /api/auth/login`
   - Token refresh: `POST /api/auth/refresh`
   - User roles: Admin, Dispatcher, Driver, Viewer

2. **Role-Based Access Control**
   - Admin: Full CRUD access
   - Dispatcher: Create/update operations and routes
   - Driver: View own shifts, update own status
   - Viewer: Read-only access to analytics

3. **API Rate Limiting**
   - Prevent abuse
   - Throttle expensive queries

---

## Database Transaction Handling

### Unit of Work Pattern
Already implemented! The `IUnitOfWork` pattern is in place:

```csharp
// Example from BusController
[HttpPost]
public async Task<IActionResult> CreateBus([FromBody] CreateBusRequest request)
{
    var bus = Bus.Create(...);

    await _unitOfWork.Buses.AddAsync(bus.Value);
    await _unitOfWork.SaveChangesAsync(); // Transactional save

    return CreatedAtAction(nameof(GetBus), new { id = bus.Value.BusId }, bus.Value);
}
```

This ensures:
- ✅ ACID compliance
- ✅ Rollback on errors
- ✅ Consistent state

---

## API Documentation

### Swagger/OpenAPI
Already configured! Access at: `http://localhost:5001`

Features:
- ✅ Interactive API testing
- ✅ Request/response examples
- ✅ Schema validation
- ✅ Authentication testing (when implemented)

---

## Testing Strategy

### 1. Unit Tests
Test business logic in aggregates:
```csharp
[Fact]
public void Driver_AddShift_CalculatesFatigueCorrectly()
{
    // Arrange
    var driver = new Driver(...);

    // Act
    driver.AddShift(DateTime.UtcNow, 10.5, 5, 45.0);
    driver.UpdateFatigueLevel();

    // Assert
    Assert.True(driver.CurrentFatigueLevel < 100);
}
```

### 2. Integration Tests
Test API endpoints with real database:
```csharp
[Fact]
public async Task CreateDriver_ValidData_ReturnsCreated()
{
    // Arrange
    var client = _factory.CreateClient();
    var request = new CreateDriverRequest { ... };

    // Act
    var response = await client.PostAsJsonAsync("/api/drivers", request);

    // Assert
    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
}
```

### 3. Load Testing
Use tools like:
- **k6** - Load testing
- **Artillery** - Performance testing
- **JMeter** - Stress testing

---

## Migration from Seeding to Real Data

### For Development
Keep the seeding endpoint for testing:
```
POST /api/seed/reset  - Clear and reseed database (DEV only)
```

### For Production
1. **Disable seeding** in production environment
2. **Data migration scripts** for initial data import
3. **CSV/Excel import** endpoints for bulk data
4. **Manual entry** via frontend or API

---

## Next Steps (Tomorrow Morning)

### Priority 1: Create DriverController
```csharp
[ApiController]
[Route("api/[controller]")]
public class DriverController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public DriverController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public async Task<IActionResult> GetDrivers()
    {
        var drivers = await _unitOfWork.Drivers.GetAllAsync();
        return Ok(drivers);
    }

    [HttpPost]
    public async Task<IActionResult> CreateDriver([FromBody] CreateDriverRequest request)
    {
        // Implementation
    }

    // ... more endpoints
}
```

### Priority 2: Frontend Integration
Update React frontend to:
- Display driver list
- Add/Edit driver forms
- Record shift data
- Show real-time fatigue alerts

---

## Summary

**Current State:**
- ✅ Database schema complete (via EF migrations)
- ✅ Domain models with business logic (DDD)
- ✅ Unit of Work pattern for transactions
- ✅ Mock data seeding for development
- ✅ Monitoring and analytics (read-only)

**What's Needed for Production:**
- ❌ DriverController (CRUD)
- ❌ RouteController (CRUD)
- ❌ DailyOperationController (CRUD)
- ❌ MaintenanceController (CRUD)
- ❌ Authentication & Authorization
- ❌ Data import/export capabilities
- ❌ Frontend forms for data entry

**Recommendation:**
Start with DriverController tomorrow morning since driver monitoring is critical for your presentation. The infrastructure (database, domain models, unit of work) is already in place - you just need to expose the CRUD operations via REST API endpoints.
