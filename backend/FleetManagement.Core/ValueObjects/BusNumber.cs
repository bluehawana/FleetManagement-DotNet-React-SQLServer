using FleetManagement.Core.Common;

namespace FleetManagement.Core.ValueObjects;

/// <summary>
/// Value object representing a bus identification number
/// </summary>
public sealed class BusNumber : ValueObject
{
    public string Value { get; }
    
    private BusNumber(string value)
    {
        Value = value;
    }
    
    public static Result<BusNumber> Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return Result.Failure<BusNumber>("Bus number cannot be empty");
            
        if (value.Length < 3 || value.Length > 20)
            return Result.Failure<BusNumber>("Bus number must be between 3 and 20 characters");
            
        if (!System.Text.RegularExpressions.Regex.IsMatch(value, @"^[A-Z0-9-]+$"))
            return Result.Failure<BusNumber>("Bus number can only contain uppercase letters, numbers, and hyphens");
            
        return Result.Success(new BusNumber(value.ToUpperInvariant()));
    }
    
    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }
    
    public override string ToString() => Value;
    
    public static implicit operator string(BusNumber busNumber) => busNumber.Value;
}
