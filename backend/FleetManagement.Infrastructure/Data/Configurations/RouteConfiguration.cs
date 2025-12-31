using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using FleetManagement.Core.Aggregates.RouteAggregate;

namespace FleetManagement.Infrastructure.Data.Configurations;

public class RouteConfiguration : IEntityTypeConfiguration<Route>
{
    public void Configure(EntityTypeBuilder<Route> builder)
    {
        builder.ToTable("Routes");

        builder.HasKey(r => r.RouteId);

        builder.Property(r => r.RouteNumber)
            .HasMaxLength(20)
            .IsRequired();

        builder.HasIndex(r => r.RouteNumber)
            .IsUnique();

        builder.Property(r => r.RouteName)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(r => r.Distance)
            .HasPrecision(10, 2)
            .IsRequired();

        builder.Property(r => r.EstimatedDuration)
            .IsRequired();

        builder.Property(r => r.NumberOfStops)
            .IsRequired();

        builder.Property(r => r.StartLocation)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(r => r.EndLocation)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(r => r.IsActive)
            .IsRequired();

        // Configure Money value object for EstimatedFuelCost
        builder.OwnsOne(r => r.EstimatedFuelCost, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("EstimatedFuelCost")
                .HasPrecision(18, 2)
                .IsRequired();

            money.Property(m => m.Currency)
                .HasColumnName("FuelCostCurrency")
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.Property(r => r.CreatedAt)
            .IsRequired();

        builder.Property(r => r.UpdatedAt);

        // Ignore domain events
        builder.Ignore(r => r.DomainEvents);
    }
}
