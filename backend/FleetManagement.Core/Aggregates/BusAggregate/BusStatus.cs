namespace FleetManagement.Core.Aggregates.BusAggregate;

/// <summary>
/// Enumeration for bus status
/// </summary>
public enum BusStatus
{
    Active = 1,
    Maintenance = 2,
    Retired = 3,
    OutOfService = 4
}
