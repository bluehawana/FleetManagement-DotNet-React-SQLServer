using FleetManagement.Core.Common;
using FleetManagement.Core.ValueObjects;

namespace FleetManagement.Core.Aggregates.BusAggregate;

/// <summary>
/// Entity within Bus aggregate representing a maintenance record
/// </summary>
public sealed class MaintenanceRecord : Entity
{
    public int MaintenanceId { get; private set; }
    public int BusId { get; private set; }
    public DateTime MaintenanceDate { get; private set; }
    public string MaintenanceType { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public Money Cost { get; private set; } = null!;
    public int MileageAtMaintenance { get; private set; }
    public string PerformedBy { get; private set; } = string.Empty;
    public string? PartsReplaced { get; private set; }
    public int DowntimeHours { get; private set; }
    public bool IsWarranty { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    
    private MaintenanceRecord() { }
    
    public static Result<MaintenanceRecord> Create(
        int busId,
        DateTime maintenanceDate,
        string maintenanceType,
        string description,
        Money cost,
        int mileageAtMaintenance,
        string performedBy,
        string? partsReplaced,
        int downtimeHours,
        bool isWarranty = false)
    {
        if (maintenanceDate > DateTime.UtcNow)
            return Result.Failure<MaintenanceRecord>("Maintenance date cannot be in the future");
            
        if (string.IsNullOrWhiteSpace(maintenanceType))
            return Result.Failure<MaintenanceRecord>("Maintenance type cannot be empty");
            
        if (string.IsNullOrWhiteSpace(description))
            return Result.Failure<MaintenanceRecord>("Description cannot be empty");
            
        if (string.IsNullOrWhiteSpace(performedBy))
            return Result.Failure<MaintenanceRecord>("Performed by cannot be empty");
            
        if (downtimeHours < 0)
            return Result.Failure<MaintenanceRecord>("Downtime hours cannot be negative");
        
        var record = new MaintenanceRecord
        {
            BusId = busId,
            MaintenanceDate = maintenanceDate,
            MaintenanceType = maintenanceType,
            Description = description,
            Cost = cost,
            MileageAtMaintenance = mileageAtMaintenance,
            PerformedBy = performedBy,
            PartsReplaced = partsReplaced,
            DowntimeHours = downtimeHours,
            IsWarranty = isWarranty
        };
        
        return Result.Success(record);
    }
}
