using FleetManagement.Core.Common;

namespace FleetManagement.Core.Aggregates.BusAggregate.Events;

public sealed record BusCreatedEvent(
    int BusId,
    string BusNumber,
    string Model) : IDomainEvent
{
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}
