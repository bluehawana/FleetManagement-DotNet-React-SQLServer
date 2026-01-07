using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using FleetManagement.Core.Aggregates.DriverAggregate;

namespace FleetManagement.Infrastructure.Data.Configurations;

/// <summary>
/// EF Core configuration for DriverShift entity
/// </summary>
public class DriverShiftConfiguration : IEntityTypeConfiguration<DriverShift>
{
    public void Configure(EntityTypeBuilder<DriverShift> builder)
    {
        builder.ToTable("DriverShifts");

        // Primary key
        builder.HasKey(ds => ds.DriverShiftId);
        
        // Value object conversions
        builder.Property(ds => ds.DriverShiftId)
            .HasConversion(
                id => id.Value,
                value => DriverShiftId.From(value))
            .IsRequired();

        builder.Property(ds => ds.DriverId)
            .HasConversion(
                id => id.Value,
                value => DriverId.From(value))
            .IsRequired();

        // Properties
        builder.Property(ds => ds.ShiftDate)
            .HasColumnType("date")
            .IsRequired();

        builder.Property(ds => ds.HoursWorked)
            .HasPrecision(4, 2)
            .IsRequired();

        builder.Property(ds => ds.TripsCompleted)
            .IsRequired();

        builder.Property(ds => ds.FuelUsed)
            .HasPrecision(8, 2)
            .IsRequired();

        builder.Property(ds => ds.CreatedAt)
            .IsRequired();

        // Indexes
        builder.HasIndex(ds => new { ds.DriverId, ds.ShiftDate })
            .IsUnique();

        builder.HasIndex(ds => ds.ShiftDate);
    }
}