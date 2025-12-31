using Microsoft.AspNetCore.Mvc;
using FleetManagement.Core.Interfaces;

namespace FleetManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<DashboardController> _logger;

    public DashboardController(IUnitOfWork unitOfWork, ILogger<DashboardController> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    /// <summary>
    /// Get dashboard KPIs (Key Performance Indicators)
    /// </summary>
    [HttpGet("kpis")]
    [ProducesResponseType(typeof(DashboardKPIs), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetKPIs()
    {
        var buses = await _unitOfWork.Buses.GetAllAsync();
        var operations = await _unitOfWork.Operations.GetByDateRangeAsync(
            DateTime.UtcNow.AddDays(-30),
            DateTime.UtcNow);

        var totalBuses = buses.Count();
        var activeBuses = buses.Count(b => b.Status == Core.Aggregates.BusAggregate.BusStatus.Active);
        var totalOperations = operations.Count();
        var totalPassengers = operations.Sum(o => o.PassengerCount);
        var totalRevenue = operations.Sum(o => o.Revenue.Amount);
        var totalFuelCost = operations.Sum(o => o.FuelCost.Amount);
        var totalDistance = operations.Sum(o => o.DistanceTraveled);
        var totalFuelConsumed = operations.Sum(o => o.FuelConsumed);
        var avgFuelEfficiency = totalDistance > 0 && totalFuelConsumed > 0 
            ? totalDistance / totalFuelConsumed 
            : 0;
        var delayedOperations = operations.Count(o => o.DelayMinutes > 0);
        var onTimePercentage = totalOperations > 0 
            ? ((totalOperations - delayedOperations) / (decimal)totalOperations) * 100 
            : 100;

        var kpis = new DashboardKPIs
        {
            TotalBuses = totalBuses,
            ActiveBuses = activeBuses,
            TotalOperationsLast30Days = totalOperations,
            TotalPassengersLast30Days = totalPassengers,
            TotalRevenueLast30Days = totalRevenue,
            TotalFuelCostLast30Days = totalFuelCost,
            NetProfitLast30Days = totalRevenue - totalFuelCost,
            AverageFuelEfficiencyMPG = avgFuelEfficiency,
            OnTimePercentage = onTimePercentage,
            TotalDistanceMiles = totalDistance,
            BusesRequiringMaintenance = buses.Count(b => b.RequiresMaintenance())
        };

        return Ok(kpis);
    }

    /// <summary>
    /// Get real-time fleet status for monitoring
    /// </summary>
    [HttpGet("fleet-status")]
    [ProducesResponseType(typeof(FleetStatus), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFleetStatus()
    {
        var buses = await _unitOfWork.Buses.GetAllAsync();
        var today = DateTime.UtcNow.Date;
        var todayOperations = await _unitOfWork.Operations.GetByDateRangeAsync(today, today.AddDays(1));

        var status = new FleetStatus
        {
            Timestamp = DateTime.UtcNow,
            TotalBuses = buses.Count(),
            ActiveBuses = buses.Count(b => b.Status == Core.Aggregates.BusAggregate.BusStatus.Active),
            InMaintenance = buses.Count(b => b.Status == Core.Aggregates.BusAggregate.BusStatus.Maintenance),
            OutOfService = buses.Count(b => b.Status == Core.Aggregates.BusAggregate.BusStatus.OutOfService),
            Retired = buses.Count(b => b.Status == Core.Aggregates.BusAggregate.BusStatus.Retired),
            OperationsToday = todayOperations.Count(),
            PassengersToday = todayOperations.Sum(o => o.PassengerCount),
            DelaysToday = todayOperations.Count(o => o.DelayMinutes > 0),
            AverageDelayMinutes = todayOperations.Any() 
                ? todayOperations.Where(o => o.DelayMinutes > 0).Average(o => (decimal)o.DelayMinutes) 
                : 0
        };

        return Ok(status);
    }

    /// <summary>
    /// Get fuel efficiency trends over time
    /// </summary>
    [HttpGet("fuel-efficiency-trends")]
    [ProducesResponseType(typeof(IEnumerable<FuelEfficiencyTrend>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFuelEfficiencyTrends([FromQuery] int days = 30)
    {
        var startDate = DateTime.UtcNow.AddDays(-days).Date;
        var operations = await _unitOfWork.Operations.GetByDateRangeAsync(startDate, DateTime.UtcNow);

        var trends = operations
            .GroupBy(o => o.OperationDate.Date)
            .Select(g => new FuelEfficiencyTrend
            {
                Date = g.Key,
                AverageMPG = g.Sum(o => o.DistanceTraveled) / (g.Sum(o => o.FuelConsumed) > 0 ? g.Sum(o => o.FuelConsumed) : 1),
                TotalDistance = g.Sum(o => o.DistanceTraveled),
                TotalFuelConsumed = g.Sum(o => o.FuelConsumed),
                OperationCount = g.Count()
            })
            .OrderBy(t => t.Date)
            .ToList();

        return Ok(trends);
    }

    /// <summary>
    /// Get ridership trends over time
    /// </summary>
    [HttpGet("ridership-trends")]
    [ProducesResponseType(typeof(IEnumerable<RidershipTrend>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRidershipTrends([FromQuery] int days = 30)
    {
        var startDate = DateTime.UtcNow.AddDays(-days).Date;
        var operations = await _unitOfWork.Operations.GetByDateRangeAsync(startDate, DateTime.UtcNow);

        var trends = operations
            .GroupBy(o => o.OperationDate.Date)
            .Select(g => new RidershipTrend
            {
                Date = g.Key,
                TotalPassengers = g.Sum(o => o.PassengerCount),
                TotalOperations = g.Count(),
                AveragePassengersPerTrip = g.Average(o => (decimal)o.PassengerCount),
                Revenue = g.Sum(o => o.Revenue.Amount)
            })
            .OrderBy(t => t.Date)
            .ToList();

        return Ok(trends);
    }

    /// <summary>
    /// Get cost analysis breakdown
    /// </summary>
    [HttpGet("cost-analysis")]
    [ProducesResponseType(typeof(CostAnalysis), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCostAnalysis([FromQuery] int days = 30)
    {
        var startDate = DateTime.UtcNow.AddDays(-days).Date;
        var operations = await _unitOfWork.Operations.GetByDateRangeAsync(startDate, DateTime.UtcNow);
        var buses = await _unitOfWork.Buses.GetAllAsync();

        var totalFuelCost = operations.Sum(o => o.FuelCost.Amount);
        var totalRevenue = operations.Sum(o => o.Revenue.Amount);
        var totalMaintenanceCost = buses
            .SelectMany(b => b.MaintenanceRecords)
            .Where(m => m.MaintenanceDate >= startDate)
            .Sum(m => m.Cost.Amount);

        var analysis = new CostAnalysis
        {
            Period = $"Last {days} days",
            TotalRevenue = totalRevenue,
            TotalFuelCost = totalFuelCost,
            TotalMaintenanceCost = totalMaintenanceCost,
            TotalOperatingCost = totalFuelCost + totalMaintenanceCost,
            NetProfit = totalRevenue - (totalFuelCost + totalMaintenanceCost),
            ProfitMargin = totalRevenue > 0 ? ((totalRevenue - (totalFuelCost + totalMaintenanceCost)) / totalRevenue) * 100 : 0,
            FuelCostPerMile = operations.Sum(o => o.DistanceTraveled) > 0 
                ? totalFuelCost / operations.Sum(o => o.DistanceTraveled) 
                : 0,
            CostPerPassenger = operations.Sum(o => o.PassengerCount) > 0 
                ? (totalFuelCost + totalMaintenanceCost) / operations.Sum(o => o.PassengerCount) 
                : 0
        };

        return Ok(analysis);
    }

    /// <summary>
    /// Get performance metrics by bus
    /// </summary>
    [HttpGet("bus-performance")]
    [ProducesResponseType(typeof(IEnumerable<BusPerformance>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBusPerformance([FromQuery] int days = 30)
    {
        var startDate = DateTime.UtcNow.AddDays(-days).Date;
        var operations = await _unitOfWork.Operations.GetByDateRangeAsync(startDate, DateTime.UtcNow);
        var buses = await _unitOfWork.Buses.GetAllAsync();

        var performance = operations
            .GroupBy(o => o.BusId)
            .Select(g =>
            {
                var bus = buses.FirstOrDefault(b => b.BusId == g.Key);
                var totalDistance = g.Sum(o => o.DistanceTraveled);
                var totalFuel = g.Sum(o => o.FuelConsumed);
                
                return new BusPerformance
                {
                    BusId = g.Key,
                    BusNumber = bus?.BusNumber.Value ?? "Unknown",
                    TotalOperations = g.Count(),
                    TotalPassengers = g.Sum(o => o.PassengerCount),
                    TotalDistance = totalDistance,
                    AverageFuelEfficiency = totalFuel > 0 ? totalDistance / totalFuel : 0,
                    TotalRevenue = g.Sum(o => o.Revenue.Amount),
                    TotalFuelCost = g.Sum(o => o.FuelCost.Amount),
                    AverageDelayMinutes = g.Average(o => (decimal)o.DelayMinutes),
                    OnTimePercentage = g.Count() > 0 ? ((g.Count() - g.Count(o => o.DelayMinutes > 0)) / (decimal)g.Count()) * 100 : 100
                };
            })
            .OrderByDescending(p => p.TotalRevenue)
            .ToList();

        return Ok(performance);
    }
}

// DTOs for Dashboard
public record DashboardKPIs
{
    public int TotalBuses { get; init; }
    public int ActiveBuses { get; init; }
    public int TotalOperationsLast30Days { get; init; }
    public int TotalPassengersLast30Days { get; init; }
    public decimal TotalRevenueLast30Days { get; init; }
    public decimal TotalFuelCostLast30Days { get; init; }
    public decimal NetProfitLast30Days { get; init; }
    public decimal AverageFuelEfficiencyMPG { get; init; }
    public decimal OnTimePercentage { get; init; }
    public decimal TotalDistanceMiles { get; init; }
    public int BusesRequiringMaintenance { get; init; }
}

public record FleetStatus
{
    public DateTime Timestamp { get; init; }
    public int TotalBuses { get; init; }
    public int ActiveBuses { get; init; }
    public int InMaintenance { get; init; }
    public int OutOfService { get; init; }
    public int Retired { get; init; }
    public int OperationsToday { get; init; }
    public int PassengersToday { get; init; }
    public int DelaysToday { get; init; }
    public decimal AverageDelayMinutes { get; init; }
}

public record FuelEfficiencyTrend
{
    public DateTime Date { get; init; }
    public decimal AverageMPG { get; init; }
    public decimal TotalDistance { get; init; }
    public decimal TotalFuelConsumed { get; init; }
    public int OperationCount { get; init; }
}

public record RidershipTrend
{
    public DateTime Date { get; init; }
    public int TotalPassengers { get; init; }
    public int TotalOperations { get; init; }
    public decimal AveragePassengersPerTrip { get; init; }
    public decimal Revenue { get; init; }
}

public record CostAnalysis
{
    public string Period { get; init; } = string.Empty;
    public decimal TotalRevenue { get; init; }
    public decimal TotalFuelCost { get; init; }
    public decimal TotalMaintenanceCost { get; init; }
    public decimal TotalOperatingCost { get; init; }
    public decimal NetProfit { get; init; }
    public decimal ProfitMargin { get; init; }
    public decimal FuelCostPerMile { get; init; }
    public decimal CostPerPassenger { get; init; }
}

public record BusPerformance
{
    public int BusId { get; init; }
    public string BusNumber { get; init; } = string.Empty;
    public int TotalOperations { get; init; }
    public int TotalPassengers { get; init; }
    public decimal TotalDistance { get; init; }
    public decimal AverageFuelEfficiency { get; init; }
    public decimal TotalRevenue { get; init; }
    public decimal TotalFuelCost { get; init; }
    public decimal AverageDelayMinutes { get; init; }
    public decimal OnTimePercentage { get; init; }
}
