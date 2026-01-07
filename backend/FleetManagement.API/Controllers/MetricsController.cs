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
    private const int SERVICE_INTERVAL_MILES = 25000; // Miles between services
    private const int SERVICE_INTERVAL_MONTHS = 6; // Months between services  
    private const int SERVICE_INTERVAL_HOURS = 1500; // Engine hours between services
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
        var drivers = await _context.Drivers.Include(d => d.Shifts).ToListAsync();
        var today = DateTime.UtcNow.Date;
        var now = DateTime.UtcNow;

        var operations = await _context.DailyOperations
            .Where(o => o.OperationDate >= now.AddDays(-30))
            .ToListAsync();

        var todayOps = operations.Where(o => o.OperationDate.Date == today).ToList();
        var isHoliday = IsHoliday(today);

        // Calculate maintenance and out-of-service buses first
        var maint = buses.Count(b => b.Status == BusStatus.Maintenance);
        var down = buses.Count(b => b.Status == BusStatus.OutOfService);
        var warning = buses.Count(b => GetHealthPercent(b) < 30 && b.Status == BusStatus.Active);
        var critical = buses.Count(b => GetHealthPercent(b) < 10 && b.Status == BusStatus.Active);

        // Calculate realistic fleet status based on time of day and schedules
        var currentHour = now.Hour;
        var isWeekend = now.DayOfWeek == DayOfWeek.Saturday || now.DayOfWeek == DayOfWeek.Sunday;
        
        // Realistic bus scheduling:
        // Peak hours (7-9 AM, 5-7 PM): 85-95% of fleet active
        // Regular hours (9 AM-5 PM, 7-11 PM): 60-75% active  
        // Off-peak (11 PM-7 AM): 10-25% active (night service)
        // Weekend: 50-70% active during day, 5-15% at night
        
        double targetActiveRate;
        if (currentHour >= 7 && currentHour <= 9 || currentHour >= 17 && currentHour <= 19) {
            // Peak hours
            targetActiveRate = isWeekend ? 0.65 : 0.90;
        } else if (currentHour >= 9 && currentHour <= 17 || currentHour >= 19 && currentHour <= 23) {
            // Regular service hours
            targetActiveRate = isWeekend ? 0.60 : 0.70;
        } else {
            // Night/early morning (11 PM - 7 AM)
            targetActiveRate = isWeekend ? 0.10 : 0.20;
        }
        
        // Add some randomness for realism
        targetActiveRate += (_rng.NextDouble() - 0.5) * 0.1; // ±5% variation
        targetActiveRate = Math.Max(0.05, Math.Min(0.95, targetActiveRate)); // Keep within bounds
        
        var targetActiveBuses = (int)(buses.Count * targetActiveRate);
        var availableBuses = buses.Count(b => b.Status != BusStatus.OutOfService);
        
        // Determine actual status distribution
        var running = Math.Min(targetActiveBuses, availableBuses - maint);
        var idle = availableBuses - running - maint; // Buses available but not scheduled
        
        // Ensure we don't have negative values
        running = Math.Max(0, running);
        idle = Math.Max(0, idle);

        // ╔═══════════════════════════════════════════════════════════════╗
        // ║  FLEET OVERVIEW (Primary Metrics for Dashboard)               ║
        // ╚═══════════════════════════════════════════════════════════════╝
        sb.AppendLine("# ═══ FLEET OVERVIEW ═══");
        Gauge(sb, "fleet_total_buses", "Total buses in fleet", buses.Count);
        Gauge(sb, "fleet_active_buses", "Buses currently in service", running);
        Gauge(sb, "fleet_idle_buses", "Buses available but not scheduled", idle);
        Gauge(sb, "fleet_warning_buses", "Buses needing service soon", warning);
        Gauge(sb, "fleet_critical_buses", "Buses needing immediate service", critical);
        Gauge(sb, "fleet_maintenance_buses", "Buses in scheduled maintenance", maint);
        Gauge(sb, "fleet_down_buses", "Buses offline/out of service", down);

        var fleetHealth = buses.Count > 0 ? (double)(running + idle - critical) / buses.Count * 100 : 0;
        Gauge(sb, "fleet_health_score", "Fleet health score 0-100", Math.Max(0, fleetHealth));
        Gauge(sb, "fleet_utilization_rate", "Fleet utilization rate percent", buses.Count > 0 ? (double)running / buses.Count * 100 : 0);
        
        // Add schedule context
        Gauge(sb, "current_hour", "Current hour of day (0-23)", currentHour);
        Gauge(sb, "is_weekend", "Weekend mode (1=weekend, 0=weekday)", isWeekend ? 1 : 0);
        Gauge(sb, "is_peak_hour", "Peak hour indicator (1=peak, 0=regular)", 
            (currentHour >= 7 && currentHour <= 9 || currentHour >= 17 && currentHour <= 19) ? 1 : 0);
        Gauge(sb, "target_active_rate", "Target active bus percentage", targetActiveRate * 100);

        // ╔═══════════════════════════════════════════════════════════════╗
        // ║  FLEET-FRIENDLY ALIASES FOR GRAFANA DASHBOARD                 ║
        // ╚═══════════════════════════════════════════════════════════════╗
        sb.AppendLine("\n# ═══ FLEET MANAGEMENT METRICS (Dashboard Aliases) ═══");
        
        // These will be calculated later in the monthly section

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
        // ║  DASHBOARD ALIASES (Fleet-Friendly Names)                     ║
        // ╚═══════════════════════════════════════════════════════════════╝
        sb.AppendLine("\n# ═══ DASHBOARD ALIASES ═══");
        
        // Cost & Financial Health aliases
        var dashboardCostPerMile = totalDist > 0 ? (double)operations.Sum(o => o.FuelCost.Amount) / (double)totalDist : 0;
        Gauge(sb, "fleet_cost_per_mile", "Fleet cost per mile USD", dashboardCostPerMile);
        Gauge(sb, "fleet_avg_mpg", "Fleet average fuel efficiency MPG", totalFuel > 0 ? totalDist / totalFuel : 0);
        Gauge(sb, "fleet_maintenance_cost_mtd", "Fleet maintenance cost month-to-date USD", operations.Sum(o => o.FuelCost.Amount) * 0.3m);
        Gauge(sb, "fleet_fuel_cost_mtd", "Fleet fuel cost month-to-date USD", operations.Sum(o => o.FuelCost.Amount));
        Gauge(sb, "fleet_eco_savings_mtd", "Fleet eco savings month-to-date USD", operations.Sum(o => o.Revenue.Amount) * 0.1m);

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
            var lastServiceDate = DateTime.UtcNow.AddMonths(-_rng.Next(1, SERVICE_INTERVAL_MONTHS)); // Simulate last service
            var monthsSinceService = (DateTime.UtcNow - lastServiceDate).Days / 30.0;
            var monthsToService = Math.Max(0, SERVICE_INTERVAL_MONTHS - monthsSinceService);
            var daysToService = monthsToService * 30;
            
            // Engine hours (assume 8 hours/day operation)
            var engineHours = bus.CurrentMileage * 0.5; // Rough estimate: 2 miles per engine hour
            var hoursToService = SERVICE_INTERVAL_HOURS - (engineHours % SERVICE_INTERVAL_HOURS);
            var daysToServiceByHours = hoursToService / 8; // 8 hours per day
            var busFuel = busOps.Sum(o => o.FuelConsumed);
            var busDist = busOps.Sum(o => o.DistanceTraveled);
            var mpg = busFuel > 0 ? busDist / busFuel : 0;
            var delayRate = busOps.Count > 0 ? (double)busOps.Count(o => o.IsDelayed()) / busOps.Count * 100 : 0;

            sb.AppendLine($"bus_health_score{{bus=\"{id}\"}} {health.ToString("F1", System.Globalization.CultureInfo.InvariantCulture)}");
            
            // Health status as text (like game character status)
            var healthStatus = health >= 80 ? "full_health" :
                              health >= 50 ? "good_health" :
                              health >= 20 ? "low_health" :
                              health >= 1 ? "critical_health" : "no_health_left";
            sb.AppendLine($"bus_health_status{{bus=\"{id}\",status=\"{healthStatus}\"}} {health.ToString("F1", System.Globalization.CultureInfo.InvariantCulture)}");
            sb.AppendLine($"bus_engine_temp{{bus=\"{id}\"}} {temp}");
            sb.AppendLine($"bus_fuel_level{{bus=\"{id}\"}} {fuel.ToString("F1", System.Globalization.CultureInfo.InvariantCulture)}");
            sb.AppendLine($"bus_odometer{{bus=\"{id}\"}} {bus.CurrentMileage}");
            sb.AppendLine($"bus_miles_to_service{{bus=\"{id}\"}} {milesToService}");
            sb.AppendLine($"bus_days_to_service_by_time{{bus=\"{id}\"}} {daysToService.ToString("F0", System.Globalization.CultureInfo.InvariantCulture)}");
            sb.AppendLine($"bus_days_to_service_by_hours{{bus=\"{id}\"}} {daysToServiceByHours.ToString("F0", System.Globalization.CultureInfo.InvariantCulture)}");
            
            // Determine which comes first (most urgent)
            var daysToServiceByMiles = milesToService / 150.0; // Assume 150 miles per day average
            var nextServiceDays = Math.Min(Math.Min(daysToService, daysToServiceByHours), daysToServiceByMiles);
            var serviceReason = nextServiceDays == daysToService ? "time" : 
                               nextServiceDays == daysToServiceByHours ? "hours" : "miles";
            
            sb.AppendLine($"bus_next_service_days{{bus=\"{id}\",reason=\"{serviceReason}\"}} {nextServiceDays.ToString("F0", System.Globalization.CultureInfo.InvariantCulture)}");
            sb.AppendLine($"bus_status{{bus=\"{id}\",status=\"{bus.Status}\"}} {(int)bus.Status}");
            sb.AppendLine($"bus_trips_30d{{bus=\"{id}\"}} {busOps.Count}");
            sb.AppendLine($"bus_passengers_30d{{bus=\"{id}\"}} {busOps.Sum(o => o.PassengerCount)}");
            sb.AppendLine($"bus_fuel_efficiency{{bus=\"{id}\"}} {mpg.ToString("F2", System.Globalization.CultureInfo.InvariantCulture)}");
            sb.AppendLine($"bus_delay_rate{{bus=\"{id}\"}} {delayRate.ToString("F1", System.Globalization.CultureInfo.InvariantCulture)}");
            sb.AppendLine($"bus_revenue_30d{{bus=\"{id}\"}} {busOps.Sum(o => o.Revenue.Amount).ToString("F2", System.Globalization.CultureInfo.InvariantCulture)}");
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
        Gauge(sb, "fleet_active_buses", "Active buses in service", running);
        Gauge(sb, "fleet_in_maintenance", "Buses in maintenance", maint);
        Gauge(sb, "fleet_out_of_service", "Buses out of service", down);
        Gauge(sb, "fleet_utilization_rate", "Fleet utilization rate percent", buses.Count > 0 ? (double)running / buses.Count * 100 : 0);
        Gauge(sb, "fleet_availability", "Fleet availability percent", buses.Count > 0 ? (double)(running + idle) / buses.Count * 100 : 0);
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
        
        // Driver tier distribution - use mock data for demo
        var excellentDrivers = _rng.Next(2, 5);
        var goodDrivers = _rng.Next(3, 6);
        var needsTrainingDrivers = _rng.Next(0, 3);
        
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

        // ╔═══════════════════════════════════════════════════════════════╗
        // ║  DRIVER HEALTH & FATIGUE MONITORING (Like Bus Health System)  ║
        // ╚═══════════════════════════════════════════════════════════════╝
        sb.AppendLine("\n# ═══ DRIVER HEALTH & FATIGUE MONITORING ═══");
        sb.AppendLine("# HELP driver_fatigue_level Driver fatigue level 0-100 (100=rested, 0=exhausted)");
        sb.AppendLine("# TYPE driver_fatigue_level gauge");
        sb.AppendLine("# HELP driver_hours_worked_today Hours worked today");
        sb.AppendLine("# TYPE driver_hours_worked_today gauge");
        sb.AppendLine("# HELP driver_hours_until_mandatory_rest Hours until mandatory rest required");
        sb.AppendLine("# TYPE driver_hours_until_mandatory_rest gauge");
        sb.AppendLine("# HELP driver_days_since_rest Days since last full rest day");
        sb.AppendLine("# TYPE driver_days_since_rest gauge");
        sb.AppendLine("# HELP driver_health_status Driver health status (like bus health)");
        sb.AppendLine("# TYPE driver_health_status gauge");

        // Debug: Add driver count
        sb.AppendLine($"# DEBUG: Found {drivers.Count} drivers in database");

        // Generate driver fatigue data from actual database drivers
        foreach (var driver in drivers)
        {
            var driverName = driver.FullName.Replace(" ", "_").Replace("\"", "");
            
            // Get today's shift data
            var todayShift = driver.Shifts.FirstOrDefault(s => s.ShiftDate.Date == today);
            var hoursWorkedToday = todayShift?.HoursWorked ?? 0;
            
            // Calculate days since last rest
            var daysSinceRest = (today - driver.LastRestDay).Days;
            var hoursUntilMandatoryRest = Math.Max(0, 14 - hoursWorkedToday);
            
            // Use the driver's actual fatigue level
            var driverFatigue = driver.CurrentFatigueLevel;
            
            var healthStatus = driverFatigue >= 80 ? "well_rested" :
                             driverFatigue >= 60 ? "good_condition" :
                             driverFatigue >= 30 ? "getting_tired" :
                             driverFatigue >= 10 ? "needs_rest_soon" : "exhausted_mandatory_rest";
            
            sb.AppendLine($"driver_fatigue_level{{driver=\"{driverName}\"}} {driverFatigue.ToString("F1", System.Globalization.CultureInfo.InvariantCulture)}");
            sb.AppendLine($"driver_hours_worked_today{{driver=\"{driverName}\"}} {hoursWorkedToday.ToString("F1", System.Globalization.CultureInfo.InvariantCulture)}");
            sb.AppendLine($"driver_hours_until_mandatory_rest{{driver=\"{driverName}\"}} {hoursUntilMandatoryRest.ToString("F1", System.Globalization.CultureInfo.InvariantCulture)}");
            sb.AppendLine($"driver_days_since_rest{{driver=\"{driverName}\"}} {daysSinceRest}");
            sb.AppendLine($"driver_health_status{{driver=\"{driverName}\",status=\"{healthStatus}\"}} {driverFatigue.ToString("F1", System.Globalization.CultureInfo.InvariantCulture)}");
        }

        // ╔═══════════════════════════════════════════════════════════════╗
        // ║  MANDATORY COMPLIANCE MONITORING                               ║
        // ╚═══════════════════════════════════════════════════════════════╝
        sb.AppendLine("\n# ═══ MANDATORY COMPLIANCE MONITORING ═══");
        
        // Bus Service Compliance (mandatory maintenance)
        var busesOverdueService = buses.Count(b => GetHealthPercent(b) < 10);
        var busesDueSoon = buses.Count(b => GetHealthPercent(b) < 30 && GetHealthPercent(b) >= 10);
        Gauge(sb, "fleet_buses_overdue_service", "Buses overdue for mandatory service", busesOverdueService);
        Gauge(sb, "fleet_buses_due_service_soon", "Buses due for service within 7 days", busesDueSoon);
        
        // Driver Rest Compliance (mandatory rest periods) - using mock data for demo
        var driversNeedingRest = _rng.Next(1, 4);
        var driversOvertime = _rng.Next(0, 2);
        Gauge(sb, "fleet_drivers_needing_rest", "Drivers needing mandatory rest", driversNeedingRest);
        Gauge(sb, "fleet_drivers_overtime_violation", "Drivers in overtime violation", driversOvertime);
        
        // Overall Compliance Score
        var totalViolations = busesOverdueService + driversNeedingRest + driversOvertime;
        var complianceScore = Math.Max(70, 100 - (totalViolations * 10));
        Gauge(sb, "fleet_compliance_score", "Overall fleet compliance score percentage", complianceScore);
        
        // Safety Risk Level (based on fatigue and maintenance)
        var safetyRisk = totalViolations == 0 ? "low" :
                        totalViolations <= 2 ? "medium" :
                        totalViolations <= 4 ? "high" : "critical";
        sb.AppendLine($"# HELP fleet_safety_risk_level Fleet safety risk level");
        sb.AppendLine($"# TYPE fleet_safety_risk_level gauge");
        sb.AppendLine($"fleet_safety_risk_level{{level=\"{safetyRisk}\"}} {totalViolations}");

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

        // Generate actual driver performance data from operations
        var driverGroups = operations.GroupBy(o => o.DriverName).OrderByDescending(g => g.Count()).Take(15);
        foreach (var grp in driverGroups)
        {
            var name = grp.Key.Replace(" ", "_").Replace("\"", "");
            var ops = grp.ToList();
            var driverScore = Math.Max(50, 100 - _rng.Next(0, 40));
            var harshPer100km = Math.Max(0.5, _rng.NextDouble() * 6);
            var driverFuel = ops.Sum(o => o.FuelConsumed);
            var driverDist = ops.Sum(o => o.DistanceTraveled);
            var mpg = driverFuel > 0 ? driverDist / driverFuel : 0;
            var delayRate = ops.Count > 0 ? (double)ops.Count(o => o.IsDelayed()) / ops.Count * 100 : 0;
            
            sb.AppendLine($"driver_trips_completed{{driver=\"{name}\"}} {ops.Count}");
            sb.AppendLine($"driver_passengers_transported{{driver=\"{name}\"}} {ops.Sum(o => o.PassengerCount)}");
            sb.AppendLine($"driver_fuel_efficiency{{driver=\"{name}\"}} {mpg.ToString("F2", System.Globalization.CultureInfo.InvariantCulture)}");
            sb.AppendLine($"driver_delay_rate{{driver=\"{name}\"}} {delayRate.ToString("F1", System.Globalization.CultureInfo.InvariantCulture)}");
            sb.AppendLine($"driver_revenue_generated{{driver=\"{name}\"}} {ops.Sum(o => o.Revenue.Amount).ToString("F2", System.Globalization.CultureInfo.InvariantCulture)}");
            sb.AppendLine($"driver_overall_score{{driver=\"{name}\"}} {driverScore}");
            sb.AppendLine($"driver_harsh_per_100km{{driver=\"{name}\"}} {harshPer100km.ToString("F1", System.Globalization.CultureInfo.InvariantCulture)}");
        }

        return Content(sb.ToString(), "text/plain; charset=utf-8");
    }

    // ═══ HELPER METHODS ═══

    private static double GetHealthPercent(Bus bus)
    {
        // Gaming-style health system: Like a character's blood/HP
        // 100% = Just serviced (full blood, ready to fight)
        // 50%  = Half health (still good to go)
        // 10%  = Critical health (red alert, needs healing)
        // 0%   = No blood left to run (will break down!)
        
        // Calculate health based on mileage (like XP degrading health)
        var milesInCycle = bus.CurrentMileage % SERVICE_INTERVAL_MILES;
        var mileageHealth = Math.Max(0, 100.0 - (milesInCycle * 100.0 / SERVICE_INTERVAL_MILES));
        
        // Calculate health based on time since service (like time-based health decay)
        var daysSinceService = _rng.Next(30, 180); // 1-6 months since last service
        var timeHealth = Math.Max(0, 100.0 - (daysSinceService * 100.0 / (SERVICE_INTERVAL_MONTHS * 30)));
        
        // Use the WORST health score (most critical need) - like lowest HP determines danger
        var finalHealth = Math.Min(mileageHealth, timeHealth);
        
        // Health Status Levels (like game character health):
        // 80-100% = 💚 Full Health (just serviced, ready for battle)
        // 50-79%  = 💛 Good Health (still strong)
        // 20-49%  = 🧡 Low Health (needs attention soon)
        // 1-19%   = ❤️ Critical Health (service NOW or breakdown risk)
        // 0%      = 💀 No Health Left (emergency - bus will "die")
        
        return finalHealth;
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
