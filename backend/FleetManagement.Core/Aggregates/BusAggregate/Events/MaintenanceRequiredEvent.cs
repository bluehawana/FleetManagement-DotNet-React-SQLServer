using FleetManagement.Core.Common;

namespace FleetManagement.Core.Aggregates.BusAggregate.Events;

public sealed record MaintenanceRequiredEvent(
    int BusId,
    string BusNumber,
    int CurrentMileage) : IDomainEvent
{
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}

public sealed record MaintenanceScheduledEvent(
    int BusId,
    string BusNumber,
    DateTime ScheduledDate,
    string MaintenanceType) : IDomainEvent
{
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}

public sealed record MaintenanceCompletedEvent(
    int BusId,
    string BusNumber,
    decimal Cost,
    int DowntimeHours) : IDomainEvent
{
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}

public sealed record BusRetiredEvent(
    int BusId,
    string BusNumber,
    string Reason) : IDomainEvent
{
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}
