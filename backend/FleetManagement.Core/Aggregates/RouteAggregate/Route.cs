using FleetManagement.Core.Common;
using FleetManagement.Core.ValueObjects;

namespace FleetManagement.Core.Aggregates.RouteAggregate;

/// <summary>
/// Route Aggregate Root - represents a bus route with business rules
/// </summary>
public sealed class Route : AggregateRoot
{
    public int RouteId { get; private set; }
    public string RouteNumber { get; private set; } = string.Empty;
    public string RouteName { get; private set; } = string.Empty;
    public decimal Distance { get; private set; } // in miles
    public int EstimatedDuration { get; private set; } // in minutes
    public int NumberOfStops { get; private set; }
    public string StartLocation { get; private set; } = string.Empty;
    public string EndLocation { get; private set; } = string.Empty;
    public bool IsActive { get; private set; }
    public Money EstimatedFuelCost { get; private set; } = null!;
    
    private Route() { }
    
    public static Result<Route> Create(
        string routeNumber,
        string routeName,
        decimal distance,
        int estimatedDuration,
        int numberOfStops,
        string startLocation,
        string endLocation,
        Money estimatedFuelCost)
    {
        if (string.IsNullOrWhiteSpace(routeNumber))
            return Result.Failure<Route>("Route number cannot be empty");
            
        if (string.IsNullOrWhiteSpace(routeName))
            return Result.Failure<Route>("Route name cannot be empty");
            
        if (distance <= 0 || distance > 500)
            return Result.Failure<Route>("Distance must be between 0 and 500 miles");
            
        if (estimatedDuration <= 0 || estimatedDuration > 720) // 12 hours max
            return Result.Failure<Route>("Estimated duration must be between 0 and 720 minutes");
            
        if (numberOfStops < 2 || numberOfStops > 100)
            return Result.Failure<Route>("Number of stops must be between 2 and 100");
            
        if (string.IsNullOrWhiteSpace(startLocation))
            return Result.Failure<Route>("Start location cannot be empty");
            
        if (string.IsNullOrWhiteSpace(endLocation))
            return Result.Failure<Route>("End location cannot be empty");
        
        var route = new Route
        {
            RouteNumber = routeNumber,
            RouteName = routeName,
            Distance = distance,
            EstimatedDuration = estimatedDuration,
            NumberOfStops = numberOfStops,
            StartLocation = startLocation,
            EndLocation = endLocation,
            IsActive = true,
            EstimatedFuelCost = estimatedFuelCost
        };
        
        return Result.Success(route);
    }
    
    public Result Deactivate()
    {
        if (!IsActive)
            return Result.Failure("Route is already inactive");
            
        IsActive = false;
        MarkAsUpdated();
        return Result.Success();
    }
    
    public Result Activate()
    {
        if (IsActive)
            return Result.Failure("Route is already active");
            
        IsActive = true;
        MarkAsUpdated();
        return Result.Success();
    }
    
    public Result UpdateEstimatedFuelCost(Money newCost)
    {
        EstimatedFuelCost = newCost;
        MarkAsUpdated();
        return Result.Success();
    }
    
    public decimal AverageDistancePerStop()
    {
        return NumberOfStops > 0 ? Distance / NumberOfStops : 0;
    }
}
