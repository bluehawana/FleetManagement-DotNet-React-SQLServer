using FleetManagement.Core.Aggregates.BusAggregate;
using FleetManagement.Core.Aggregates.RouteAggregate;
using FleetManagement.Core.Aggregates.OperationAggregate;
using FleetManagement.Core.Aggregates.DriverAggregate;
using FleetManagement.Core.ValueObjects;
using System.Reflection;

namespace FleetManagement.Infrastructure.Data;

/// <summary>
/// Seeds database with realistic mock data based on US DOT analysis
/// Data insights from our Day 1 analysis:
/// - Average bus ridership: 330M passengers/month
/// - Average diesel price: $3.12/gallon
/// - Average fuel efficiency: 6.0 MPG for buses
/// - COVID impact: -48.5% ridership drop
/// - Small city fleet: 20 buses, $312K/year fuel cost
/// </summary>
public class MockDataSeeder
{
    private readonly FleetDbContext _context;
    private readonly Random _random = new();

    public MockDataSeeder(FleetDbContext context)
    {
        _context = context;
    }

    public async Task SeedAsync()
    {
        // Check if already seeded
        if (_context.Buses.Any())
        {
            return;
        }

        Console.WriteLine("🌱 Seeding database with realistic mock data based on US DOT analysis...");

        // Seed buses (20 buses for small city fleet)
        var buses = await SeedBusesAsync();
        Console.WriteLine($"✅ Created {buses.Count} buses");

        // Seed routes (10 routes)
        var routes = await SeedRoutesAsync();
        Console.WriteLine($"✅ Created {routes.Count} routes");

        // Seed drivers (15 drivers)
        var drivers = await SeedDriversAsync();
        Console.WriteLine($"✅ Created {drivers.Count} drivers");

        // IMPORTANT: Save buses, routes, and drivers first to get their IDs
        await _context.SaveChangesAsync();
        Console.WriteLine("✅ Saved buses, routes, and drivers to database");

        // Seed operations (last 90 days of data) - now buses/routes have valid IDs
        var operations = await SeedOperationsAsync(buses, routes, drivers);
        Console.WriteLine($"✅ Created {operations.Count} daily operations");

        // Seed driver shifts (last 30 days)
        var shiftsCount = await SeedDriverShiftsAsync(drivers);
        Console.WriteLine($"✅ Created {shiftsCount} driver shifts");

        // Seed maintenance records
        var maintenanceCount = await SeedMaintenanceRecordsAsync(buses);
        Console.WriteLine($"✅ Created {maintenanceCount} maintenance records");

        await _context.SaveChangesAsync();
        Console.WriteLine("🎉 Database seeding complete!");
    }

