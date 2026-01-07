using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace FleetManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Buses",
                columns: table => new
                {
                    BusId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BusNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Model = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Year = table.Column<int>(type: "integer", nullable: false),
                    Capacity = table.Column<int>(type: "integer", nullable: false),
                    FuelTankCapacity = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    PurchaseDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PurchasePrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    PurchaseCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    CurrentMileage = table.Column<int>(type: "integer", nullable: false),
                    LastMaintenanceDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    NextMaintenanceDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Buses", x => x.BusId);
                });

            migrationBuilder.CreateTable(
                name: "Drivers",
                columns: table => new
                {
                    DriverId = table.Column<Guid>(type: "uuid", nullable: false),
                    DriverNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    FirstName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LicenseNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    HireDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    LastRestDay = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CurrentFatigueLevel = table.Column<double>(type: "double precision", precision: 5, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Drivers", x => x.DriverId);
                });

            migrationBuilder.CreateTable(
                name: "Routes",
                columns: table => new
                {
                    RouteId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RouteNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    RouteName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Distance = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    EstimatedDuration = table.Column<int>(type: "integer", nullable: false),
                    NumberOfStops = table.Column<int>(type: "integer", nullable: false),
                    StartLocation = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    EndLocation = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    EstimatedFuelCost = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    FuelCostCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Routes", x => x.RouteId);
                });

            migrationBuilder.CreateTable(
                name: "MaintenanceRecords",
                columns: table => new
                {
                    MaintenanceId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BusId = table.Column<int>(type: "integer", nullable: false),
                    MaintenanceDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    MaintenanceType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Cost = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    CostCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    MileageAtMaintenance = table.Column<int>(type: "integer", nullable: false),
                    PerformedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PartsReplaced = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    DowntimeHours = table.Column<int>(type: "integer", nullable: false),
                    IsWarranty = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaintenanceRecords", x => x.MaintenanceId);
                    table.ForeignKey(
                        name: "FK_MaintenanceRecords_Buses_BusId",
                        column: x => x.BusId,
                        principalTable: "Buses",
                        principalColumn: "BusId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DriverShifts",
                columns: table => new
                {
                    DriverShiftId = table.Column<Guid>(type: "uuid", nullable: false),
                    DriverId = table.Column<Guid>(type: "uuid", nullable: false),
                    ShiftDate = table.Column<DateTime>(type: "date", nullable: false),
                    HoursWorked = table.Column<double>(type: "double precision", precision: 4, scale: 2, nullable: false),
                    TripsCompleted = table.Column<int>(type: "integer", nullable: false),
                    FuelUsed = table.Column<double>(type: "double precision", precision: 8, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DriverShifts", x => x.DriverShiftId);
                    table.ForeignKey(
                        name: "FK_DriverShifts_Drivers_DriverId",
                        column: x => x.DriverId,
                        principalTable: "Drivers",
                        principalColumn: "DriverId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DailyOperations",
                columns: table => new
                {
                    OperationId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BusId = table.Column<int>(type: "integer", nullable: false),
                    RouteId = table.Column<int>(type: "integer", nullable: false),
                    OperationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DepartureTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    ArrivalTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    PassengerCount = table.Column<int>(type: "integer", nullable: false),
                    FuelConsumed = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    DistanceTraveled = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    DelayMinutes = table.Column<int>(type: "integer", nullable: false),
                    DriverName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Revenue = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    RevenueCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    FuelCost = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    FuelCostCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyOperations", x => x.OperationId);
                    table.ForeignKey(
                        name: "FK_DailyOperations_Buses_BusId",
                        column: x => x.BusId,
                        principalTable: "Buses",
                        principalColumn: "BusId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DailyOperations_Routes_RouteId",
                        column: x => x.RouteId,
                        principalTable: "Routes",
                        principalColumn: "RouteId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Buses_BusNumber",
                table: "Buses",
                column: "BusNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DailyOperations_BusId",
                table: "DailyOperations",
                column: "BusId");

            migrationBuilder.CreateIndex(
                name: "IX_DailyOperations_OperationDate",
                table: "DailyOperations",
                column: "OperationDate");

            migrationBuilder.CreateIndex(
                name: "IX_DailyOperations_RouteId",
                table: "DailyOperations",
                column: "RouteId");

            migrationBuilder.CreateIndex(
                name: "IX_Drivers_DriverNumber",
                table: "Drivers",
                column: "DriverNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Drivers_LicenseNumber",
                table: "Drivers",
                column: "LicenseNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DriverShifts_DriverId_ShiftDate",
                table: "DriverShifts",
                columns: new[] { "DriverId", "ShiftDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DriverShifts_ShiftDate",
                table: "DriverShifts",
                column: "ShiftDate");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceRecords_BusId",
                table: "MaintenanceRecords",
                column: "BusId");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceRecords_MaintenanceDate",
                table: "MaintenanceRecords",
                column: "MaintenanceDate");

            migrationBuilder.CreateIndex(
                name: "IX_Routes_RouteNumber",
                table: "Routes",
                column: "RouteNumber",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DailyOperations");

            migrationBuilder.DropTable(
                name: "DriverShifts");

            migrationBuilder.DropTable(
                name: "MaintenanceRecords");

            migrationBuilder.DropTable(
                name: "Routes");

            migrationBuilder.DropTable(
                name: "Drivers");

            migrationBuilder.DropTable(
                name: "Buses");
        }
    }
}
