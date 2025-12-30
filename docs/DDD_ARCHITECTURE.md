# Domain-Driven Design Architecture

## 🏗️ DDD Implementation Overview

This project follows **Domain-Driven Design (DDD)** principles with **Clean Architecture** to create a maintainable, testable, and business-focused codebase.

---

## 📐 Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│              (API Controllers, DTOs, Mappers)            │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                      │
│         (Use Cases, Commands, Queries, Handlers)         │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                     Domain Layer                         │
│  (Aggregates, Entities, Value Objects, Domain Services)  │
│              ← Core Business Logic Here ←                │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                 Infrastructure Layer                     │
│    (EF Core, Repositories, External Services, DB)        │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Core DDD Concepts Implemented

### 1. Aggregates & Aggregate Roots

**What**: Cluster of domain objects treated as a single unit for data changes.

**Implemented Aggregates**:
- **Bus Aggregate** (`Bus` as root)
  - Contains: MaintenanceRecords
  - Enforces: Business rules for maintenance, mileage, status changes
  
- **Route Aggregate** (`Route` as root)
  - Self-contained route information
  - Enforces: Distance, duration, location validations
  
- **DailyOperation Aggregate** (`DailyOperation` as root)
  - Represents a single bus trip
  - Enforces: Time, fuel, passenger validations

**Example**:
```csharp
// Bus is an Aggregate Root
public sealed class Bus : AggregateRoot
{
    // Only Bus can modify its maintenance records
    private readonly List<MaintenanceRecord> _maintenanceRecords = new();
    
    // Business logic encapsulated
    public Result CompleteMaintenance(...)
    {
        // Validation + state change + domain event
    }
}
```

### 2. Entities

**What**: Objects with unique identity that persists over time.

**Characteristics**:
- Has unique ID
- Mutable state
- Identity-based equality

**Example**:
```csharp
public sealed class MaintenanceRecord : Entity
{
    public int MaintenanceId { get; private set; } // Identity
    // State can change, but ID remains same
}
```

### 3. Value Objects

**What**: Immutable objects defined by their attributes, not identity.

**Implemented Value Objects**:
- `BusNumber` - Validated bus identification
- `Money` - Amount + Currency with operations
- `FuelEfficiency` - MPG with business rules

**Example**:
```csharp
public sealed class Money : ValueObject
{
    public decimal Amount { get; }
    public string Currency { get; }
    
    // Immutable - create new instance for changes
    public Money Add(Money other) => new Money(...);
    
    // Value-based equality
    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Amount;
        yield return Currency;
    }
}
```

**Benefits**:
- Type safety: `Money` instead of `decimal`
- Validation: Invalid values can't be created
- Business logic: `money1.Add(money2)` instead of `money1 + money2`

### 4. Domain Events

**What**: Something that happened in the domain that domain experts care about.

**Implemented Events**:
- `BusCreatedEvent`
- `MaintenanceRequiredEvent`
- `MaintenanceScheduledEvent`
- `MaintenanceCompletedEvent`
- `BusRetiredEvent`

**Example**:
```csharp
public sealed record BusCreatedEvent(
    int BusId,
    string BusNumber,
    string Model) : IDomainEvent
{
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}

// In Bus aggregate
public static Result<Bus> Create(...)
{
    var bus = new Bus { ... };
    bus.AddDomainEvent(new BusCreatedEvent(...));
    return Result.Success(bus);
}
```

**Use Cases**:
- Send notification when maintenance required
- Update analytics when bus created
- Trigger alerts when bus retired
- Audit trail of all domain changes

### 5. Domain Services

**What**: Business logic that doesn't naturally fit in an entity or value object.

**Implemented Services**:
- `FleetOptimizationService`
  - Calculate potential savings
  - Recommend bus for route
  - Identify inefficient buses

**Example**:
```csharp
public class FleetOptimizationService
{
    // Logic involving multiple aggregates
    public Result<Bus> RecommendBusForRoute(
        IEnumerable<Bus> availableBuses,
        Route route,
        int expectedPassengers)
    {
        // Complex business logic here
    }
}
```

### 6. Repository Pattern

**What**: Abstraction for data access, defined in Domain, implemented in Infrastructure.

**Interfaces** (in Core):
```csharp
public interface IBusRepository
{
    Task<Bus?> GetByIdAsync(int busId);
    Task<IEnumerable<Bus>> GetByStatusAsync(BusStatus status);
    Task AddAsync(Bus bus);
    // ... more methods
}
```

