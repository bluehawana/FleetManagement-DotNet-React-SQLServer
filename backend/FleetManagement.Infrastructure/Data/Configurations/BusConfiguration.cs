using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using FleetManagement.Core.Aggregates.BusAggregate;
using FleetManagement.Core.ValueObjects;

namespace FleetManagement.Infrastructure.Data.Configurations;

public class BusConfiguration : IEntityTypeConfiguration<Bus>
{
    public void Configure(EntityTypeBuilder<Bus> builder)
    {
        builder.ToTable("Buses");

        builder.HasKey(b => b.BusId);

        // Configure BusNumber value object
        builder.Property(b => b.BusNumber)
            .HasConversion(
                bn => bn.Value,
                value => BusNumber.Create(value).Value)
            .HasMaxLength(20)
            .IsRequired();

        builder.HasIndex(b => b.BusNumber)
            .IsUnique();

        builder.Property(b => b.Model)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(b => b.Year)
            .IsRequired();

        builder.Property(b => b.Capacity)
            .IsRequired();

        builder.Property(b => b.FuelTankCapacity)
            .HasPrecision(10, 2)
            .IsRequired();

        builder.Property(b => b.Status)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        // Configure Money value object for PurchasePrice
        builder.OwnsOne(b => b.PurchasePrice, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("PurchasePrice")
                .HasPrecision(18, 2)
                .IsRequired();

            money.Property(m => m.Currency)
                .HasColumnName("PurchaseCurrency")
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.Property(b => b.CurrentMileage)
            .IsRequired();

        builder.Property(b => b.LastMaintenanceDate)
            .IsRequired();

        builder.Property(b => b.NextMaintenanceDate)
            .IsRequired();

        builder.Property(b => b.CreatedAt)
            .IsRequired();

        builder.Property(b => b.UpdatedAt);

        // Configure relationship with MaintenanceRecords
        builder.HasMany(b => b.MaintenanceRecords)
            .WithOne()
            .HasForeignKey(m => m.BusId)
            .OnDelete(DeleteBehavior.Cascade);

        // Ignore domain events (not persisted)
        builder.Ignore(b => b.DomainEvents);
    }
}
