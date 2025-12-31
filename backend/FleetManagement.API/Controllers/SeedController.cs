using Microsoft.AspNetCore.Mvc;
using FleetManagement.Infrastructure.Data;

namespace FleetManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeedController : ControllerBase
{
    private readonly FleetDbContext _context;
    private readonly ILogger<SeedController> _logger;

    public SeedController(FleetDbContext context, ILogger<SeedController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Seed database with realistic mock data based on US DOT analysis
    /// </summary>
    /// <remarks>
    /// This endpoint populates the database with:
    /// - 20 buses (small city fleet)
    /// - 10 routes
    /// - 90 days of daily operations (~5,400 trips)
    /// - Historical maintenance records
    /// 
    /// Data is based on real US DOT statistics:
    /// - Average diesel price: $3.12/gallon
    /// - Average fuel efficiency: 6.0 MPG
    /// - Average ridership patterns
    /// - Realistic cost structures
    /// </remarks>
    [HttpPost("mock-data")]
    [ProducesResponseType(typeof(SeedResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SeedMockData()
    {
        try
        {
            if (_context.Buses.Any())
            {
                return BadRequest(new { error = "Database already contains data. Clear database first or use force=true" });
            }

            var seeder = new MockDataSeeder(_context);
            await seeder.SeedAsync();

            var result = new SeedResult
            {
                Success = true,
                Message = "Database seeded successfully with realistic mock data",
                BusesCreated = _context.Buses.Count(),
                RoutesCreated = _context.Routes.Count(),
                OperationsCreated = _context.DailyOperations.Count(),
                MaintenanceRecordsCreated = _context.MaintenanceRecords.Count()
            };

            _logger.LogInformation("Database seeded: {Buses} buses, {Routes} routes, {Operations} operations",
                result.BusesCreated, result.RoutesCreated, result.OperationsCreated);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding database");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Clear all data from database (use with caution!)
    /// </summary>
    [HttpDelete("clear-data")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ClearData()
    {
        try
        {
            _context.DailyOperations.RemoveRange(_context.DailyOperations);
            _context.MaintenanceRecords.RemoveRange(_context.MaintenanceRecords);
            _context.Buses.RemoveRange(_context.Buses);
            _context.Routes.RemoveRange(_context.Routes);
            
            await _context.SaveChangesAsync();

            _logger.LogWarning("Database cleared");

            return Ok(new { message = "Database cleared successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing database");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get database statistics
    /// </summary>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(DatabaseStats), StatusCodes.Status200OK)]
    public IActionResult GetStats()
    {
        var stats = new DatabaseStats
        {
            TotalBuses = _context.Buses.Count(),
            TotalRoutes = _context.Routes.Count(),
            TotalOperations = _context.DailyOperations.Count(),
            TotalMaintenanceRecords = _context.MaintenanceRecords.Count(),
            OldestOperation = _context.DailyOperations.Any() 
                ? _context.DailyOperations.Min(o => o.OperationDate) 
                : (DateTime?)null,
            NewestOperation = _context.DailyOperations.Any() 
                ? _context.DailyOperations.Max(o => o.OperationDate) 
                : (DateTime?)null
        };

        return Ok(stats);
    }
}

public record SeedResult
{
    public bool Success { get; init; }
    public string Message { get; init; } = string.Empty;
    public int BusesCreated { get; init; }
    public int RoutesCreated { get; init; }
    public int OperationsCreated { get; init; }
    public int MaintenanceRecordsCreated { get; init; }
}

public record DatabaseStats
{
    public int TotalBuses { get; init; }
    public int TotalRoutes { get; init; }
    public int TotalOperations { get; init; }
    public int TotalMaintenanceRecords { get; init; }
    public DateTime? OldestOperation { get; init; }
    public DateTime? NewestOperation { get; init; }
}