**Benefits**:
- Domain doesn't depend on database
- Easy to test with mocks
- Can swap implementations

### 7. Unit of Work Pattern

**What**: Maintains list of objects affected by transaction and coordinates writing changes.

```csharp
public interface IUnitOfWork
{
    IBusRepository Buses { get; }
    IRouteRepository Routes { get; }
    IOperationRepository Operations { get; }
    
    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
}
```

**Usage**:
```csharp
await _unitOfWork.BeginTransactionAsync();
try
{
    var bus = await _unitOfWork.Buses.GetByIdAsync(busId);
    bus.CompleteMaintenance(...);
    await _unitOfWork.SaveChangesAsync();
    await _unitOfWork.CommitTransactionAsync();
}
catch
{
    await _unitOfWork.RollbackTransactionAsync();
}
```

### 8. Result Pattern

**What**: Explicit success/failure handling without exceptions.

```csharp
public class Result
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public string Error { get; }
    
    public static Result Success() => new(true, string.Empty);
    public static Result Failure(string error) => new(false, error);
}

// Usage
var result = Bus.Create(...);
if (result.IsFailure)
{
    return BadRequest(result.Error);
}
var bus = result.Value;
```

**Benefits**:
- No exceptions for business rule violations
- Explicit error handling
- Better performance
- Clearer code flow

---

## 🏛️ Project Structure

```
FleetManagement.Core/                    ← Domain Layer (No dependencies)
├── Common/
│   ├── Entity.cs                        ← Base entity class
│   ├── AggregateRoot.cs                 ← Base aggregate root
│   ├── ValueObject.cs                   ← Base value object
│   ├── Result.cs                        ← Result pattern
│   └── IDomainEvent.cs                  ← Domain event interface
├── Aggregates/
│   ├── BusAggregate/
│   │   ├── Bus.cs                       ← Aggregate root
│   │   ├── BusStatus.cs                 ← Enum
│   │   ├── MaintenanceRecord.cs         ← Entity
│   │   └── Events/
│   │       ├── BusCreatedEvent.cs
│   │       └── MaintenanceRequiredEvent.cs
│   ├── RouteAggregate/
│   │   └── Route.cs
│   └── OperationAggregate/
│       └── DailyOperation.cs
├── ValueObjects/
│   ├── BusNumber.cs
│   ├── Money.cs
│   └── FuelEfficiency.cs
├── DomainServices/
│   └── FleetOptimizationService.cs
└── Interfaces/
    ├── IBusRepository.cs
    ├── IRouteRepository.cs
    ├── IOperationRepository.cs
    └── IUnitOfWork.cs

FleetManagement.Infrastructure/          ← Infrastructure Layer
├── Data/
│   ├── FleetDbContext.cs                ← EF Core DbContext
│   └── Configurations/                  ← EF Core configurations
├── Repositories/
│   ├── BusRepository.cs                 ← Repository implementations
│   ├── RouteRepository.cs
│   └── OperationRepository.cs
└── UnitOfWork.cs

FleetManagement.API/                     ← Presentation Layer
├── Controllers/
│   ├── BusController.cs
│   ├── RouteController.cs
│   └── OperationController.cs
├── DTOs/                                ← Data Transfer Objects
└── Mappers/                             ← Domain ↔ DTO mapping
```

---

## 💼 Business Rules Examples

### Bus Aggregate Rules

1. **Bus number must be unique and valid format**
   ```csharp
   var busNumberResult = BusNumber.Create("BUS-001");
   if (busNumberResult.IsFailure) return Error;
   ```

2. **Cannot schedule maintenance for retired bus**
   ```csharp
   public Result ScheduleMaintenance(...)
   {
       if (Status == BusStatus.Retired)
           return Result.Failure("Cannot schedule maintenance for retired bus");
   }
   ```

3. **Mileage can only increase**
   ```csharp
   public Result UpdateMileage(int newMileage)
   {
       if (newMileage < CurrentMileage)
           return Result.Failure("New mileage cannot be less than current");
   }
   ```

4. **Maintenance triggers domain event**
   ```csharp
   if (CurrentMileage - oldMileage > 5000)
   {
       AddDomainEvent(new MaintenanceRequiredEvent(...));
   }
   ```

### Route Aggregate Rules

1. **Distance must be reasonable**
   ```csharp
   if (distance <= 0 || distance > 500)
       return Result.Failure("Distance must be between 0 and 500 miles");
   ```