    private async Task<List<Bus>> SeedBusesAsync()
    {
        var buses = new List<Bus>();
        var busModels = new[]
        {
            "Volvo 7900 Electric",
            "New Flyer Xcelsior",
            "Gillig Low Floor",
            "Nova Bus LFS",
            "BYD K9 Electric"
        };

        for (int i = 1; i <= 20; i++)
        {
            var busNumberResult = BusNumber.Create($"BUS-{i:D3}");
            var priceResult = Money.Create(_random.Next(350000, 550000), "USD");

            var year = DateTime.UtcNow.Year - _random.Next(0, 8); // 0-8 years old
            var purchaseDate = DateTime.SpecifyKind(new DateTime(year, _random.Next(1, 13), _random.Next(1, 28)), DateTimeKind.Utc);

            var busResult = Bus.Create(
                busNumberResult.Value,
                busModels[_random.Next(busModels.Length)],
                year,
                capacity: _random.Next(40, 80),
                fuelTankCapacity: _random.Next(100, 200),
                purchaseDate,
                priceResult.Value
            );

            if (busResult.IsSuccess)
            {
                var bus = busResult.Value;

                // Set realistic mileage based on age
                var yearsOld = DateTime.UtcNow.Year - year;
                var mileage = yearsOld * _random.Next(15000, 25000); // 15K-25K miles/year
                bus.UpdateMileage(mileage);

                // Fix maintenance dates to be realistic for current operations
                // Use reflection to set realistic maintenance dates
                var lastMaintenanceDate = DateTime.UtcNow.AddDays(-_random.Next(1, 90)); // Last 1-90 days
                var nextMaintenanceDate = DateTime.UtcNow.AddDays(_random.Next(7, 120)); // Next 7-120 days
                
                var busType = typeof(Bus);
                var lastMaintenanceProp = busType.GetProperty("LastMaintenanceDate");
                var nextMaintenanceProp = busType.GetProperty("NextMaintenanceDate");
                
                if (lastMaintenanceProp != null && nextMaintenanceProp != null)
                {
                    lastMaintenanceProp.SetValue(bus, lastMaintenanceDate);
                    nextMaintenanceProp.SetValue(bus, nextMaintenanceDate);
                }

                // Some buses in maintenance (10%)
                if (_random.Next(100) < 10)
                {
                    bus.ScheduleMaintenance(
                        DateTime.UtcNow.AddDays(_random.Next(1, 7)),
                        "Routine",
                        "Scheduled maintenance"
                    );
                }

                buses.Add(bus);
            }
        }

        await _context.Buses.AddRangeAsync(buses);
        return buses;
    }

    private async Task<List<Route>> SeedRoutesAsync()
    {
        var routes = new List<Route>();
        var routeData = new[]
        {
            ("R-101", "Downtown Express", 12.5m, 45, 15, "City Center", "North Station"),
            ("R-102", "Airport Shuttle", 18.3m, 60, 8, "Downtown", "Airport"),
            ("R-103", "University Line", 8.7m, 35, 12, "Main Campus", "Medical Center"),
            ("R-104", "Suburban Loop", 22.1m, 75, 20, "City Center", "Westside Mall"),
            ("R-105", "Beach Route", 15.4m, 50, 10, "Downtown", "Beach Park"),
            ("R-106", "Industrial Park", 10.2m, 40, 8, "Transit Hub", "Industrial Zone"),
            ("R-107", "Hospital Connector", 6.8m, 25, 6, "Downtown", "General Hospital"),
            ("R-108", "Shopping District", 9.3m, 35, 14, "City Center", "Shopping Mall"),
            ("R-109", "Residential Express", 14.6m, 55, 18, "Downtown", "Residential Area"),
            ("R-110", "Night Owl", 20.5m, 70, 12, "City Center", "Entertainment District")
        };

        foreach (var (number, name, distance, duration, stops, start, end) in routeData)
        {
            // Calculate fuel cost based on US DOT data: $3.12/gallon, 6.0 MPG average
            var fuelNeeded = distance / 6.0m; // MPG
            var fuelCost = fuelNeeded * 3.12m; // Price per gallon
            var estimatedCostResult = Money.Create(fuelCost, "USD");

            var routeResult = Route.Create(
                number,
                name,
                distance,
                duration,
                stops,
                start,
                end,
                estimatedCostResult.Value
            );

            if (routeResult.IsSuccess)
            {
                routes.Add(routeResult.Value);
            }
        }

        await _context.Routes.AddRangeAsync(routes);
        return routes;
    }

    private async Task<List<DailyOperation>> SeedOperationsAsync(List<Bus> buses, List<Route> routes, List<Driver> drivers)
    {
        var operations = new List<DailyOperation>();
        var startDate = DateTime.SpecifyKind(DateTime.UtcNow.AddDays(-90).Date, DateTimeKind.Utc);
        var endDate = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc);

        // Based on US DOT data: Average 330M passengers/month nationally
        // For small city (20 buses): ~50-80 passengers per trip average

