using FleetManagement.Core.Common;
using FleetManagement.Core.ValueObjects;
using FleetManagement.Core.Aggregates.BusAggregate.Events;

namespace FleetManagement.Core.Aggregates.BusAggregate;

/// <summary>
/// Bus Aggregate Root - represents a bus in the fleet with all its business rules
/// </summary>
public sealed class Bus : AggregateRoot
{
    public int BusId { get; private set; }
    public BusNumber BusNumber { get; private set; } = null!;
    public string Model { get; private set; } = string.Empty;
    public int Year { get; private set; }
    public int Capacity { get; private set; }
    public decimal FuelTankCapacity { get; private set; }
    public BusStatus Status { get; private set; }
    public DateTime PurchaseDate { get; private set; }
    public Money PurchasePrice { get; private set; } = null!;
    public int CurrentMileage { get; private set; }
    public DateTime LastMaintenanceDate { get; private set; }
    public DateTime NextMaintenanceDate { get; private set; }
    
    private readonly List<MaintenanceRecord> _maintenanceRecords = new();
    public IReadOnlyCollection<MaintenanceRecord> MaintenanceRecords => _maintenanceRecords.AsReadOnly();
    
    // Private constructor for EF Core
    private Bus() { }
    
    // Factory method for creating new bus
    public static Result<Bus> Create(
        BusNumber busNumber,
        string model,
        int year,
        int capacity,
        decimal fuelTankCapacity,
        DateTime purchaseDate,
        Money purchasePrice)
    {
        // Business rule validations
        if (string.IsNullOrWhiteSpace(model))
            return Result.Failure<Bus>("Bus model cannot be empty");
            
        var currentYear = DateTime.UtcNow.Year;
        if (year < 2000 || year > currentYear + 1)
            return Result.Failure<Bus>($"Bus year must be between 2000 and {currentYear + 1}");
            
        if (capacity < 10 || capacity > 100)
            return Result.Failure<Bus>("Bus capacity must be between 10 and 100 passengers");
            
        if (fuelTankCapacity <= 0 || fuelTankCapacity > 200)
            return Result.Failure<Bus>("Fuel tank capacity must be between 0 and 200 gallons");
            
        if (purchaseDate > DateTime.UtcNow)
            return Result.Failure<Bus>("Purchase date cannot be in the future");
        
        var bus = new Bus
        {
            BusNumber = busNumber,
            Model = model,
            Year = year,
            Capacity = capacity,
            FuelTankCapacity = fuelTankCapacity,
            Status = BusStatus.Active,
            PurchaseDate = purchaseDate,
            PurchasePrice = purchasePrice,
            CurrentMileage = 0,
            LastMaintenanceDate = purchaseDate,
            NextMaintenanceDate = purchaseDate.AddMonths(3) // First maintenance after 3 months
        };
        
        bus.AddDomainEvent(new BusCreatedEvent(bus.BusId, busNumber.Value, model));
        
        return Result.Success(bus);
    }
    
    // Business methods
    public Result UpdateMileage(int newMileage)
    {
        if (newMileage < CurrentMileage)
            return Result.Failure("New mileage cannot be less than current mileage");
            
        var oldMileage = CurrentMileage;
        CurrentMileage = newMileage;
        MarkAsUpdated();
        
        // Check if maintenance is needed
        if (CurrentMileage - oldMileage > 5000 && DateTime.UtcNow >= NextMaintenanceDate)
        {
            AddDomainEvent(new MaintenanceRequiredEvent(BusId, BusNumber.Value, CurrentMileage));
        }
        
        return Result.Success();
    }
    
    public Result ScheduleMaintenance(DateTime maintenanceDate, string maintenanceType, string description)
    {
        if (maintenanceDate < DateTime.UtcNow)
            return Result.Failure("Maintenance date cannot be in the past");
            
        if (Status == BusStatus.Retired)
            return Result.Failure("Cannot schedule maintenance for retired bus");
            
        Status = BusStatus.Maintenance;
        NextMaintenanceDate = maintenanceDate;
        MarkAsUpdated();
        
        AddDomainEvent(new MaintenanceScheduledEvent(BusId, BusNumber.Value, maintenanceDate, maintenanceType));
        
        return Result.Success();
    }
    
    public Result CompleteMaintenance(decimal cost, string performedBy, string? partsReplaced, int downtimeHours)
    {
        if (Status != BusStatus.Maintenance)
            return Result.Failure("Bus is not in maintenance status");
            
        var costResult = Money.Create(cost);
        if (costResult.IsFailure)
            return Result.Failure(costResult.Error);
            
        var record = MaintenanceRecord.Create(
            BusId,
            DateTime.UtcNow,
            "Routine",
            "Scheduled maintenance completed",
            costResult.Value,
            CurrentMileage,
            performedBy,
            partsReplaced,
            downtimeHours);
            
        if (record.IsFailure)
            return Result.Failure(record.Error);
            
        _maintenanceRecords.Add(record.Value);
        LastMaintenanceDate = DateTime.UtcNow;
        NextMaintenanceDate = DateTime.UtcNow.AddMonths(3); // Next maintenance in 3 months
        Status = BusStatus.Active;
        MarkAsUpdated();
        
        AddDomainEvent(new MaintenanceCompletedEvent(BusId, BusNumber.Value, cost, downtimeHours));
        
        return Result.Success();
    }
    
    public Result Retire(string reason)
    {
        if (Status == BusStatus.Retired)
            return Result.Failure("Bus is already retired");
            
        Status = BusStatus.Retired;
        MarkAsUpdated();
        
        AddDomainEvent(new BusRetiredEvent(BusId, BusNumber.Value, reason));
        
        return Result.Success();
    }
    
    public Result Reactivate()
    {
        if (Status != BusStatus.Retired)
            return Result.Failure("Only retired buses can be reactivated");
            
        Status = BusStatus.Active;
        MarkAsUpdated();
        
        return Result.Success();
    }
    
    public bool RequiresMaintenance()
    {
        return DateTime.UtcNow >= NextMaintenanceDate || 
               Status == BusStatus.Maintenance;
    }
    
    public int DaysUntilMaintenance()
    {
        return (NextMaintenanceDate - DateTime.UtcNow).Days;
    }
}