2. **Must have at least 2 stops**
   ```csharp
   if (numberOfStops < 2)
       return Result.Failure("Route must have at least 2 stops");
   ```

### Operation Aggregate Rules

1. **Arrival must be after departure**
   ```csharp
   if (arrivalTime <= departureTime)
       return Result.Failure("Arrival time must be after departure time");
   ```

2. **Fuel efficiency must be reasonable**
   ```csharp
   var efficiency = FuelEfficiency.Create(distance, fuel);
   if (efficiency.IsFailure) return Error; // Validates 1-50 MPG range
   ```

---

## 🎨 Design Patterns Used

### 1. Factory Pattern
```csharp
// Static factory methods for creating aggregates
public static Result<Bus> Create(...)
{
    // Validation
    // Construction
    // Domain event
    return Result.Success(bus);
}
```

### 2. Repository Pattern
```csharp
// Abstraction over data access
public interface IBusRepository
{
    Task<Bus?> GetByIdAsync(int busId);
}
```

### 3. Unit of Work Pattern
```csharp
// Coordinate multiple repositories in transaction
public interface IUnitOfWork
{
    IBusRepository Buses { get; }
    Task<int> SaveChangesAsync();
}
```

### 4. Result Pattern
```csharp
// Explicit success/failure without exceptions
public class Result<T>
{
    public bool IsSuccess { get; }
    public T Value { get; }
    public string Error { get; }
}
```

### 5. Domain Events Pattern
```csharp
// Decouple domain logic from side effects
public sealed record BusCreatedEvent(...) : IDomainEvent;
```

---

## ✅ Benefits of This Architecture

### 1. Business Logic Centralization
- All business rules in Domain layer
- Easy to find and modify
- Single source of truth

### 2. Testability
```csharp
[Fact]
public void Bus_CannotScheduleMaintenance_WhenRetired()
{
    // Arrange
    var bus = CreateRetiredBus();
    
    // Act
    var result = bus.ScheduleMaintenance(...);
    
    // Assert
    Assert.True(result.IsFailure);
    Assert.Contains("retired", result.Error);
}
```

### 3. Type Safety
```csharp
// Instead of: decimal price
// We have: Money price
// Prevents: mixing currencies, negative amounts, etc.
```

### 4. Explicit Error Handling
```csharp
// No hidden exceptions
var result = bus.UpdateMileage(newMileage);
if (result.IsFailure)
{
    // Handle error explicitly
}
```

### 5. Maintainability
- Clear separation of concerns
- Easy to add new features
- Changes isolated to specific layers

### 6. Domain Expert Communication
```csharp
// Code reads like business language
bus.ScheduleMaintenance(date, type, description);
bus.CompleteMaintenance(cost, mechanic, parts, downtime);
bus.Retire(reason);
```

---

## 🚀 Next Steps

### Infrastructure Layer (Next)
- [ ] Implement `FleetDbContext` with EF Core
- [ ] Implement repository classes
- [ ] Implement `UnitOfWork`
- [ ] Configure entity mappings
- [ ] Add migrations

### Application Layer
- [ ] Create Commands (CreateBusCommand, ScheduleMaintenanceCommand)
- [ ] Create Queries (GetBusQuery, GetFleetStatusQuery)
- [ ] Create Handlers with MediatR
- [ ] Add validation with FluentValidation
- [ ] Add mapping with AutoMapper

### Presentation Layer
- [ ] Create API controllers
- [ ] Create DTOs
- [ ] Add Swagger documentation
- [ ] Add authentication/authorization
- [ ] Add logging and monitoring

---

## 📚 References

- **Domain-Driven Design** by Eric Evans
- **Implementing Domain-Driven Design** by Vaughn Vernon
- **Clean Architecture** by Robert C. Martin
- **Microsoft DDD Documentation**: https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/

---

## 💡 Key Takeaways

1. **Domain Layer is the heart** - All business logic lives here
2. **Aggregates enforce invariants** - Business rules always valid
3. **Value Objects add type safety** - Prevent primitive obsession
4. **Domain Events decouple logic** - Side effects handled separately
5. **Result Pattern avoids exceptions** - Explicit error handling
6. **Repositories abstract data** - Domain doesn't know about database
7. **Clean Architecture** - Dependencies point inward to Domain

---

**This architecture makes the codebase:**
- ✅ Maintainable
- ✅ Testable
- ✅ Scalable
- ✅ Business-focused
- ✅ Professional

**Perfect for interviews and production!** 🎯

