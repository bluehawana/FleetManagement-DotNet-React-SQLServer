using FleetManagement.Core.Aggregates.OperationAggregate;

namespace FleetManagement.Core.Interfaces;

public interface IOperationRepository
{
    Task<DailyOperation?> GetByIdAsync(int operationId, CancellationToken cancellationToken = default);
    Task<IEnumerable<DailyOperation>> GetByBusIdAsync(int busId, CancellationToken cancellationToken = default);
    Task<IEnumerable<DailyOperation>> GetByRouteIdAsync(int routeId, CancellationToken cancellationToken = default);
    Task<IEnumerable<DailyOperation>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    Task<IEnumerable<DailyOperation>> GetDelayedOperationsAsync(int minDelayMinutes, CancellationToken cancellationToken = default);
    Task AddAsync(DailyOperation operation, CancellationToken cancellationToken = default);
    Task UpdateAsync(DailyOperation operation, CancellationToken cancellationToken = default);
    Task DeleteAsync(DailyOperation operation, CancellationToken cancellationToken = default);
}