        for (var date = startDate; date <= endDate; date = date.AddDays(1))
        {
            // Each bus does 4-6 trips per day
            foreach (var bus in buses.Where(b => b.Status == BusStatus.Active))
            {
                var tripsPerDay = _random.Next(4, 7);

                for (int trip = 0; trip < tripsPerDay; trip++)
                {
                    var route = routes[_random.Next(routes.Count)];

                    // Trip timing
                    var departureHour = trip switch
                    {
                        0 => _random.Next(6, 8),   // Morning rush
                        1 => _random.Next(9, 11),  // Mid-morning
                        2 => _random.Next(12, 14), // Lunch
                        3 => _random.Next(15, 17), // Afternoon
                        4 => _random.Next(17, 19), // Evening rush
                        _ => _random.Next(19, 22)  // Evening
                    };

                    var departureTime = new TimeSpan(departureHour, _random.Next(0, 60), 0);
                    var arrivalTime = departureTime.Add(TimeSpan.FromMinutes(route.EstimatedDuration + _random.Next(-5, 15)));

                    // Passenger count based on time of day and day of week
                    var isRushHour = departureHour is >= 7 and <= 9 or >= 16 and <= 18;
                    var isWeekend = date.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday;

                    var basePassengers = isRushHour ? 65 : 45;
                    if (isWeekend) basePassengers = (int)(basePassengers * 0.6); // 40% less on weekends

                    var passengerCount = Math.Min(
                        bus.Capacity,
                        basePassengers + _random.Next(-20, 20)
                    );

                    // Fuel consumption based on US DOT data: 6.0 MPG average
                    var fuelEfficiency = 6.0m + (decimal)(_random.NextDouble() * 2 - 1); // 5.0-7.0 MPG
                    var fuelConsumed = route.Distance / fuelEfficiency;

                    // Fuel cost: $3.12/gallon average from US DOT data
                    var dieselPrice = 3.12m + (decimal)(_random.NextDouble() * 0.5 - 0.25); // $2.87-$3.37
                    var fuelCostAmount = fuelConsumed * dieselPrice;
                    var fuelCostResult = Money.Create(fuelCostAmount, "USD");

                    // Revenue: $2.50 per passenger average
                    var revenueAmount = passengerCount * 2.50m;
                    var revenueResult = Money.Create(revenueAmount, "USD");

                    // Delays (10% of trips have delays)
                    var delayMinutes = _random.Next(100) < 10 ? _random.Next(5, 30) : 0;

                    var operationResult = DailyOperation.Create(
                        bus.BusId,
                        route.RouteId,
                        date,
                        departureTime,
                        arrivalTime,
                        passengerCount,
                        fuelConsumed,
                        route.Distance,
                        delayMinutes,
                        drivers[_random.Next(drivers.Count)].FullName,
                        revenueResult.Value,
                        fuelCostResult.Value,
                        null
                    );

                    if (operationResult.IsSuccess)
                    {
                        operations.Add(operationResult.Value);
                    }
                }
            }
        }

