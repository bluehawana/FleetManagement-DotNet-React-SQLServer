using FleetManagement.Core.Aggregates.BusAggregate;
using FleetManagement.Core.ValueObjects;

namespace FleetManagement.Core.Interfaces;

/// <summary>
/// Repository interface for Bus aggregate
/// </summary>
public interface IBusRepository
{
    Task<Bus?> GetByIdAsync(int busId, CancellationToken cancellationToken = default);
    Task<Bus?> GetByBusNumberAsync(BusNumber busNumber, CancellationToken cancellationToken = default);
    Task<IEnumerable<Bus>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Bus>> GetByStatusAsync(BusStatus status, CancellationToken cancellationToken = default);
    Task<IEnumerable<Bus>> GetBusesRequiringMaintenanceAsync(CancellationToken cancellationToken = default);
    Task AddAsync(Bus bus, CancellationToken cancellationToken = default);
    Task UpdateAsync(Bus bus, CancellationToken cancellationToken = default);
    Task DeleteAsync(Bus bus, CancellationToken cancellationToken = default);
    Task<int> CountByStatusAsync(BusStatus status, CancellationToken cancellationToken = default);
}
