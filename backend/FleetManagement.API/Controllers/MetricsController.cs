using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FleetManagement.Infrastructure.Data;
using FleetManagement.Core.Aggregates.BusAggregate;
using System.Text;

namespace FleetManagement.API.Controllers;

/// <summary>
/// Prometheus-compatible metrics endpoint for Grafana integration
/// </summary>
[ApiController]
[Route("metrics")]
public class MetricsController : ControllerBase
{
    private readonly FleetDbContext _context;

    public MetricsController(FleetDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Prometheus metrics endpoint - scrape this with Prometheus
    /// </summary>
    [HttpGet]
    [Produces("text/plain")]
    public async Task<IActionResult> GetPrometheusMetrics()
    {
        var sb = new StringBuilder();
        var buses = await _context.Buses.ToListAsync();
        var today = DateTime.UtcNow.Date;
        var last30Days = DateTime.UtcNow.AddDays(-30);

        var operations = await _context.DailyOperations
            .Where(o => o.OperationDate >= last30Days)
            .ToListAsync();

        var todayOps = operations.Where(o => o.OperationDate.Date == today).ToList();

        // Fleet Status
        AppendMetric(sb, "fleet_buses_total", "Total buses", buses.Count);
        AppendMetric(sb, "fleet_buses_active", "Active buses", buses.Count(b => b.Status == BusStatus.Active));
        AppendMetric(sb, "fleet_buses_maintenance", "Buses in maintenance", buses.Count(b => b.Status == BusStatus.Maintenance));
        AppendMetric(sb, "fleet_buses_out_of_service", "Out of service", buses.Count(b => b.Status == BusStatus.OutOfService));

        // Operations
        AppendMetric(sb, "fleet_operations_today", "Trips today", todayOps.Count);
        AppendMetric(sb, "fleet_passengers_today", "Passengers today", todayOps.Sum(o => o.PassengerCount));
        AppendMetric(sb, "fleet_passengers_30d", "Passengers 30d", operations.Sum(o => o.PassengerCount));

        // Revenue
        AppendMetric(sb, "fleet_revenue_today", "Revenue today", todayOps.Sum(o => o.Revenue.Amount));
        AppendMetric(sb, "fleet_revenue_30d", "Revenue 30d", operations.Sum(o => o.Revenue.Amount));

        // Fuel
        AppendMetric(sb, "fleet_fuel_consumed_30d", "Fuel consumed 30d", operations.Sum(o => o.FuelConsumed));
        AppendMetric(sb, "fleet_fuel_cost_30d", "Fuel cost 30d", operations.Sum(o => o.FuelCost.Amount));

        var totalDistance = operations.Sum(o => o.DistanceTraveled);
        var totalFuel = operations.Sum(o => o.FuelConsumed);
        var avgMpg = totalFuel > 0 ? totalDistance / totalFuel : 0;
        AppendMetric(sb, "fleet_fuel_efficiency_mpg", "Fleet MPG", avgMpg);

        // Distance
        AppendMetric(sb, "fleet_distance_30d", "Distance 30d miles", totalDistance);

        // On-time performance
        var onTimeOps = operations.Count(o => !o.IsDelayed());
        var onTimePercent = operations.Count > 0 ? (double)onTimeOps / operations.Count * 100 : 0;
        AppendMetric(sb, "fleet_ontime_percentage", "On-time rate", (decimal)onTimePercent);
        AppendMetric(sb, "fleet_delays_today", "Delays today", todayOps.Count(o => o.IsDelayed()));

        // Maintenance
        var pendingMaint = buses.Count(b => b.RequiresMaintenance());
        var overdueMaint = buses.Count(b => b.DaysUntilMaintenance() < 0);
        AppendMetric(sb, "fleet_maintenance_pending", "Pending maintenance", pendingMaint);
        AppendMetric(sb, "fleet_maintenance_overdue", "Overdue maintenance", overdueMaint);

        // Profitability
        var revenue30d = operations.Sum(o => o.Revenue.Amount);
        var fuelCost30d = operations.Sum(o => o.FuelCost.Amount);
        var profit30d = revenue30d - fuelCost30d;
        AppendMetric(sb, "fleet_profit_30d", "Profit 30d", profit30d);

        // Per-bus metrics
        sb.AppendLine("# HELP fleet_bus_mileage_total Total mileage per bus");
        sb.AppendLine("# TYPE fleet_bus_mileage_total gauge");
        foreach (var bus in buses)
        {
            sb.AppendLine($"fleet_bus_mileage_total{{bus_number=\"{bus.BusNumber.Value}\"}} {bus.CurrentMileage}");
        }

        return Content(sb.ToString(), "text/plain; charset=utf-8");
    }

    private void AppendMetric(StringBuilder sb, string name, string help, decimal value)
    {
        sb.AppendLine($"# HELP {name} {help}");
        sb.AppendLine($"# TYPE {name} gauge");
        sb.AppendLine($"{name} {value:F2}");
    }

    [HttpGet("health")]
    public IActionResult Health() => Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
}
