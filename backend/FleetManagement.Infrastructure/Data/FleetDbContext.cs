using Microsoft.EntityFrameworkCore;
using FleetManagement.Core.Aggregates.BusAggregate;
using FleetManagement.Core.Aggregates.RouteAggregate;
using FleetManagement.Core.Aggregates.OperationAggregate;
using FleetManagement.Core.Common;

namespace FleetManagement.Infrastructure.Data;

/// <summary>
/// EF Core DbContext for Fleet Management
/// </summary>
public class FleetDbContext : DbContext
{
    public FleetDbContext(DbContextOptions<FleetDbContext> options) : base(options)
    {
    }

    public DbSet<Bus> Buses { get; set; } = null!;
    public DbSet<Route> Routes { get; set; } = null!;
    public DbSet<DailyOperation> DailyOperations { get; set; } = null!;
    public DbSet<MaintenanceRecord> MaintenanceRecords { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all configurations from assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(FleetDbContext).Assembly);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Dispatch domain events before saving
        var domainEvents = ChangeTracker.Entries<AggregateRoot>()
            .Select(e => e.Entity)
            .Where(e => e.DomainEvents.Any())
            .SelectMany(e => e.DomainEvents)
            .ToList();

        // Save changes
        var result = await base.SaveChangesAsync(cancellationToken);

        // Clear domain events after saving
        foreach (var entity in ChangeTracker.Entries<AggregateRoot>().Select(e => e.Entity))
        {
            entity.ClearDomainEvents();
        }

        // TODO: Publish domain events to MediatR or event bus
        // For now, just clear them

        return result;
    }
}
