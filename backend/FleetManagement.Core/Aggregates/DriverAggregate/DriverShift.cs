using FleetManagement.Core.Common;

namespace FleetManagement.Core.Aggregates.DriverAggregate;

/// <summary>
/// Driver shift entity - tracks individual work shifts for fatigue monitoring
/// </summary>
public class DriverShift : Entity
{
    public DriverShiftId DriverShiftId { get; private set; }
    public DriverId DriverId { get; private set; }
    public DateTime ShiftDate { get; private set; }
    public double HoursWorked { get; private set; }
    public int TripsCompleted { get; private set; }
    public double FuelUsed { get; private set; }
    public DateTime CreatedAt { get; private set; }

    // EF Core constructor
    private DriverShift() { }

    public DriverShift(
        DriverShiftId driverShiftId,
        DriverId driverId,
        DateTime shiftDate,
        double hoursWorked,
        int tripsCompleted,
        double fuelUsed)
    {
        DriverShiftId = driverShiftId;
        DriverId = driverId;
        ShiftDate = shiftDate.Date; // Normalize to date only
        HoursWorked = hoursWorked;
        TripsCompleted = tripsCompleted;
        FuelUsed = fuelUsed;
        CreatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Calculate fuel efficiency for this shift
    /// </summary>
    public double GetFuelEfficiency()
    {
        return FuelUsed > 0 ? TripsCompleted / FuelUsed : 0;
    }

    /// <summary>
    /// Check if this was an overtime shift (>8 hours)
    /// </summary>
    public bool IsOvertimeShift()
    {
        return HoursWorked > 8;
    }

    /// <summary>
    /// Check if this violates DOT regulations (>14 hours)
    /// </summary>
    public bool IsViolationShift()
    {
        return HoursWorked > 14;
    }
}