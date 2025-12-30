using FleetManagement.Core.Aggregates.RouteAggregate;

namespace FleetManagement.Core.Interfaces;

public interface IRouteRepository
{
    Task<Route?> GetByIdAsync(int routeId, CancellationToken cancellationToken = default);
    Task<Route?> GetByRouteNumberAsync(string routeNumber, CancellationToken cancellationToken = default);
    Task<IEnumerable<Route>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Route>> GetActiveRoutesAsync(CancellationToken cancellationToken = default);
    Task AddAsync(Route route, CancellationToken cancellationToken = default);
    Task UpdateAsync(Route route, CancellationToken cancellationToken = default);
    Task DeleteAsync(Route route, CancellationToken cancellationToken = default);
}
