using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FleetManagement.Infrastructure.Data;
using FleetManagement.Core.Aggregates.BusAggregate;
using System.Text;

namespace FleetManagement.API.Controllers;

/// <summary>
/// Fleet = DOT Data Center | Bus = Server Node | Driver = Operator
/// Prometheus metrics treating fleet like HPC infrastructure
/// </summary>
[ApiController]
[Route("metrics")]
public class MetricsController : ControllerBase
{
    private readonly FleetDbContext _context;
    private const int SERVICE_INTERVAL_MILES = 30000; // Like scheduled maintenance window
    private const int FUEL_TANK_GALLONS = 100;
    private const int DRIVER_SHIFT_HOURS = 8;
    private static readonly Random _rng = new(42); // Deterministic for demo

    public MetricsController(FleetDbContext context) => _context = context;

    [HttpGet]
    [Produces("text/plain")]
    public async Task<IActionResult> GetPrometheusMetrics()
    {
        var sb = new StringBuilder();
        var buses = await _context.Buses.ToListAsync();
        var routes = await _context.Routes.ToListAsync();
        var today = DateTime.UtcNow.Date;
        var now = DateTime.UtcNow;

        var operations = await _context.DailyOperations
            .Where(o => o.OperationDate >= now.AddDays(-30))
            .ToListAsync();

        var todayOps = operations.Where(o => o.OperationDate.Date == today).ToList();
        var isHoliday = IsHoliday(today);

        // ╔═══════════════════════════════════════════════════════════════╗
        // ║  DATA CENTER OVERVIEW (Fleet = DOT Infrastructure)            ║
        // ╚═══════════════════════════════════════════════════════════════╝
        var running = buses.Count(b => b.Status == BusStatus.Active);
        var maint = buses.Count(b => b.Status == BusStatus.Maintenance);
        var down = buses.Count(b => b.Status == BusStatus.OutOfService);
        var warning = buses.Count(b => GetHealthPercent(b) < 30 && b.Status == BusStatus.Active);
        var critical = buses.Count(b => GetHealthPercent(b) < 10 && b.Status == BusStatus.Active);

        sb.AppendLine("# ═══ DATA CENTER (FLEET) OVERVIEW ═══");
        Gauge(sb, "dc_nodes_total", "Total nodes (buses) in data center", buses.Count);
        Gauge(sb, "dc_nodes_running", "Nodes online and operational", running);
        Gauge(sb, "dc_nodes_warning", "Nodes with warnings (service soon)", warning);
        Gauge(sb, "dc_nodes_critical", "Nodes critical (service overdue)", critical);
        Gauge(sb, "dc_nodes_maintenance", "Nodes in scheduled maintenance", maint);
        Gauge(sb, "dc_nodes_down", "Nodes offline/failed", down);

        var dcHealth = buses.Count > 0 ? (double)(running - critical) / buses.Count * 100 : 0;
        Gauge(sb, "dc_health_score", "Data center health score 0-100", Math.Max(0, dcHealth));
        Gauge(sb, "dc_capacity_used", "Capacity utilization percent", buses.Count > 0 ? (double)running / buses.Count * 100 : 0);

        // ╔═══════════════════════════════════════════════════════════════╗
        // ║  WORKLOAD METRICS (Today's Operations)                        ║
        // ╚═══════════════════════════════════════════════════════════════╝
        sb.AppendLine("\n# ═══ WORKLOAD (DAILY OPERATIONS) ═══");
        Gauge(sb, "workload_jobs_today", "Jobs (trips) completed today", todayOps.Count);
        Gauge(sb, "workload_throughput", "Throughput (passengers) today", todayOps.Sum(o => o.PassengerCount));
        Gauge(sb, "workload_revenue", "Revenue generated today USD", todayOps.Sum(o => o.Revenue.Amount));
        Gauge(sb, "workload_power_consumed", "Power (fuel) consumed today gal", todayOps.Sum(o => o.FuelConsumed));
        Gauge(sb, "workload_distance", "Distance covered today miles", todayOps.Sum(o => o.DistanceTraveled));
        Gauge(sb, "workload_errors", "Failed/delayed jobs today", todayOps.Count(o => o.IsDelayed()));
        Gauge(sb, "workload_success_rate", "Job success rate percent",
            todayOps.Count > 0 ? (double)todayOps.Count(o => !o.IsDelayed()) / todayOps.Count * 100 : 100);
        Gauge(sb, "workload_is_holiday", "Holiday mode (reduced load expected)", isHoliday ? 1 : 0);

        // ╔═══════════════════════════════════════════════════════════════╗
        // ║  MONTHLY AGGREGATES                                           ║
        // ╚═══════════════════════════════════════════════════════════════╝
        sb.AppendLine("\n# ═══ MONTHLY AGGREGATES ═══");
        var totalFuel = operations.Sum(o => o.FuelConsumed);
        var totalDist = operations.Sum(o => o.DistanceTraveled);
        Gauge(sb, "monthly_jobs", "Total jobs last 30 days", operations.Count);
        Gauge(sb, "monthly_throughput", "Total throughput (passengers) 30d", operations.Sum(o => o.PassengerCount));
        Gauge(sb, "monthly_revenue", "Total revenue 30d USD", operations.Sum(o => o.Revenue.Amount));
        Gauge(sb, "monthly_power", "Total power (fuel) 30d gal", totalFuel);
        Gauge(sb, "monthly_power_cost", "Power cost 30d USD", operations.Sum(o => o.FuelCost.Amount));
        Gauge(sb, "monthly_efficiency", "Efficiency (MPG)", totalFuel > 0 ? totalDist / totalFuel : 0);
        Gauge(sb, "monthly_profit", "Net profit 30d USD",
            operations.Sum(o => o.Revenue.Amount) - operations.Sum(o => o.FuelCost.Amount));

        // ╔═══════════════════════════════════════════════════════════════╗
        // ║  DAILY TRENDS (Like Network Traffic Graphs)                   ║
        // ╚═══════════════════════════════════════════════════════════════╝
        sb.AppendLine("\n# ═══ DAILY TRENDS (7 DAYS) ═══");
        sb.AppendLine("# HELP daily_throughput Daily passenger throughput");
        sb.AppendLine("# TYPE daily_throughput gauge");
        sb.AppendLine("# HELP daily_jobs Daily job count");
        sb.AppendLine("# TYPE daily_jobs gauge");
        sb.AppendLine("# HELP daily_revenue Daily revenue USD");
        sb.AppendLine("# TYPE daily_revenue gauge");
        sb.AppendLine("# HELP daily_power Daily fuel consumption gal");
        sb.AppendLine("# TYPE daily_power gauge");

        for (int i = 6; i >= 0; i--)
        {
            var date = today.AddDays(-i);
            var dayOps = operations.Where(o => o.OperationDate.Date == date).ToList();
            var lbl = $"date=\"{date:yyyy-MM-dd}\",day=\"{date:ddd}\"";

            sb.AppendLine($"daily_throughput{{{lbl}}} {dayOps.Sum(o => o.PassengerCount)}");
            sb.AppendLine($"daily_jobs{{{lbl}}} {dayOps.Count}");
            sb.AppendLine($"daily_revenue{{{lbl}}} {dayOps.Sum(o => o.Revenue.Amount):F2}");
            sb.AppendLine($"daily_power{{{lbl}}} {dayOps.Sum(o => o.FuelConsumed):F2}");
        }

        // ╔═══════════════════════════════════════════════════════════════╗
        // ║  PER-NODE METRICS (Each Bus = Server in HPC Cluster)          ║
        // ╚═══════════════════════════════════════════════════════════════╝
        sb.AppendLine("\n# ═══ NODE (BUS) METRICS ═══");
        sb.AppendLine("# Each bus treated like a server: health, temp, fuel, uptime");
        sb.AppendLine("# HELP node_health Health bar 0-100 (100=just serviced, 0=needs service)");
        sb.AppendLine("# TYPE node_health gauge");
        sb.AppendLine("# HELP node_temp Engine temperature Celsius");
        sb.AppendLine("# TYPE node_temp gauge");
        sb.AppendLine("# HELP node_fuel Fuel level percent 0-100");
        sb.AppendLine("# TYPE node_fuel gauge");
        sb.AppendLine("# HELP node_mileage Current odometer miles");
        sb.AppendLine("# TYPE node_mileage gauge");
        sb.AppendLine("# HELP node_miles_to_service Miles until next scheduled service");
        sb.AppendLine("# TYPE node_miles_to_service gauge");
        sb.AppendLine("# HELP node_status Status 1=Running 2=Maintenance 3=Retired 4=Down");
        sb.AppendLine("# TYPE node_status gauge");
        sb.AppendLine("# HELP node_jobs_30d Jobs completed last 30 days");
        sb.AppendLine("# TYPE node_jobs_30d gauge");
        sb.AppendLine("# HELP node_throughput_30d Passengers carried last 30 days");
        sb.AppendLine("# TYPE node_throughput_30d gauge");
        sb.AppendLine("# HELP node_efficiency Fuel efficiency MPG");
        sb.AppendLine("# TYPE node_efficiency gauge");
        sb.AppendLine("# HELP node_error_rate Error (delay) rate percent");
        sb.AppendLine("# TYPE node_error_rate gauge");
        sb.AppendLine("# HELP node_revenue_30d Revenue generated 30d USD");
        sb.AppendLine("# TYPE node_revenue_30d gauge");

        foreach (var bus in buses)
        {
            var id = bus.BusNumber.Value;
            var busOps = operations.Where(o => o.BusId == bus.BusId).ToList();
            var health = GetHealthPercent(bus);
            var temp = GetEngineTemp(bus, busOps.Any(o => o.OperationDate.Date == today));
            var fuel = GetFuelLevel(bus, busOps);
            var milesToService = SERVICE_INTERVAL_MILES - (bus.CurrentMileage % SERVICE_INTERVAL_MILES);
            var busFuel = busOps.Sum(o => o.FuelConsumed);
            var busDist = busOps.Sum(o => o.DistanceTraveled);
            var mpg = busFuel > 0 ? busDist / busFuel : 0;
            var errorRate = busOps.Count > 0 ? (double)busOps.Count(o => o.IsDelayed()) / busOps.Count * 100 : 0;

            sb.AppendLine($"node_health{{node=\"{id}\"}} {health:F1}");
            sb.AppendLine($"node_temp{{node=\"{id}\"}} {temp}");
            sb.AppendLine($"node_fuel{{node=\"{id}\"}} {fuel:F1}");
            sb.AppendLine($"node_mileage{{node=\"{id}\"}} {bus.CurrentMileage}");
            sb.AppendLine($"node_miles_to_service{{node=\"{id}\"}} {milesToService}");
            sb.AppendLine($"node_status{{node=\"{id}\",status=\"{bus.Status}\"}} {(int)bus.Status}");
            sb.AppendLine($"node_jobs_30d{{node=\"{id}\"}} {busOps.Count}");
            sb.AppendLine($"node_throughput_30d{{node=\"{id}\"}} {busOps.Sum(o => o.PassengerCount)}");
            sb.AppendLine($"node_efficiency{{node=\"{id}\"}} {mpg:F2}");
            sb.AppendLine($"node_error_rate{{node=\"{id}\"}} {errorRate:F1}");
            sb.AppendLine($"node_revenue_30d{{node=\"{id}\"}} {busOps.Sum(o => o.Revenue.Amount):F2}");
        }

        // ╔═══════════════════════════════════════════════════════════════╗
        // ║  OPERATOR (DRIVER) METRICS - Like SysAdmin Performance        ║
        // ╚═══════════════════════════════════════════════════════════════╝
        sb.AppendLine("\n# ═══ OPERATOR (DRIVER) METRICS ═══");
        sb.AppendLine("# HELP operator_jobs Jobs completed by operator 30d");
        sb.AppendLine("# TYPE operator_jobs gauge");
        sb.AppendLine("# HELP operator_throughput Passengers handled 30d");
        sb.AppendLine("# TYPE operator_throughput gauge");
        sb.AppendLine("# HELP operator_efficiency Operator fuel efficiency MPG");
        sb.AppendLine("# TYPE operator_efficiency gauge");
        sb.AppendLine("# HELP operator_error_rate Operator delay rate percent");
        sb.AppendLine("# TYPE operator_error_rate gauge");
        sb.AppendLine("# HELP operator_revenue Revenue generated 30d USD");
        sb.AppendLine("# TYPE operator_revenue gauge");

        var driverGroups = operations.GroupBy(o => o.DriverName).OrderByDescending(g => g.Count()).Take(15);
        foreach (var grp in driverGroups)
        {
            var name = grp.Key.Replace(" ", "_").Replace("\"", "");
            var ops = grp.ToList();
            var dFuel = ops.Sum(o => o.FuelConsumed);
            var dDist = ops.Sum(o => o.DistanceTraveled);
            var dMpg = dFuel > 0 ? dDist / dFuel : 0;
            var dErr = ops.Count > 0 ? (double)ops.Count(o => o.IsDelayed()) / ops.Count * 100 : 0;

            sb.AppendLine($"operator_jobs{{operator=\"{name}\"}} {ops.Count}");
            sb.AppendLine($"operator_throughput{{operator=\"{name}\"}} {ops.Sum(o => o.PassengerCount)}");
            sb.AppendLine($"operator_efficiency{{operator=\"{name}\"}} {dMpg:F2}");
            sb.AppendLine($"operator_error_rate{{operator=\"{name}\"}} {dErr:F1}");
            sb.AppendLine($"operator_revenue{{operator=\"{name}\"}} {ops.Sum(o => o.Revenue.Amount):F2}");
        }

        // ╔═══════════════════════════════════════════════════════════════╗
        // ║  ROUTE METRICS - Like Network Segments                        ║
        // ╚═══════════════════════════════════════════════════════════════╝
        sb.AppendLine("\n# ═══ ROUTE (NETWORK SEGMENT) METRICS ═══");
        sb.AppendLine("# HELP route_jobs Jobs on route 30d");
        sb.AppendLine("# TYPE route_jobs gauge");
        sb.AppendLine("# HELP route_throughput Passengers on route 30d");
        sb.AppendLine("# TYPE route_throughput gauge");
        sb.AppendLine("# HELP route_revenue Revenue from route 30d USD");
        sb.AppendLine("# TYPE route_revenue gauge");
        sb.AppendLine("# HELP route_error_rate Route delay rate percent");
        sb.AppendLine("# TYPE route_error_rate gauge");
        sb.AppendLine("# HELP route_avg_load Average passengers per trip");
        sb.AppendLine("# TYPE route_avg_load gauge");

        foreach (var route in routes)
        {
            var rOps = operations.Where(o => o.RouteId == route.RouteId).ToList();
            var rNum = route.RouteNumber;
            var rErr = rOps.Count > 0 ? (double)rOps.Count(o => o.IsDelayed()) / rOps.Count * 100 : 0;
            var avgLoad = rOps.Count > 0 ? (double)rOps.Sum(o => o.PassengerCount) / rOps.Count : 0;

            sb.AppendLine($"route_jobs{{route=\"{rNum}\"}} {rOps.Count}");
            sb.AppendLine($"route_throughput{{route=\"{rNum}\"}} {rOps.Sum(o => o.PassengerCount)}");
            sb.AppendLine($"route_revenue{{route=\"{rNum}\"}} {rOps.Sum(o => o.Revenue.Amount):F2}");
            sb.AppendLine($"route_error_rate{{route=\"{rNum}\"}} {rErr:F1}");
            sb.AppendLine($"route_avg_load{{route=\"{rNum}\"}} {avgLoad:F1}");
        }

        return Content(sb.ToString(), "text/plain; charset=utf-8");
    }

