using FleetManagement.Core.Common;
using FleetManagement.Core.ValueObjects;

namespace FleetManagement.Core.Aggregates.OperationAggregate;

/// <summary>
/// DailyOperation Aggregate Root - represents a single bus operation/trip
/// </summary>
public sealed class DailyOperation : AggregateRoot
{
    public int OperationId { get; private set; }
    public int BusId { get; private set; }
    public int RouteId { get; private set; }
    public DateTime OperationDate { get; private set; }
    public TimeSpan DepartureTime { get; private set; }
    public TimeSpan ArrivalTime { get; private set; }
    public int PassengerCount { get; private set; }
    public decimal FuelConsumed { get; private set; } // in gallons
    public decimal DistanceTraveled { get; private set; } // in miles
    public int DelayMinutes { get; private set; }
    public string DriverName { get; private set; } = string.Empty;
    public Money Revenue { get; private set; } = null!;
    public Money FuelCost { get; private set; } = null!;
    public string? Notes { get; private set; }
    
    private DailyOperation() { }
    
    public static Result<DailyOperation> Create(
        int busId,
        int routeId,
        DateTime operationDate,
        TimeSpan departureTime,
        TimeSpan arrivalTime,
        int passengerCount,
        decimal fuelConsumed,
        decimal distanceTraveled,
        int delayMinutes,
        string driverName,
        Money revenue,
        Money fuelCost,
        string? notes = null)
    {
        if (operationDate > DateTime.UtcNow)
            return Result.Failure<DailyOperation>("Operation date cannot be in the future");
            
        if (arrivalTime <= departureTime)
            return Result.Failure<DailyOperation>("Arrival time must be after departure time");
            
        if (passengerCount < 0)
            return Result.Failure<DailyOperation>("Passenger count cannot be negative");
            
        if (fuelConsumed < 0)
            return Result.Failure<DailyOperation>("Fuel consumed cannot be negative");
            
        if (distanceTraveled <= 0)
            return Result.Failure<DailyOperation>("Distance traveled must be greater than zero");
            
        if (delayMinutes < 0)
            return Result.Failure<DailyOperation>("Delay minutes cannot be negative");
            
        if (string.IsNullOrWhiteSpace(driverName))
            return Result.Failure<DailyOperation>("Driver name cannot be empty");
        
        var operation = new DailyOperation
        {
            BusId = busId,
            RouteId = routeId,
            OperationDate = operationDate,
            DepartureTime = departureTime,
            ArrivalTime = arrivalTime,
            PassengerCount = passengerCount,
            FuelConsumed = fuelConsumed,
            DistanceTraveled = distanceTraveled,
            DelayMinutes = delayMinutes,
            DriverName = driverName,
            Revenue = revenue,
            FuelCost = fuelCost,
            Notes = notes
        };
        
        return Result.Success(operation);
    }
    
    public Result<FuelEfficiency> CalculateFuelEfficiency()
    {
        return FuelEfficiency.Create(DistanceTraveled, FuelConsumed);
    }
    
    public Money CalculateCostPerPassenger()
    {
        if (PassengerCount == 0)
            return Money.Create(0).Value;
            
        return Money.Create(FuelCost.Amount / PassengerCount).Value;
    }
    
    public Money CalculateProfit()
    {
        return Revenue - FuelCost;
    }
    
    public bool IsDelayed() => DelayMinutes > 0;
    public bool IsSignificantlyDelayed() => DelayMinutes > 15;
    public bool IsLowOccupancy(int busCapacity) => PassengerCount < (busCapacity * 0.3m); // Less than 30% capacity
    public bool IsHighOccupancy(int busCapacity) => PassengerCount > (busCapacity * 0.8m); // More than 80% capacity
    
    public TimeSpan ActualDuration() => ArrivalTime - DepartureTime;
}
