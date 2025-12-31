using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using FleetManagement.Core.Aggregates.BusAggregate;

namespace FleetManagement.Infrastructure.Data.Configurations;

public class MaintenanceRecordConfiguration : IEntityTypeConfiguration<MaintenanceRecord>
{
    public void Configure(EntityTypeBuilder<MaintenanceRecord> builder)
    {
        builder.ToTable("MaintenanceRecords");

        builder.HasKey(m => m.MaintenanceId);

        builder.Property(m => m.BusId)
            .IsRequired();

        builder.HasIndex(m => m.BusId);

        builder.Property(m => m.MaintenanceDate)
            .IsRequired();

        builder.HasIndex(m => m.MaintenanceDate);

        builder.Property(m => m.MaintenanceType)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(m => m.Description)
            .HasMaxLength(500)
            .IsRequired();

        // Configure Money value object for Cost
        builder.OwnsOne(m => m.Cost, money =>
        {
            money.Property(mo => mo.Amount)
                .HasColumnName("Cost")
                .HasPrecision(18, 2)
                .IsRequired();

            money.Property(mo => mo.Currency)
                .HasColumnName("CostCurrency")
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.Property(m => m.MileageAtMaintenance)
            .IsRequired();

        builder.Property(m => m.PerformedBy)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(m => m.PartsReplaced)
            .HasMaxLength(500);

        builder.Property(m => m.DowntimeHours)
            .IsRequired();

        builder.Property(m => m.IsWarranty)
            .IsRequired();

        builder.Property(m => m.CreatedAt)
            .IsRequired();

        // Ignore domain events
        builder.Ignore(m => m.DomainEvents);
    }
}