    // ═══ HELPER METHODS ═══

    private static double GetHealthPercent(Bus bus)
    {
        // Health = 100% right after service, decreases as mileage increases
        var milesInCycle = bus.CurrentMileage % SERVICE_INTERVAL_MILES;
        return Math.Max(0, 100.0 - (milesInCycle * 100.0 / SERVICE_INTERVAL_MILES));
    }

    private static int GetEngineTemp(Bus bus, bool isRunning)
    {
        // Simulate engine temp: idle=40C, running=75-95C, warning if health low
        if (!isRunning || bus.Status != BusStatus.Active) return 40;
        var baseTemp = 80 + _rng.Next(-5, 10);
        var healthPenalty = GetHealthPercent(bus) < 20 ? 15 : 0; // Overheating if needs service
        return Math.Min(110, baseTemp + healthPenalty);
    }

    private static double GetFuelLevel(Bus bus, List<FleetManagement.Core.Aggregates.OperationAggregate.DailyOperation> ops)
    {
        // Simulate fuel level based on recent consumption
        var todayFuel = ops.Where(o => o.OperationDate.Date == DateTime.UtcNow.Date).Sum(o => (double)o.FuelConsumed);
        var remaining = FUEL_TANK_GALLONS - (todayFuel % FUEL_TANK_GALLONS);
        return (remaining / FUEL_TANK_GALLONS) * 100;
    }

