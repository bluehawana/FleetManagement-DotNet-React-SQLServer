using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FleetManagement.Infrastructure.Data;
using System.Diagnostics;

namespace FleetManagement.API.Controllers;

/// <summary>
/// Health check endpoints for Kubernetes probes and monitoring
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Route("[controller]")]  // Also available at /health (without api prefix)
public class HealthController : ControllerBase
{
    private readonly FleetDbContext _dbContext;
    private readonly ILogger<HealthController> _logger;
    private static readonly DateTime _startTime = DateTime.UtcNow;

    public HealthController(FleetDbContext dbContext, ILogger<HealthController> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    /// <summary>
    /// Basic health check - Returns 200 OK if application is running
    /// </summary>
    /// <remarks>
    /// Use this for Kubernetes liveness probe.
    /// If this returns non-200, the pod will be restarted.
    /// </remarks>
    [HttpGet]
    [Route("")]
    [Route("live")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public IActionResult GetHealth()
    {
        try
        {
            var response = new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow,
                uptime = DateTime.UtcNow - _startTime,
                version = GetType().Assembly.GetName().Version?.ToString() ?? "unknown",
                environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "unknown"
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Health check failed");
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                status = "unhealthy",
                error = ex.Message
            });
        }
    }

    /// <summary>
    /// Readiness check - Returns 200 OK if application is ready to serve traffic
    /// </summary>
    /// <remarks>
    /// Use this for Kubernetes readiness probe.
    /// Checks database connectivity and other dependencies.
    /// If this returns non-200, traffic won't be routed to the pod.
    /// </remarks>
    [HttpGet("ready")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> GetReadiness(CancellationToken cancellationToken = default)
    {
        var checks = new Dictionary<string, object>();
        var isReady = true;

        try
        {
            // Check 1: Database connectivity
            var dbCheckStart = Stopwatch.GetTimestamp();
            try
            {
                await _dbContext.Database.CanConnectAsync(cancellationToken);
                var dbCheckDuration = Stopwatch.GetElapsedTime(dbCheckStart);

                checks["database"] = new
                {
                    status = "healthy",
                    responseTime = $"{dbCheckDuration.TotalMilliseconds:F2}ms"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database readiness check failed");
                checks["database"] = new
                {
                    status = "unhealthy",
                    error = ex.Message
                };
                isReady = false;
            }

            // Check 2: Database query performance
            if (isReady)
            {
                var queryCheckStart = Stopwatch.GetTimestamp();
                try
                {
                    var count = await _dbContext.Buses.CountAsync(cancellationToken);
                    var queryCheckDuration = Stopwatch.GetElapsedTime(queryCheckStart);

                    checks["database_query"] = new
                    {
                        status = "healthy",
                        responseTime = $"{queryCheckDuration.TotalMilliseconds:F2}ms",
                        recordCount = count
                    };
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Database query check failed");
                    checks["database_query"] = new
                    {
                        status = "unhealthy",
                        error = ex.Message
                    };
                    isReady = false;
                }
            }

            // Check 3: Memory usage
            var process = Process.GetCurrentProcess();
            var memoryMB = process.WorkingSet64 / 1024 / 1024;
            checks["memory"] = new
            {
                status = "healthy",
                workingSet = $"{memoryMB} MB"
            };

            var response = new
            {
                status = isReady ? "ready" : "not_ready",
                timestamp = DateTime.UtcNow,
                uptime = DateTime.UtcNow - _startTime,
                checks
            };

            return isReady
                ? Ok(response)
                : StatusCode(StatusCodes.Status503ServiceUnavailable, response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Readiness check failed");
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                status = "not_ready",
                error = ex.Message,
                checks
            });
        }
    }

    /// <summary>
    /// Startup check - Returns 200 OK when application has fully started
    /// </summary>
    /// <remarks>
    /// Use this for Kubernetes startup probe.
    /// Similar to readiness but may have higher timeout for slow-starting apps.
    /// </remarks>
    [HttpGet("startup")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> GetStartup(CancellationToken cancellationToken = default)
    {
        try
        {
            // Check if database migrations are applied
            var pendingMigrations = await _dbContext.Database.GetPendingMigrationsAsync(cancellationToken);
            var hasPendingMigrations = pendingMigrations.Any();

            // Check if database is accessible
            var canConnect = await _dbContext.Database.CanConnectAsync(cancellationToken);

            var isStarted = canConnect && !hasPendingMigrations;

            var response = new
            {
                status = isStarted ? "started" : "starting",
                timestamp = DateTime.UtcNow,
                uptime = DateTime.UtcNow - _startTime,
                checks = new
                {
                    database_connection = canConnect ? "healthy" : "unhealthy",
                    pending_migrations = hasPendingMigrations ? "yes" : "no"
                }
            };

            return isStarted
                ? Ok(response)
                : StatusCode(StatusCodes.Status503ServiceUnavailable, response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Startup check failed");
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                status = "starting",
                error = ex.Message
            });
        }
    }

    /// <summary>
    /// Detailed health status with all checks
    /// </summary>
    /// <remarks>
    /// Comprehensive health check for monitoring systems.
    /// Not recommended for Kubernetes probes due to overhead.
    /// </remarks>
    [HttpGet("status")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDetailedStatus(CancellationToken cancellationToken = default)
    {
        var checks = new Dictionary<string, object>();
        var process = Process.GetCurrentProcess();

        // Application info
        var appInfo = new
        {
            name = "Fleet Management API",
            version = GetType().Assembly.GetName().Version?.ToString() ?? "unknown",
            environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "unknown",
            dotnetVersion = Environment.Version.ToString(),
            osVersion = Environment.OSVersion.ToString(),
            machineName = Environment.MachineName,
            startTime = _startTime,
            uptime = DateTime.UtcNow - _startTime
        };

        // Database checks
        try
        {
            var dbCheckStart = Stopwatch.GetTimestamp();
            var canConnect = await _dbContext.Database.CanConnectAsync(cancellationToken);
            var dbCheckDuration = Stopwatch.GetElapsedTime(dbCheckStart);

            var busCount = await _dbContext.Buses.CountAsync(cancellationToken);
            var driverCount = await _dbContext.Drivers.CountAsync(cancellationToken);
            var routeCount = await _dbContext.Routes.CountAsync(cancellationToken);

            checks["database"] = new
            {
                status = "healthy",
                connected = canConnect,
                responseTime = $"{dbCheckDuration.TotalMilliseconds:F2}ms",
                statistics = new
                {
                    buses = busCount,
                    drivers = driverCount,
                    routes = routeCount
                }
            };
        }
        catch (Exception ex)
        {
            checks["database"] = new
            {
                status = "unhealthy",
                error = ex.Message
            };
        }

        // Memory info
        var memoryMB = process.WorkingSet64 / 1024.0 / 1024.0;
        var gcMemoryMB = GC.GetTotalMemory(false) / 1024.0 / 1024.0;

        checks["memory"] = new
        {
            status = "healthy",
            workingSet = $"{memoryMB:F2} MB",
            gcMemory = $"{gcMemoryMB:F2} MB",
            gcCollections = new
            {
                gen0 = GC.CollectionCount(0),
                gen1 = GC.CollectionCount(1),
                gen2 = GC.CollectionCount(2)
            }
        };

        // Thread pool info
        ThreadPool.GetAvailableThreads(out var availableWorkerThreads, out var availableCompletionPortThreads);
        ThreadPool.GetMaxThreads(out var maxWorkerThreads, out var maxCompletionPortThreads);

        checks["threadPool"] = new
        {
            status = "healthy",
            workerThreads = new
            {
                available = availableWorkerThreads,
                max = maxWorkerThreads,
                inUse = maxWorkerThreads - availableWorkerThreads
            },
            completionPortThreads = new
            {
                available = availableCompletionPortThreads,
                max = maxCompletionPortThreads,
                inUse = maxCompletionPortThreads - availableCompletionPortThreads
            }
        };

        var response = new
        {
            status = "healthy",
            timestamp = DateTime.UtcNow,
            application = appInfo,
            checks
        };

        return Ok(response);
    }
}
