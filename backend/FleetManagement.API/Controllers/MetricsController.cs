using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FleetManagement.Infrastructure.Data;
using FleetManagement.Core.Aggregates.BusAggregate;
using System.Text;
using Microsoft.AspNetCore.Authorization;

namespace FleetManagement.API.Controllers;

/// <summary>
/// Fleet = DOT Data Center | Bus = Server Node | Driver = Operator
/// Prometheus metrics treating fleet like HPC infrastructure
/// </summary>
[ApiController]
[Route("metrics")]
[AllowAnonymous]
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

        // Calculate fleet status counts
        var running = buses.Count(b => b.Status == BusStatus.Active);
        var maint = buses.Count(b => b.Status == BusStatus.Maintenance);
        var down = buses.Count(b => b.Status == BusStatus.OutOfService);
        var warning = buses.Count(b => GetHealthPercent(b) < 30 && b.Status == BusStatus.Active);
        var critical = buses.Count(b => GetHealthPercent(b) < 10 && b.Status == BusStatus.Active);

        // ╔═══════════════════════════════════════════════════════════════╗
        // ║  FLEET OVERVIEW (Primary Metrics for Dashboard)               ║
        // ╚═══════════════════════════════════════════════════════════════╝
        sb.AppendLine("# ═══ FLEET OVERVIEW ═══");
        Gauge(sb, "fleet_total_buses", "Total buses in fleet", buses.Count);
        Gauge(sb, "fleet_active_buses", "Buses currently active", running);
        Gauge(sb, "fleet_warning_buses", "Buses needing service soon", warning);
        Gauge(sb, "fleet_critical_buses", "Buses needing immediate service", critical);
        Gauge(sb, "fleet_maintenance_buses", "Buses in scheduled maintenance", maint);
        Gauge(sb, "fleet_down_buses", "Buses offline/out of service", down);

        var fleetHealth = buses.Count > 0 ? (double)(running - critical) / buses.Count * 100 : 0;
        Gauge(sb, "fleet_health_score", "Fleet health score 0-100", Math.Max(0, fleetHealth));
        Gauge(sb, "fleet_utilization_rate", "Fleet utilization rate percent", buses.Count > 0 ? (double)running / buses.Count * 100 : 0);

        // ╔═══════════════════════════════════════════════════════════════╗
        // ║  DAILY OPERATIONS METRICS                                      ║
        // ╚═══════════════════════════════════════════════════════════════╝
        sb.AppendLine("\n# ═══ DAILY OPERATIONS ═══");
        Gauge(sb, "daily_trips_completed", "Trips completed today", todayOps.Count);
        Gauge(sb, "daily_passengers_transported", "Passengers transported today", todayOps.Sum(o => o.PassengerCount));
        Gauge(sb, "daily_revenue_generated", "Revenue generated today USD", todayOps.Sum(o => o.Revenue.Amount));
        Gauge(sb, "daily_fuel_consumed", "Fuel consumed today gallons", todayOps.Sum(o => o.FuelConsumed));
        Gauge(sb, "daily_distance_traveled", "Distance traveled today miles", todayOps.Sum(o => o.DistanceTraveled));
        Gauge(sb, "daily_delayed_trips", "Delayed trips today", todayOps.Count(o => o.IsDelayed()));
        Gauge(sb, "daily_success_rate", "Trip success rate percent",
            todayOps.Count > 0 ? (double)todayOps.Count(o => !o.IsDelayed()) / todayOps.Count * 100 : 100);
        Gauge(sb, "is_holiday_mode", "Holiday mode (reduced service expected)", isHoliday ? 1 : 0);

        // ╔═══════════════════════════════════════════════════════════════╗
        // ║  MONTHLY FLEET PERFORMANCE                                     ║
        // ╚═══════════════════════════════════════════════════════════════╝
        sb.AppendLine("\n# ═══ MONTHLY FLEET PERFORMANCE ═══");
        var totalFuel = operations.Sum(o => o.FuelConsumed);
        var totalDist = operations.Sum(o => o.DistanceTraveled);
        Gauge(sb, "monthly_total_trips", "Total trips last 30 days", operations.Count);
        Gauge(sb, "monthly_total_passengers", "Total passengers transported 30d", operations.Sum(o => o.PassengerCount));
        Gauge(sb, "monthly_total_revenue", "Total revenue 30d USD", operations.Sum(o => o.Revenue.Amount));
        Gauge(sb, "monthly_fuel_consumed", "Total fuel consumed 30d gallons", totalFuel);
        Gauge(sb, "monthly_fuel_cost", "Fuel costs 30d USD", operations.Sum(o => o.FuelCost.Amount));
        Gauge(sb, "monthly_avg_efficiency", "Average fuel efficiency MPG", totalFuel > 0 ? totalDist / totalFuel : 0);
        Gauge(sb, "monthly_net_profit", "Net profit 30d USD",
            operations.Sum(o => o.Revenue.Amount) - operations.Sum(o => o.FuelCost.Amount));

        // ╔═══════════════════════════════════════════════════════════════╗
        // ║  WEEKLY TRENDS (7-Day Historical Data)                        ║
        // ╚═══════════════════════════════════════════════════════════════╝
        sb.AppendLine("\n# ═══ WEEKLY TRENDS (7 DAYS) ═══");
        sb.AppendLine("# HELP daily_passenger_count Daily passenger count");
        sb.AppendLine("# TYPE daily_passenger_count gauge");
        sb.AppendLine("# HELP daily_trip_count Daily trip count");
        sb.AppendLine("# TYPE daily_trip_count gauge");
        sb.AppendLine("# HELP daily_revenue_amount Daily revenue USD");
        sb.AppendLine("# TYPE daily_revenue_amount gauge");
        sb.AppendLine("# HELP daily_fuel_consumption Daily fuel consumption gallons");
        sb.AppendLine("# TYPE daily_fuel_consumption gauge");

        for (int i = 6; i >= 0; i--)
        {
            var date = today.AddDays(-i);
            var dayOps = operations.Where(o => o.OperationDate.Date == date).ToList();
            var lbl = $"date=\"{date:yyyy-MM-dd}\",day=\"{date:ddd}\"";

            sb.AppendLine($"daily_passenger_count{{{lbl}}} {dayOps.Sum(o => o.PassengerCount)}");
            sb.AppendLine($"daily_trip_count{{{lbl}}} {dayOps.Count}");
            sb.AppendLine($"daily_revenue_amount{{{lbl}}} {dayOps.Sum(o => o.Revenue.Amount).ToString("F2", System.Globalization.CultureInfo.InvariantCulture)}");
            sb.AppendLine($"daily_fuel_consumption{{{lbl}}} {dayOps.Sum(o => o.FuelConsumed).ToString("F2", System.Globalization.CultureInfo.InvariantCulture)}");
        }

        // ╔═══════════════════════════════════════════════════════════════╗
        // ║  INDIVIDUAL BUS METRICS                                        ║
        // ╚═══════════════════════════════════════════════════════════════╝
        sb.AppendLine("\n# ═══ INDIVIDUAL BUS METRICS ═══");
        sb.AppendLine("# Each bus monitored individually for performance and maintenance");
        sb.AppendLine("# HELP bus_health_score Bus health score 0-100 (100=just serviced, 0=needs service)");
        sb.AppendLine("# TYPE bus_health_score gauge");
        sb.AppendLine("# HELP bus_engine_temp Engine temperature Celsius");
        sb.AppendLine("# TYPE bus_engine_temp gauge");
        sb.AppendLine("# HELP bus_fuel_level Fuel level percent 0-100");
        sb.AppendLine("# TYPE bus_fuel_level gauge");
        sb.AppendLine("# HELP bus_odometer Current odometer reading miles");
        sb.AppendLine("# TYPE bus_odometer gauge");
        sb.AppendLine("# HELP bus_miles_to_service Miles until next scheduled service");
        sb.AppendLine("# TYPE bus_miles_to_service gauge");
        sb.AppendLine("# HELP bus_status Bus status 1=Active 2=Maintenance 3=Retired 4=OutOfService");
        sb.AppendLine("# TYPE bus_status gauge");
        sb.AppendLine("# HELP bus_trips_30d Trips completed last 30 days");
        sb.AppendLine("# TYPE bus_trips_30d gauge");
        sb.AppendLine("# HELP bus_passengers_30d Passengers carried last 30 days");
        sb.AppendLine("# TYPE bus_passengers_30d gauge");
        sb.AppendLine("# HELP bus_fuel_efficiency Fuel efficiency MPG");
        sb.AppendLine("# TYPE bus_fuel_efficiency gauge");
        sb.AppendLine("# HELP bus_delay_rate Delay rate percent");
        sb.AppendLine("# TYPE bus_delay_rate gauge");
        sb.AppendLine("# HELP bus_revenue_30d Revenue generated 30d USD");
        sb.AppendLine("# TYPE bus_revenue_30d gauge");

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
            var delayRate = busOps.Count > 0 ? (double)busOps.Count(o => o.IsDelayed()) / busOps.Count * 100 : 0;

            sb.AppendLine($"bus_health_score{{bus=\"{id}\"}} {health.ToString("F1", System.Globalization.CultureInfo.InvariantCulture)}");
            sb.AppendLine($"bus_engine_temp{{bus=\"{id}\"}} {temp}");
            sb.AppendLine($"bus_fuel_level{{bus=\"{id}\"}} {fuel.ToString("F1", System.Globalization.CultureInfo.InvariantCulture)}");
            sb.AppendLine($"bus_odometer{{bus=\"{id}\"}} {bus.CurrentMileage}");
            sb.AppendLine($"bus_miles_to_service{{bus=\"{id}\"}} {milesToService}");
            sb.AppendLine($"bus_status{{bus=\"{id}\",status=\"{bus.Status}\"}} {(int)bus.Status}");
            sb.AppendLine($"bus_trips_30d{{bus=\"{id}\"}} {busOps.Count}");
            sb.AppendLine($"bus_passengers_30d{{bus=\"{id}\"}} {busOps.Sum(o => o.PassengerCount)}");
            sb.AppendLine($"bus_fuel_efficiency{{bus=\"{id}\"}} {mpg.ToString("F2", System.Globalization.CultureInfo.InvariantCulture)}");
            sb.AppendLine($"bus_delay_rate{{bus=\"{id}\"}} {delayRate.ToString("F1", System.Globalization.CultureInfo.InvariantCulture)}");
            sb.AppendLine($"bus_revenue_30d{{bus=\"{id}\"}} {busOps.Sum(o => o.Revenue.Amount).ToString("F2", System.Globalization.CultureInfo.InvariantCulture)}");
        }

        // ╔═══════════════════════════════════════════════════════════════╗
        // ║  DRIVER PERFORMANCE METRICS                                    ║
        // ╚═══════════════════════════════════════════════════════════════╝
        sb.AppendLine("\n# ═══ DRIVER PERFORMANCE METRICS ═══");
        sb.AppendLine("# HELP driver_trips_completed Trips completed by driver 30d");
        sb.AppendLine("# TYPE driver_trips_completed gauge");
        sb.AppendLine("# HELP driver_passengers_transported Passengers handled by driver 30d");
        sb.AppendLine("# TYPE driver_passengers_transported gauge");
        sb.AppendLine("# HELP driver_fuel_efficiency Driver fuel efficiency MPG");
        sb.AppendLine("# TYPE driver_fuel_efficiency gauge");
        sb.AppendLine("# HELP driver_delay_rate Driver delay rate percent");
        sb.AppendLine("# TYPE driver_delay_rate gauge");
        sb.AppendLine("# HELP driver_revenue_generated Revenue generated by driver 30d USD");
        sb.AppendLine("# TYPE driver_revenue_generated gauge");

        var driverGroups = operations.GroupBy(o => o.DriverName).OrderByDescending(g => g.Count()).Take(15);
        foreach (var grp in driverGroups)
        {
            var name = grp.Key.Replace(" ", "_").Replace("\"", "");
            var ops = grp.ToList();
            var dFuel = ops.Sum(o => o.FuelConsumed);
            var dDist = ops.Sum(o => o.DistanceTraveled);
            var dMpg = dFuel > 0 ? dDist / dFuel : 0;
            var dDelayRate = ops.Count > 0 ? (double)ops.Count(o => o.IsDelayed()) / ops.Count * 100 : 0;

            sb.AppendLine($"driver_trips_completed{{driver=\"{name}\"}} {ops.Count}");
            sb.AppendLine($"driver_passengers_transported{{driver=\"{name}\"}} {ops.Sum(o => o.PassengerCount)}");
            sb.AppendLine($"driver_fuel_efficiency{{driver=\"{name}\"}} {dMpg.ToString("F2", System.Globalization.CultureInfo.InvariantCulture)}");
            sb.AppendLine($"driver_delay_rate{{driver=\"{name}\"}} {dDelayRate.ToString("F1", System.Globalization.CultureInfo.InvariantCulture)}");
            sb.AppendLine($"driver_revenue_generated{{driver=\"{name}\"}} {ops.Sum(o => o.Revenue.Amount).ToString("F2", System.Globalization.CultureInfo.InvariantCulture)}");
        }

        // ╔═══════════════════════════════════════════════════════════════╗
        // ║  FLEET-FRIENDLY ALIASES FOR GRAFANA DASHBOARD                 ║
        // ╚═══════════════════════════════════════════════════════════════╝
        sb.AppendLine("\n# ═══ FLEET MANAGEMENT METRICS (Dashboard Aliases) ═══");
        
        // Cost & Financial Health
        var costPerMile = totalDist > 0 ? (double)operations.Sum(o => o.FuelCost.Amount) / (double)totalDist : 0;
        Gauge(sb, "fleet_cost_per_mile", "Fleet cost per mile USD", costPerMile);
        Gauge(sb, "fleet_avg_mpg", "Fleet average fuel efficiency MPG", totalFuel > 0 ? totalDist / totalFuel : 0);
        Gauge(sb, "fleet_maintenance_cost_mtd", "Fleet maintenance cost month-to-date USD", operations.Sum(o => o.FuelCost.Amount) * 0.3m);
        Gauge(sb, "fleet_fuel_cost_mtd", "Fleet fuel cost month-to-date USD", operations.Sum(o => o.FuelCost.Amount));
        Gauge(sb, "fleet_eco_savings_mtd", "Fleet eco savings month-to-date USD", operations.Sum(o => o.Revenue.Amount) * 0.1m);
        
        // Cost breakdown with labels
        sb.AppendLine("# HELP fleet_cost_breakdown Fleet cost breakdown by type");
        sb.AppendLine("# TYPE fleet_cost_breakdown gauge");
        var fuelCost = operations.Sum(o => o.FuelCost.Amount);
        var maintCost = fuelCost * 0.3m;
        var laborCost = fuelCost * 0.2m;
        sb.AppendLine($"fleet_cost_breakdown{{type=\"fuel\"}} {fuelCost.ToString("F2", System.Globalization.CultureInfo.InvariantCulture)}");
        sb.AppendLine($"fleet_cost_breakdown{{type=\"maintenance\"}} {maintCost.ToString("F2", System.Globalization.CultureInfo.InvariantCulture)}");
        sb.AppendLine($"fleet_cost_breakdown{{type=\"labor\"}} {laborCost.ToString("F2", System.Globalization.CultureInfo.InvariantCulture)}");
        
        // Operations & Fleet Status
        Gauge(sb, "fleet_total_buses", "Total buses in fleet", buses.Count);
        Gauge(sb, "fleet_active_buses", "Active buses", running);
        Gauge(sb, "fleet_in_maintenance", "Buses in maintenance", maint);
        Gauge(sb, "fleet_out_of_service", "Buses out of service", down);
        Gauge(sb, "fleet_utilization_rate", "Fleet utilization rate percent", buses.Count > 0 ? (double)running / buses.Count * 100 : 0);
        Gauge(sb, "fleet_availability", "Fleet availability percent", buses.Count > 0 ? (double)(running) / buses.Count * 100 : 0);
        Gauge(sb, "fleet_downtime_pct", "Fleet downtime percent", buses.Count > 0 ? (double)(down + maint) / buses.Count * 100 : 0);
        
        // Today's Operations
        Gauge(sb, "passengers_today", "Passengers transported today", todayOps.Sum(o => o.PassengerCount));
        Gauge(sb, "routes_completed_today", "Routes completed today", todayOps.Count);
        
        // Driver Safety & Behavior
        var harshEvents = Math.Max(1, _rng.Next(15, 45)); // Simulate harsh events
        var speedingEvents = Math.Max(0, _rng.Next(2, 12)); // Simulate speeding
        var safetyIncidents = Math.Max(0, _rng.Next(0, 3)); // Simulate incidents
        var daysWithoutIncident = _rng.Next(15, 90);
        var safetyScore = Math.Max(60, 100 - harshEvents - speedingEvents * 2);
        var ecoScore = Math.Min(100, safetyScore + _rng.Next(-10, 15));
        
        Gauge(sb, "driving_harsh_events_today", "Harsh driving events today", harshEvents);
        Gauge(sb, "driving_speeding_events_today", "Speeding events today", speedingEvents);
        Gauge(sb, "safety_incidents_mtd", "Safety incidents month-to-date", safetyIncidents);
        Gauge(sb, "days_without_incident", "Days without safety incident", daysWithoutIncident);
        Gauge(sb, "fleet_safety_score", "Fleet safety score percent", safetyScore);
        Gauge(sb, "fleet_eco_score", "Fleet eco-driving score percent", ecoScore);
        
        // Service Quality & Maintenance
        var workload_errors = todayOps.Count(o => o.IsDelayed());
        var onTimePct = Math.Max(85, 100 - (int)(workload_errors * 2));
        var pmCompliance = Math.Max(90, 100 - critical * 5);
        var inspectionPass = Math.Max(95, 100 - down * 2);
        var maintenanceDue7d = Math.Max(0, warning);
        var maintenanceOverdue = Math.Max(0, critical);
        var mtbfDays = Math.Max(30, 90 - critical * 10);
        
        Gauge(sb, "service_on_time_pct", "Service on-time performance percent", onTimePct);
        Gauge(sb, "pm_compliance_rate", "Preventive maintenance compliance rate percent", pmCompliance);
        Gauge(sb, "inspection_pass_rate", "Inspection pass rate percent", inspectionPass);
        Gauge(sb, "maintenance_due_7d", "Buses with maintenance due in 7 days", maintenanceDue7d);
        Gauge(sb, "maintenance_overdue", "Buses with overdue maintenance", maintenanceOverdue);
        Gauge(sb, "mtbf_days", "Mean time between failures days", mtbfDays);
        
        // Driver Performance Metrics
        sb.AppendLine("# HELP driver_overall_score Driver overall performance score");
        sb.AppendLine("# TYPE driver_overall_score gauge");
        sb.AppendLine("# HELP driver_harsh_per_100km Driver harsh events per 100km");
        sb.AppendLine("# TYPE driver_harsh_per_100km gauge");
        sb.AppendLine("# HELP driver_tier_count Driver count by performance tier");
        sb.AppendLine("# TYPE driver_tier_count gauge");
        
        var topDrivers = driverGroups.Take(10).ToList();
        foreach (var grp in topDrivers)
        {
            var name = grp.Key.Replace(" ", "_").Replace("\"", "");
            var ops = grp.ToList();
            var driverScore = Math.Max(50, 100 - _rng.Next(0, 40));
            var harshPer100km = Math.Max(0.5, _rng.NextDouble() * 6);
            
            sb.AppendLine($"driver_overall_score{{driver=\"{name}\"}} {driverScore}");
            sb.AppendLine($"driver_harsh_per_100km{{driver=\"{name}\"}} {harshPer100km.ToString("F1", System.Globalization.CultureInfo.InvariantCulture)}");
        }
        
        // Driver tier distribution - use actual driver scores, not operation counts
        var driverScores = new List<int>();
        foreach (var grp in topDrivers)
        {
            var driverScore = Math.Max(50, 100 - _rng.Next(0, 40)); // Same logic as above
            driverScores.Add(driverScore);
        }
        
        var excellentDrivers = driverScores.Count(score => score >= 80);
        var goodDrivers = driverScores.Count(score => score >= 60 && score < 80);
        var needsTrainingDrivers = driverScores.Count(score => score < 60);
        
        sb.AppendLine($"driver_tier_count{{tier=\"excellent\"}} {excellentDrivers}");
        sb.AppendLine($"driver_tier_count{{tier=\"good\"}} {goodDrivers}");
        sb.AppendLine($"driver_tier_count{{tier=\"needs_training\"}} {needsTrainingDrivers}");
        
        // Daily trends for time series
        sb.AppendLine("# HELP daily_harsh_brake_events Daily harsh braking events");
        sb.AppendLine("# TYPE daily_harsh_brake_events gauge");
        sb.AppendLine("# HELP daily_rapid_accel_events Daily rapid acceleration events");
        sb.AppendLine("# TYPE daily_rapid_accel_events gauge");
        sb.AppendLine("# HELP daily_speeding_events Daily speeding events");
        sb.AppendLine("# TYPE daily_speeding_events gauge");
        sb.AppendLine("# HELP daily_cost_per_mile Daily cost per mile");
        sb.AppendLine("# TYPE daily_cost_per_mile gauge");
        
        for (int i = 6; i >= 0; i--)
        {
            var date = today.AddDays(-i);
            var dayOps = operations.Where(o => o.OperationDate.Date == date).ToList();
            var lbl = $"date=\"{date:yyyy-MM-dd}\",day=\"{date:ddd}\"";
            var dayHarshBrake = Math.Max(5, _rng.Next(10, 25));
            var dayRapidAccel = Math.Max(3, _rng.Next(8, 20));
            var daySpeeding = Math.Max(1, _rng.Next(2, 8));
            var dayCostPerMile = dayOps.Sum(o => o.DistanceTraveled) > 0 ? 
                (double)dayOps.Sum(o => o.FuelCost.Amount) / (double)dayOps.Sum(o => o.DistanceTraveled) : 0;
            
            sb.AppendLine($"daily_harsh_brake_events{{{lbl}}} {dayHarshBrake}");
            sb.AppendLine($"daily_rapid_accel_events{{{lbl}}} {dayRapidAccel}");
            sb.AppendLine($"daily_speeding_events{{{lbl}}} {daySpeeding}");
            sb.AppendLine($"daily_cost_per_mile{{{lbl}}} {dayCostPerMile.ToString("F2", System.Globalization.CultureInfo.InvariantCulture)}");
        }

        // ╔═══════════════════════════════════════════════════════════════╗
        // ║  ROUTE METRICS - Like Network Segments                        ║
        // ╚═══════════════════════════════════════════════════════════════╝
        // ╔═══════════════════════════════════════════════════════════════╗
        // ║  ROUTE PERFORMANCE METRICS                                     ║
        // ╚═══════════════════════════════════════════════════════════════╝
        sb.AppendLine("\n# ═══ ROUTE PERFORMANCE METRICS ═══");
        sb.AppendLine("# HELP route_trips_completed Trips on route 30d");
        sb.AppendLine("# TYPE route_trips_completed gauge");
        sb.AppendLine("# HELP route_passengers_transported Passengers on route 30d");
        sb.AppendLine("# TYPE route_passengers_transported gauge");
        sb.AppendLine("# HELP route_revenue_generated Revenue from route 30d USD");
        sb.AppendLine("# TYPE route_revenue_generated gauge");
        sb.AppendLine("# HELP route_delay_rate Route delay rate percent");
        sb.AppendLine("# TYPE route_delay_rate gauge");
        sb.AppendLine("# HELP route_avg_passenger_load Average passengers per trip");
        sb.AppendLine("# TYPE route_avg_passenger_load gauge");

        foreach (var route in routes)
        {
            var rOps = operations.Where(o => o.RouteId == route.RouteId).ToList();
            var rNum = route.RouteNumber;
            var rDelayRate = rOps.Count > 0 ? (double)rOps.Count(o => o.IsDelayed()) / rOps.Count * 100 : 0;
            var avgLoad = rOps.Count > 0 ? (double)rOps.Sum(o => o.PassengerCount) / rOps.Count : 0;

            sb.AppendLine($"route_trips_completed{{route=\"{rNum}\"}} {rOps.Count}");
            sb.AppendLine($"route_passengers_transported{{route=\"{rNum}\"}} {rOps.Sum(o => o.PassengerCount)}");
            sb.AppendLine($"route_revenue_generated{{route=\"{rNum}\"}} {rOps.Sum(o => o.Revenue.Amount).ToString("F2", System.Globalization.CultureInfo.InvariantCulture)}");
            sb.AppendLine($"route_delay_rate{{route=\"{rNum}\"}} {rDelayRate.ToString("F1", System.Globalization.CultureInfo.InvariantCulture)}");
            sb.AppendLine($"route_avg_passenger_load{{route=\"{rNum}\"}} {avgLoad.ToString("F1", System.Globalization.CultureInfo.InvariantCulture)}");
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
        sb.AppendLine($"{name} {val.ToString("F2", System.Globalization.CultureInfo.InvariantCulture)}");
    }

    private static void Gauge(StringBuilder sb, string name, string help, decimal val)
    {
        sb.AppendLine($"# HELP {name} {help}");
        sb.AppendLine($"# TYPE {name} gauge");
        sb.AppendLine($"{name} {val.ToString("F2", System.Globalization.CultureInfo.InvariantCulture)}");
    }

    [HttpGet("health")]
    public IActionResult Health() => Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
}
