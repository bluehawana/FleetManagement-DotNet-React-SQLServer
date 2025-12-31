using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using FleetManagement.Core.Aggregates.OperationAggregate;
using FleetManagement.Core.Aggregates.BusAggregate;
using FleetManagement.Core.Aggregates.RouteAggregate;

namespace FleetManagement.Infrastructure.Data.Configurations;

public class DailyOperationConfiguration : IEntityTypeConfiguration<DailyOperation>
{
    public void Configure(EntityTypeBuilder<DailyOperation> builder)
    {
        builder.ToTable("DailyOperations");

        builder.HasKey(o => o.OperationId);

        builder.Property(o => o.BusId)
            .IsRequired();

        builder.Property(o => o.RouteId)
            .IsRequired();

        builder.Property(o => o.OperationDate)
            .IsRequired();

        builder.HasIndex(o => o.OperationDate);

        builder.Property(o => o.DepartureTime)
            .IsRequired();

        builder.Property(o => o.ArrivalTime)
            .IsRequired();

        builder.Property(o => o.PassengerCount)
            .IsRequired();

        builder.Property(o => o.FuelConsumed)
            .HasPrecision(10, 2)
            .IsRequired();

        builder.Property(o => o.DistanceTraveled)
            .HasPrecision(10, 2)
            .IsRequired();

        builder.Property(o => o.DelayMinutes)
            .IsRequired();

        builder.Property(o => o.DriverName)
            .HasMaxLength(100)
            .IsRequired();

        // Configure Money value objects
        builder.OwnsOne(o => o.Revenue, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("Revenue")
                .HasPrecision(18, 2)
                .IsRequired();

            money.Property(m => m.Currency)
                .HasColumnName("RevenueCurrency")
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.OwnsOne(o => o.FuelCost, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("FuelCost")
                .HasPrecision(18, 2)
                .IsRequired();

            money.Property(m => m.Currency)
                .HasColumnName("FuelCostCurrency")
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.Property(o => o.Notes)
            .HasMaxLength(500);

        builder.Property(o => o.CreatedAt)
            .IsRequired();

        builder.Property(o => o.UpdatedAt);

        // Configure relationships
        builder.HasOne<Bus>()
            .WithMany()
            .HasForeignKey(o => o.BusId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Route>()
            .WithMany()
            .HasForeignKey(o => o.RouteId)
            .OnDelete(DeleteBehavior.Restrict);

        // Ignore domain events
        builder.Ignore(o => o.DomainEvents);
    }
}
