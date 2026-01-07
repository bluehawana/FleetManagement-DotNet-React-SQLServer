namespace FleetManagement.Core.Aggregates.DriverAggregate;

/// <summary>
/// Strongly-typed identifier for Driver aggregate
/// </summary>
public record DriverId(Guid Value)
{
    public static DriverId New() => new(Guid.NewGuid());
    public static DriverId From(Guid value) => new(value);
    
    public override string ToString() => Value.ToString();
}