using Microsoft.EntityFrameworkCore;
using FleetManagement.Core.Aggregates.RouteAggregate;
using FleetManagement.Core.Interfaces;
using FleetManagement.Infrastructure.Data;

namespace FleetManagement.Infrastructure.Repositories;

public class RouteRepository : IRouteRepository
{
    private readonly FleetDbContext _context;

    public RouteRepository(FleetDbContext context)
    {
        _context = context;
    }

    public async Task<Route?> GetByIdAsync(int routeId, CancellationToken cancellationToken = default)
    {
        return await _context.Routes
            .FirstOrDefaultAsync(r => r.RouteId == routeId, cancellationToken);
    }

    public async Task<Route?> GetByRouteNumberAsync(string routeNumber, CancellationToken cancellationToken = default)
    {
        return await _context.Routes
            .FirstOrDefaultAsync(r => r.RouteNumber == routeNumber, cancellationToken);
    }

    public async Task<IEnumerable<Route>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Routes
            .OrderBy(r => r.RouteNumber)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Route>> GetActiveRoutesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Routes
            .Where(r => r.IsActive)
            .OrderBy(r => r.RouteNumber)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Route route, CancellationToken cancellationToken = default)
    {
        await _context.Routes.AddAsync(route, cancellationToken);
    }

    public Task UpdateAsync(Route route, CancellationToken cancellationToken = default)
    {
        _context.Routes.Update(route);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Route route, CancellationToken cancellationToken = default)
    {
        _context.Routes.Remove(route);
        return Task.CompletedTask;
    }
}
