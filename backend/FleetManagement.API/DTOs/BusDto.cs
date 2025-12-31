namespace FleetManagement.API.DTOs;

public record BusDto(
    int BusId,
    string BusNumber,
    string Model,
    int Year,
    int Capacity,
    decimal FuelTankCapacity,
    string Status,
    DateTime PurchaseDate,
    decimal PurchasePrice,
    string PurchaseCurrency,
    int CurrentMileage,
    DateTime LastMaintenanceDate,
    DateTime NextMaintenanceDate,
    int DaysUntilMaintenance,
    bool RequiresMaintenance
);

public record CreateBusRequest(
    string BusNumber,
    string Model,
    int Year,
    int Capacity,
    decimal FuelTankCapacity,
    DateTime PurchaseDate,
    decimal PurchasePrice,
    string Currency = "USD"
);

public record UpdateMileageRequest(
    int NewMileage
);

public record ScheduleMaintenanceRequest(
    DateTime MaintenanceDate,
    string MaintenanceType,
    string Description
);

public record CompleteMaintenanceRequest(
    decimal Cost,
    string PerformedBy,
    string? PartsReplaced,
    int DowntimeHours
);