        await _context.DailyOperations.AddRangeAsync(operations);
        return operations;
    }

    private async Task<int> SeedMaintenanceRecordsAsync(List<Bus> buses)
    {
        var count = 0;
        var maintenanceTypes = new[] { "Routine", "Repair", "Inspection", "Emergency" };
        var mechanics = new[] { "Mike's Auto", "City Garage", "Fleet Services", "Quick Fix" };

        foreach (var bus in buses)
        {
            // Add 2-5 historical maintenance records per bus
            var recordCount = _random.Next(2, 6);

            for (int i = 0; i < recordCount; i++)
            {
                var daysAgo = _random.Next(30, 365);
                var maintenanceDate = DateTime.UtcNow.AddDays(-daysAgo);

                var costAmount = _random.Next(500, 3000);
                var costResult = Money.Create(costAmount, "USD");

                var recordResult = MaintenanceRecord.Create(
                    bus.BusId,
                    maintenanceDate,
                    maintenanceTypes[_random.Next(maintenanceTypes.Length)],
                    "Regular maintenance service",
                    costResult.Value,
                    bus.CurrentMileage - _random.Next(1000, 10000),
                    mechanics[_random.Next(mechanics.Length)],
                    "Oil, filters, brake pads",
                    _random.Next(2, 8),
                    false
                );

                if (recordResult.IsSuccess)
                {
                    // Access private field through reflection (for seeding only)
                    var maintenanceRecordsField = typeof(Bus)
                        .GetField("_maintenanceRecords", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);

                    if (maintenanceRecordsField != null)
                    {
                        var records = maintenanceRecordsField.GetValue(bus) as List<MaintenanceRecord>;
                        records?.Add(recordResult.Value);
                        count++;
                    }
                }
            }
        }

        return count;
    }

    private async Task<List<Driver>> SeedDriversAsync()
    {
        var drivers = new List<Driver>();

        // Fixed list of 15 unique American driver names
        var driverNames = new[]
        {
            ("James", "Thompson"),
            ("Michael", "Anderson"),
            ("Robert", "Martinez"),
            ("William", "Garcia"),
            ("David", "Wilson"),
            ("John", "Davis"),
            ("Richard", "Brown"),
            ("Joseph", "Miller"),
            ("Thomas", "Johnson"),
            ("Christopher", "Smith"),
            ("Daniel", "Rodriguez"),
            ("Matthew", "Lopez"),
            ("Joshua", "Hernandez"),
            ("Steven", "Taylor"),
            ("Kevin", "Jackson")
        };

        for (int i = 1; i <= 15; i++)
        {
            var (firstName, lastName) = driverNames[i - 1];
            var driverNumber = $"DRV-{i:D3}";
            var licenseNumber = $"CDL-{_random.Next(100000, 999999)}";
            var hireDate = DateTime.UtcNow.AddDays(-_random.Next(30, 1825)); // Hired 1 month to 5 years ago

            var driver = new Driver(
                DriverId.New(),
                driverNumber,
                firstName,
                lastName,
                licenseNumber,
                hireDate
            );

            // Set realistic fatigue levels and rest days
            var daysSinceRest = _random.Next(0, 6); // 0-6 days since last rest
            var lastRestDay = DateTime.SpecifyKind(DateTime.UtcNow.Date.AddDays(-daysSinceRest), DateTimeKind.Utc);
            
            // Use reflection to set private properties for seeding
            var driverType = typeof(Driver);
            var lastRestDayProp = driverType.GetProperty("LastRestDay");
            if (lastRestDayProp != null)
            {
                lastRestDayProp.SetValue(driver, lastRestDay);
            }

            // Update fatigue level based on recent activity
            driver.UpdateFatigueLevel();

            drivers.Add(driver);
        }

        await _context.Drivers.AddRangeAsync(drivers);
        return drivers;
    }

    private async Task<int> SeedDriverShiftsAsync(List<Driver> drivers)
    {
        var count = 0;
        var startDate = DateTime.SpecifyKind(DateTime.UtcNow.AddDays(-30).Date, DateTimeKind.Utc);
        var endDate = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc);

        foreach (var driver in drivers)
        {
            for (var date = startDate; date <= endDate; date = date.AddDays(1))
            {
                // Skip some days (rest days, weekends, etc.)
                if (_random.Next(100) < 15) continue; // 15% chance of no shift

                // Realistic shift hours: 6-12 hours per day
                var hoursWorked = 6 + (_random.NextDouble() * 6); // 6-12 hours
                
                // DOT violation simulation (rare)
                if (_random.Next(100) < 2) // 2% chance
                {
                    hoursWorked = 14 + (_random.NextDouble() * 2); // 14-16 hours (violation)
                }

                var tripsCompleted = (int)(hoursWorked * _random.Next(4, 8) / 8); // 4-8 trips per 8-hour shift
                var fuelUsed = tripsCompleted * (15 + _random.NextDouble() * 10); // 15-25 gallons per trip

                driver.AddShift(date, hoursWorked, tripsCompleted, fuelUsed);
                count++;
            }

            // Update fatigue after adding all shifts
            driver.UpdateFatigueLevel();
        }

        return count;
    }
}