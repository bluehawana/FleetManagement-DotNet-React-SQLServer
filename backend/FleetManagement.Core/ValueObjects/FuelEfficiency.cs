using FleetManagement.Core.Common;

namespace FleetManagement.Core.ValueObjects;

/// <summary>
/// Value object representing fuel efficiency (Miles Per Gallon)
/// </summary>
public sealed class FuelEfficiency : ValueObject
{
    public decimal MilesPerGallon { get; }
    
    private FuelEfficiency(decimal milesPerGallon)
    {
        MilesPerGallon = milesPerGallon;
    }
    
    public static Result<FuelEfficiency> Create(decimal distance, decimal fuelConsumed)
    {
        if (distance <= 0)
            return Result.Failure<FuelEfficiency>("Distance must be greater than zero");
            
        if (fuelConsumed <= 0)
            return Result.Failure<FuelEfficiency>("Fuel consumed must be greater than zero");
            
        var mpg = distance / fuelConsumed;
        
        if (mpg < 1 || mpg > 50) // Reasonable range for buses
            return Result.Failure<FuelEfficiency>($"Fuel efficiency {mpg:F2} MPG is outside reasonable range (1-50 MPG)");
            
        return Result.Success(new FuelEfficiency(mpg));
    }
    
    public bool IsEfficient() => MilesPerGallon >= 6.0m; // Industry standard for buses
    public bool NeedsAttention() => MilesPerGallon < 4.0m;
    
    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return MilesPerGallon;
    }
    
    public override string ToString() => $"{MilesPerGallon:F2} MPG";
}
