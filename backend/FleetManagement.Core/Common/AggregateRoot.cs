namespace FleetManagement.Core.Common;

/// <summary>
/// Base class for aggregate roots - entities that are the entry point to an aggregate
/// </summary>
public abstract class AggregateRoot : Entity
{
    public DateTime CreatedAt { get; protected set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; protected set; }
    
    protected void MarkAsUpdated()
    {
        UpdatedAt = DateTime.UtcNow;
    }
}
