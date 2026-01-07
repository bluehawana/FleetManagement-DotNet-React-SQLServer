using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using FleetManagement.Core.Aggregates.DriverAggregate;

namespace FleetManagement.Infrastructure.Data.Configurations;

/// <summary>
/// EF Core configuration for Driver aggregate
/// </summary>
public class DriverConfiguration : IEntityTypeConfiguration<Driver>
{
    public void Configure(EntityTypeBuilder<Driver> builder)
    {
        builder.ToTable("Drivers");

        // Primary key
        builder.HasKey(d => d.DriverId);
        
        // Value object conversion
        builder.Property(d => d.DriverId)
            .HasConversion(
                id => id.Value,
                value => DriverId.From(value))
            .IsRequired();

        // Properties
        builder.Property(d => d.DriverNumber)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(d => d.FirstName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(d => d.LastName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(d => d.LicenseNumber)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(d => d.HireDate)
            .IsRequired();

        builder.Property(d => d.Status)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(d => d.LastRestDay)
            .IsRequired();

        builder.Property(d => d.CurrentFatigueLevel)
            .HasPrecision(5, 2)
            .IsRequired();

        // Indexes
        builder.HasIndex(d => d.DriverNumber)
            .IsUnique();

        builder.HasIndex(d => d.LicenseNumber)
            .IsUnique();

        // Relationships
        builder.HasMany(d => d.Shifts)
            .WithOne()
            .HasForeignKey(s => s.DriverId)
            .OnDelete(DeleteBehavior.Cascade);

        // Ignore domain events (handled by base class)
        builder.Ignore(d => d.DomainEvents);
    }
}