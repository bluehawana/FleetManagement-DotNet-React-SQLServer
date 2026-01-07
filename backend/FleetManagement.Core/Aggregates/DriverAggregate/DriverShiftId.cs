namespace FleetManagement.Core.Aggregates.DriverAggregate;

/// <summary>
/// Strongly-typed identifier for DriverShift entity
/// </summary>
public record DriverShiftId(Guid Value)
{
    public static DriverShiftId New() => new(Guid.NewGuid());
    public static DriverShiftId From(Guid value) => new(value);
    
    public override string ToString() => Value.ToString();
}