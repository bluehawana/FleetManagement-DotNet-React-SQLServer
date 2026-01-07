using FleetManagement.Core.Common;

namespace FleetManagement.Core.Aggregates.DriverAggregate;

/// <summary>
/// Driver aggregate root - represents a bus driver with fatigue monitoring
/// </summary>
public class Driver : AggregateRoot
{
    public DriverId DriverId { get; private set; }
    public string DriverNumber { get; private set; }
    public string FirstName { get; private set; }
    public string LastName { get; private set; }
    public string LicenseNumber { get; private set; }
    public DateTime HireDate { get; private set; }
    public DriverStatus Status { get; private set; }
    public DateTime LastRestDay { get; private set; }
    public double CurrentFatigueLevel { get; private set; } // 0-100, 100 = fully rested
    
    // Navigation properties
    private readonly List<DriverShift> _shifts = new();
    public IReadOnlyCollection<DriverShift> Shifts => _shifts.AsReadOnly();

    // EF Core constructor
    private Driver() 
    {
        DriverNumber = string.Empty;
        FirstName = string.Empty;
        LastName = string.Empty;
        LicenseNumber = string.Empty;
    }

    public Driver(
        DriverId driverId,
        string driverNumber,
        string firstName,
        string lastName,
        string licenseNumber,
        DateTime hireDate)
    {
        DriverId = driverId;
        DriverNumber = driverNumber;
        FirstName = firstName;
        LastName = lastName;
        LicenseNumber = licenseNumber;
        HireDate = hireDate;
        Status = DriverStatus.Active;
        LastRestDay = DateTime.UtcNow.Date.AddDays(-1); // Yesterday
        CurrentFatigueLevel = 100.0; // Start fully rested
    }

    public string FullName => $"{FirstName} {LastName}";

    /// <summary>
    /// Calculate current fatigue level based on recent shifts
    /// Like a game character's stamina - 100% = fully rested, 0% = exhausted
    /// </summary>
    public void UpdateFatigueLevel()
    {
        var today = DateTime.UtcNow.Date;
        var recentShifts = _shifts.Where(s => s.ShiftDate >= today.AddDays(-7)).ToList();
        
        // Base fatigue calculation
        var daysSinceRest = (today - LastRestDay).Days;
        var hoursWorkedToday = recentShifts.Where(s => s.ShiftDate == today).Sum(s => s.HoursWorked);
        var totalHoursThisWeek = recentShifts.Sum(s => s.HoursWorked);
        
        // Fatigue factors (like game mechanics)
        var dailyFatigue = Math.Min(100, hoursWorkedToday * 8); // 8% fatigue per hour worked today
        var weeklyFatigue = Math.Min(100, totalHoursThisWeek * 2); // 2% fatigue per hour this week
        var restFatigue = Math.Min(100, daysSinceRest * 15); // 15% fatigue per day without rest
        
        // Calculate final fatigue (worst case scenario)
        var totalFatigue = Math.Max(Math.Max(dailyFatigue, weeklyFatigue), restFatigue);
        CurrentFatigueLevel = Math.Max(0, 100 - totalFatigue);
    }

    /// <summary>
    /// Get driver health status like game character condition
    /// </summary>
    public DriverHealthStatus GetHealthStatus()
    {
        return CurrentFatigueLevel switch
        {
            >= 80 => DriverHealthStatus.WellRested,
            >= 60 => DriverHealthStatus.GoodCondition,
            >= 30 => DriverHealthStatus.GettingTired,
            >= 10 => DriverHealthStatus.NeedsRestSoon,
            _ => DriverHealthStatus.ExhaustedMandatoryRest
        };
    }

    /// <summary>
    /// Check if driver needs mandatory rest (DOT compliance)
    /// </summary>
    public bool NeedsMandatoryRest()
    {
        var today = DateTime.UtcNow.Date;
        var hoursWorkedToday = _shifts.Where(s => s.ShiftDate == today).Sum(s => s.HoursWorked);
        var daysSinceRest = (today - LastRestDay).Days;
        
        // DOT regulations: max 14 hours per day, must have 1 day off per week
        return hoursWorkedToday >= 14 || daysSinceRest >= 7 || CurrentFatigueLevel <= 10;
    }

    /// <summary>
    /// Get hours until mandatory rest required
    /// </summary>
    public double GetHoursUntilMandatoryRest()
    {
        var today = DateTime.UtcNow.Date;
        var hoursWorkedToday = _shifts.Where(s => s.ShiftDate == today).Sum(s => s.HoursWorked);
        return Math.Max(0, 14 - hoursWorkedToday);
    }

    /// <summary>
    /// Add a new shift for the driver
    /// </summary>
    public void AddShift(DateTime shiftDate, double hoursWorked, int tripsCompleted, double fuelUsed)
    {
        var shift = new DriverShift(
            DriverShiftId.New(),
            DriverId,
            shiftDate,
            hoursWorked,
            tripsCompleted,
            fuelUsed);
            
        _shifts.Add(shift);
        UpdateFatigueLevel();
    }

    /// <summary>
    /// Mark driver as having taken a rest day
    /// </summary>
    public void TakeRestDay(DateTime restDate)
    {
        LastRestDay = restDate;
        CurrentFatigueLevel = Math.Min(100, CurrentFatigueLevel + 30); // Restore 30% fatigue
        UpdateFatigueLevel();
    }

    /// <summary>
    /// Update driver status
    /// </summary>
    public void UpdateStatus(DriverStatus status)
    {
        Status = status;
    }
}

/// <summary>
/// Driver status enumeration
/// </summary>
public enum DriverStatus
{
    Active = 1,
    OnLeave = 2,
    Suspended = 3,
    Terminated = 4
}

/// <summary>
/// Driver health status like game character condition
/// </summary>
public enum DriverHealthStatus
{
    WellRested,
    GoodCondition,
    GettingTired,
    NeedsRestSoon,
    ExhaustedMandatoryRest
}