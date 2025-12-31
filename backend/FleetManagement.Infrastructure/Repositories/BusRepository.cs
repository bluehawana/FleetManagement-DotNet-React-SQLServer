using Microsoft.EntityFrameworkCore;
using FleetManagement.Core.Aggregates.BusAggregate;
using FleetManagement.Core.Interfaces;
using FleetManagement.Core.ValueObjects;
using FleetManagement.Infrastructure.Data;

namespace FleetManagement.Infrastructure.Repositories;

public class BusRepository : IBusRepository
{
    private readonly FleetDbContext _context;

    public BusRepository(FleetDbContext context)
    {
        _context = context;
    }

    public async Task<Bus?> GetByIdAsync(int busId, CancellationToken cancellationToken = default)
    {
        return await _context.Buses
            .Include(b => b.MaintenanceRecords)
            .FirstOrDefaultAsync(b => b.BusId == busId, cancellationToken);
    }

    public async Task<Bus?> GetByBusNumberAsync(BusNumber busNumber, CancellationToken cancellationToken = default)
    {
        return await _context.Buses
            .Include(b => b.MaintenanceRecords)
            .FirstOrDefaultAsync(b => b.BusNumber == busNumber, cancellationToken);
    }

    public async Task<IEnumerable<Bus>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Buses
            .Include(b => b.MaintenanceRecords)
            .OrderBy(b => b.BusNumber.Value)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Bus>> GetByStatusAsync(BusStatus status, CancellationToken cancellationToken = default)
    {
        return await _context.Buses
            .Include(b => b.MaintenanceRecords)
            .Where(b => b.Status == status)
            .OrderBy(b => b.BusNumber)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Bus>> GetBusesRequiringMaintenanceAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        return await _context.Buses
            .Include(b => b.MaintenanceRecords)
            .Where(b => b.Status == BusStatus.Active && b.NextMaintenanceDate <= today)
            .OrderBy(b => b.NextMaintenanceDate)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Bus bus, CancellationToken cancellationToken = default)
    {
        await _context.Buses.AddAsync(bus, cancellationToken);
    }

    public Task UpdateAsync(Bus bus, CancellationToken cancellationToken = default)
    {
        _context.Buses.Update(bus);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Bus bus, CancellationToken cancellationToken = default)
    {
        _context.Buses.Remove(bus);
        return Task.CompletedTask;
    }

    public async Task<int> CountByStatusAsync(BusStatus status, CancellationToken cancellationToken = default)
    {
        return await _context.Buses
            .CountAsync(b => b.Status == status, cancellationToken);
    }
}
