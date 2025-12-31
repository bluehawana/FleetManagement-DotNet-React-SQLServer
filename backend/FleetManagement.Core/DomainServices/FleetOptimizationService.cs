using FleetManagement.Core.Aggregates.BusAggregate;
using FleetManagement.Core.Aggregates.RouteAggregate;
using FleetManagement.Core.Aggregates.OperationAggregate;
using FleetManagement.Core.Common;

namespace FleetManagement.Core.DomainServices;

/// <summary>
/// Domain service for fleet optimization business logic
/// </summary>
public class FleetOptimizationService
{
    public Result<decimal> CalculatePotentialSavings(
        IEnumerable<DailyOperation> operations,
        decimal targetFuelEfficiencyImprovement)
    {
        if (!operations.Any())
            return Result.Failure<decimal>("No operations provided");
            
        if (targetFuelEfficiencyImprovement <= 0 || targetFuelEfficiencyImprovement > 0.5m)
            return Result.Failure<decimal>("Target improvement must be between 0 and 50%");
        
        var totalFuelCost = operations.Sum(o => o.FuelCost.Amount);
        var potentialSavings = totalFuelCost * targetFuelEfficiencyImprovement;
        
        return Result.Success(potentialSavings);
    }
    
    public Result<Bus> RecommendBusForRoute(
        IEnumerable<Bus> availableBuses,
        Route route,
        int expectedPassengers)
    {
        var activeBuses = availableBuses
            .Where(b => b.Status == BusStatus.Active && !b.RequiresMaintenance())
            .ToList();
            
        if (!activeBuses.Any())
            return Result.Failure<Bus>("No available buses");
        
        // Find bus with capacity closest to expected passengers (but not less)
        var suitableBus = activeBuses
            .Where(b => b.Capacity >= expectedPassengers)
            .OrderBy(b => b.Capacity)
            .FirstOrDefault();
            
        if (suitableBus == null)
            return Result.Failure<Bus>($"No bus with sufficient capacity for {expectedPassengers} passengers");
            
        return Result.Success(suitableBus);
    }
    
    public IEnumerable<Bus> IdentifyInefficientBuses(
        IEnumerable<Bus> buses,
        IEnumerable<DailyOperation> operations,
        decimal minAcceptableMpg)
    {
        var busEfficiency = operations
            .GroupBy(o => o.BusId)
            .Select(g => new
            {
                BusId = g.Key,
                AverageMpg = g.Average(o => o.DistanceTraveled / (o.FuelConsumed > 0 ? o.FuelConsumed : 1))
            })
            .Where(x => x.AverageMpg < minAcceptableMpg)
            .Select(x => x.BusId)
            .ToHashSet();
            
        return buses.Where(b => busEfficiency.Contains(b.BusId));
    }
}
