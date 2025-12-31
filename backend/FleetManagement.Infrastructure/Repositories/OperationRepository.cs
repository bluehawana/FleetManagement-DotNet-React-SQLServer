using Microsoft.EntityFrameworkCore;
using FleetManagement.Core.Aggregates.OperationAggregate;
using FleetManagement.Core.Interfaces;
using FleetManagement.Infrastructure.Data;

namespace FleetManagement.Infrastructure.Repositories;

public class OperationRepository : IOperationRepository
{
    private readonly FleetDbContext _context;

    public OperationRepository(FleetDbContext context)
    {
        _context = context;
    }

    public async Task<DailyOperation?> GetByIdAsync(int operationId, CancellationToken cancellationToken = default)
    {
        return await _context.DailyOperations
            .FirstOrDefaultAsync(o => o.OperationId == operationId, cancellationToken);
    }

    public async Task<IEnumerable<DailyOperation>> GetByBusIdAsync(int busId, CancellationToken cancellationToken = default)
    {
        return await _context.DailyOperations
            .Where(o => o.BusId == busId)
            .OrderByDescending(o => o.OperationDate)
            .ThenBy(o => o.DepartureTime)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<DailyOperation>> GetByRouteIdAsync(int routeId, CancellationToken cancellationToken = default)
    {
        return await _context.DailyOperations
            .Where(o => o.RouteId == routeId)
            .OrderByDescending(o => o.OperationDate)
            .ThenBy(o => o.DepartureTime)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<DailyOperation>> GetByDateRangeAsync(
        DateTime startDate, 
        DateTime endDate, 
        CancellationToken cancellationToken = default)
    {
        return await _context.DailyOperations
            .Where(o => o.OperationDate >= startDate && o.OperationDate <= endDate)
            .OrderBy(o => o.OperationDate)
            .ThenBy(o => o.DepartureTime)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<DailyOperation>> GetDelayedOperationsAsync(
        int minDelayMinutes, 
        CancellationToken cancellationToken = default)
    {
        return await _context.DailyOperations
            .Where(o => o.DelayMinutes >= minDelayMinutes)
            .OrderByDescending(o => o.DelayMinutes)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(DailyOperation operation, CancellationToken cancellationToken = default)
    {
        await _context.DailyOperations.AddAsync(operation, cancellationToken);
    }

    public Task UpdateAsync(DailyOperation operation, CancellationToken cancellationToken = default)
    {
        _context.DailyOperations.Update(operation);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(DailyOperation operation, CancellationToken cancellationToken = default)
    {
        _context.DailyOperations.Remove(operation);
        return Task.CompletedTask;
    }
}