    private static bool IsHoliday(DateTime date)
    {
        // New Year, weekends, major US holidays
        if (date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday) return true;
        if (date.Month == 1 && date.Day == 1) return true; // New Year
        if (date.Month == 7 && date.Day == 4) return true; // July 4th
        if (date.Month == 12 && date.Day == 25) return true; // Christmas
        if (date.Month == 11 && date.Day >= 22 && date.Day <= 28 && date.DayOfWeek == DayOfWeek.Thursday) return true; // Thanksgiving
        return false;
    }

    private static void Gauge(StringBuilder sb, string name, string help, int val)
    {
        sb.AppendLine($"# HELP {name} {help}");
        sb.AppendLine($"# TYPE {name} gauge");
        sb.AppendLine($"{name} {val}");
    }

    private static void Gauge(StringBuilder sb, string name, string help, double val)
    {
        sb.AppendLine($"# HELP {name} {help}");
        sb.AppendLine($"# TYPE {name} gauge");
        sb.AppendLine($"{name} {val:F2}");
    }

    private static void Gauge(StringBuilder sb, string name, string help, decimal val)
    {
        sb.AppendLine($"# HELP {name} {help}");
        sb.AppendLine($"# TYPE {name} gauge");
        sb.AppendLine($"{name} {val:F2}");
    }

    [HttpGet("health")]
    public IActionResult Health() => Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
}
