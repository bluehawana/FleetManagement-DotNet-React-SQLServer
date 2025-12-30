-- ============================================================================
-- US Bus Transit Management Database Schema
-- Generated from real US DOT data (2015-2023)
-- Author: Harvad Li
-- Date: 2024-12-30
-- ============================================================================

USE master;
GO

-- Drop database if exists
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'USBusTransit')
BEGIN
    ALTER DATABASE USBusTransit SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE USBusTransit;
END
GO

-- Create database
CREATE DATABASE USBusTransit;
GO

USE USBusTransit;
GO

-- ============================================================================
-- TABLE 1: US DOT Transportation Statistics (Historical Data)
-- Source: US Department of Transportation - Bureau of Transportation Statistics
-- ============================================================================

CREATE TABLE USDOTTransportationStats (
    StatId INT PRIMARY KEY IDENTITY(1,1),
    Date DATE NOT NULL UNIQUE,
    Year INT NOT NULL,
    Month INT NOT NULL,
    Quarter INT NOT NULL,
    
    -- Bus Ridership (PRIMARY METRIC)
    BusRidership BIGINT NULL,                    -- Monthly bus passengers
    RailRidership BIGINT NULL,                   -- Monthly rail passengers
    OtherTransitRidership BIGINT NULL,           -- Other transit modes
    
    -- Fuel Prices (COST ANALYSIS)
    DieselPrice DECIMAL(10,3) NULL,              -- $/gallon
    GasolinePrice DECIMAL(10,3) NULL,            -- $/gallon
    
    -- Highway/Traffic Data (ROUTE OPTIMIZATION)
    HighwayMilesTraveled BIGINT NULL,            -- Total miles
    HighwayFatalities INT NULL,                  -- Monthly fatalities
    FatalityRate DECIMAL(10,3) NULL,             -- Per 100M miles
    
    -- Employment (WORKFORCE PLANNING)
    TransitEmployment INT NULL,                  -- Transit workers
    TruckEmployment INT NULL,                    -- Truck drivers
    
    -- Economic Indicators
    UnemploymentRate DECIMAL(5,3) NULL,          -- Percentage
    GDP BIGINT NULL,                             -- Real GDP
    
    -- Vehicle Sales (MARKET TRENDS)
    HeavyTruckSales INT NULL,
    AutoSales INT NULL,
    
    -- Calculated Fields
    IsCOVIDPeriod BIT NOT NULL DEFAULT 0,        -- COVID period flag
    EstimatedFuelCostPerMonth DECIMAL(12,2) NULL,
    EstimatedCostPerPassenger DECIMAL(10,4) NULL,
    
    -- Metadata
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);
GO

-- Index for date queries
CREATE INDEX IX_USDOTStats_Date ON USDOTTransportationStats(Date);
CREATE INDEX IX_USDOTStats_Year ON USDOTTransportationStats(Year);
CREATE INDEX IX_USDOTStats_COVID ON USDOTTransportationStats(IsCOVIDPeriod);
GO

-- ============================================================================
-- TABLE 2: Bus Fleet (Simulated based on typical small city fleet)
-- ============================================================================

CREATE TABLE BusFleet (
    BusId INT PRIMARY KEY IDENTITY(1,1),
    BusNumber NVARCHAR(20) NOT NULL UNIQUE,      -- e.g., "BUS-001"
    VIN NVARCHAR(17) UNIQUE,                     -- Vehicle Identification Number
    
    -- Bus Details
    Manufacturer NVARCHAR(50) NOT NULL,          -- e.g., "Volvo", "New Flyer"
    Model NVARCHAR(50) NOT NULL,                 -- e.g., "7900 Hybrid"
    Year INT NOT NULL,
    Capacity INT NOT NULL,                       -- Passenger capacity
    
    -- Fuel & Efficiency
    FuelType NVARCHAR(20) NOT NULL,              -- Diesel, CNG, Electric, Hybrid
    AverageMPG DECIMAL(5,2) NULL,                -- Miles per gallon
    
    -- Status
    Status NVARCHAR(20) NOT NULL,                -- Operational, Maintenance, Retired
    CurrentOdometer INT NULL,                    -- Current miles
    
    -- Dates
    PurchaseDate DATE NOT NULL,
    LastMaintenanceDate DATE NULL,
    NextMaintenanceDate DATE NULL,
    
    -- Metadata
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT CK_BusFleet_Status CHECK (Status IN ('Operational', 'Maintenance', 'Retired')),
    CONSTRAINT CK_BusFleet_FuelType CHECK (FuelType IN ('Diesel', 'CNG', 'Electric', 'Hybrid'))
);
GO

CREATE INDEX IX_BusFleet_Status ON BusFleet(Status);
CREATE INDEX IX_BusFleet_Year ON BusFleet(Year);
GO

-- ============================================================================
-- TABLE 3: Routes
-- ============================================================================

CREATE TABLE Routes (
    RouteId INT PRIMARY KEY IDENTITY(1,1),
    RouteNumber NVARCHAR(20) NOT NULL UNIQUE,    -- e.g., "Route 1", "Downtown Express"
    RouteName NVARCHAR(100) NOT NULL,
    
    -- Route Details
    StartLocation NVARCHAR(100) NOT NULL,
    EndLocation NVARCHAR(100) NOT NULL,
    TotalDistance DECIMAL(10,2) NOT NULL,        -- Miles
    EstimatedDuration INT NOT NULL,              -- Minutes
    
    -- Schedule
    IsActive BIT NOT NULL DEFAULT 1,
    ServiceDays NVARCHAR(50) NOT NULL,           -- e.g., "Mon-Fri", "Daily"
    
    -- Metadata
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);
GO

-- ============================================================================
-- TABLE 4: Daily Operations (Trip Records)
-- ============================================================================

CREATE TABLE DailyOperations (
    OperationId INT PRIMARY KEY IDENTITY(1,1),
    BusId INT NOT NULL FOREIGN KEY REFERENCES BusFleet(BusId),
    RouteId INT NOT NULL FOREIGN KEY REFERENCES Routes(RouteId),
    
    -- Trip Details
    TripDate DATE NOT NULL,
    DepartureTime TIME NOT NULL,
    ArrivalTime TIME NULL,
    
    -- Performance Metrics
    PassengerCount INT NULL,
    ActualDistance DECIMAL(10,2) NULL,           -- Miles
    FuelConsumed DECIMAL(10,2) NULL,             -- Gallons
    FuelCost DECIMAL(10,2) NULL,                 -- Dollars
    
    -- Status
    TripStatus NVARCHAR(20) NOT NULL,            -- Completed, Cancelled, Delayed
    DelayMinutes INT NULL,
    
    -- Metadata
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT CK_DailyOps_Status CHECK (TripStatus IN ('Completed', 'Cancelled', 'Delayed'))
);
GO

CREATE INDEX IX_DailyOps_Date ON DailyOperations(TripDate);
CREATE INDEX IX_DailyOps_Bus ON DailyOperations(BusId);
CREATE INDEX IX_DailyOps_Route ON DailyOperations(RouteId);
GO

-- ============================================================================
-- TABLE 5: Maintenance Records
-- ============================================================================

CREATE TABLE MaintenanceRecords (
    MaintenanceId INT PRIMARY KEY IDENTITY(1,1),
    BusId INT NOT NULL FOREIGN KEY REFERENCES BusFleet(BusId),
    
    -- Maintenance Details
    MaintenanceDate DATE NOT NULL,
    MaintenanceType NVARCHAR(50) NOT NULL,       -- Preventive, Corrective, Emergency
    Description NVARCHAR(500) NULL,
    
    -- Cost
    LaborCost DECIMAL(10,2) NULL,
    PartsCost DECIMAL(10,2) NULL,
    TotalCost DECIMAL(10,2) NULL,
    
    -- Odometer
    OdometerAtMaintenance INT NULL,
    
    -- Status
    Status NVARCHAR(20) NOT NULL,                -- Scheduled, InProgress, Completed
    
    -- Metadata
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CompletedAt DATETIME2 NULL,
    
    CONSTRAINT CK_Maintenance_Type CHECK (MaintenanceType IN ('Preventive', 'Corrective', 'Emergency')),
    CONSTRAINT CK_Maintenance_Status CHECK (Status IN ('Scheduled', 'InProgress', 'Completed'))
);
GO

CREATE INDEX IX_Maintenance_Bus ON MaintenanceRecords(BusId);
CREATE INDEX IX_Maintenance_Date ON MaintenanceRecords(MaintenanceDate);
GO

-- ============================================================================
-- TABLE 6: Fuel Purchases
-- ============================================================================

CREATE TABLE FuelPurchases (
    PurchaseId INT PRIMARY KEY IDENTITY(1,1),
    BusId INT NOT NULL FOREIGN KEY REFERENCES BusFleet(BusId),
    
    -- Purchase Details
    PurchaseDate DATE NOT NULL,
    Gallons DECIMAL(10,2) NOT NULL,
    PricePerGallon DECIMAL(10,3) NOT NULL,
    TotalCost DECIMAL(10,2) NOT NULL,
    
    -- Location
    FuelStation NVARCHAR(100) NULL,
    
    -- Odometer
    OdometerAtPurchase INT NULL,
    
    -- Metadata
    CreatedAt DATETIME2 DEFAULT GETDATE()
);
GO

CREATE INDEX IX_FuelPurchases_Bus ON FuelPurchases(BusId);
CREATE INDEX IX_FuelPurchases_Date ON FuelPurchases(PurchaseDate);
GO

-- ============================================================================
-- TABLE 7: Alerts (Predictive Maintenance, Cost Warnings)
-- ============================================================================

CREATE TABLE Alerts (
    AlertId INT PRIMARY KEY IDENTITY(1,1),
    BusId INT NULL FOREIGN KEY REFERENCES BusFleet(BusId),
    
    -- Alert Details
    AlertType NVARCHAR(50) NOT NULL,             -- Maintenance, Fuel, Performance, Safety
    Severity NVARCHAR(20) NOT NULL,              -- Low, Medium, High, Critical
    Title NVARCHAR(200) NOT NULL,
    Message NVARCHAR(1000) NOT NULL,
    
    -- Status
    Status NVARCHAR(20) NOT NULL,                -- New, Acknowledged, Resolved
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    AcknowledgedAt DATETIME2 NULL,
    ResolvedAt DATETIME2 NULL,
    
    CONSTRAINT CK_Alert_Type CHECK (AlertType IN ('Maintenance', 'Fuel', 'Performance', 'Safety')),
    CONSTRAINT CK_Alert_Severity CHECK (Severity IN ('Low', 'Medium', 'High', 'Critical')),
    CONSTRAINT CK_Alert_Status CHECK (Status IN ('New', 'Acknowledged', 'Resolved'))
);
GO

CREATE INDEX IX_Alerts_Status ON Alerts(Status);
CREATE INDEX IX_Alerts_Severity ON Alerts(Severity);
CREATE INDEX IX_Alerts_Bus ON Alerts(BusId);
GO

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Fleet Summary
CREATE VIEW vw_FleetSummary AS
SELECT 
    Status,
    COUNT(*) AS BusCount,
    AVG(CurrentOdometer) AS AvgOdometer,
    AVG(YEAR(GETDATE()) - Year) AS AvgAge,
    AVG(AverageMPG) AS AvgMPG
FROM BusFleet
GROUP BY Status;
GO

-- View: Monthly Ridership Trends
CREATE VIEW vw_MonthlyRidershipTrends AS
SELECT 
    Year,
    Month,
    BusRidership,
    DieselPrice,
    IsCOVIDPeriod,
    EstimatedCostPerPassenger,
    LAG(BusRidership) OVER (ORDER BY Date) AS PreviousMonthRidership,
    ((BusRidership - LAG(BusRidership) OVER (ORDER BY Date)) * 100.0 / 
     NULLIF(LAG(BusRidership) OVER (ORDER BY Date), 0)) AS RidershipChangePercent
FROM USDOTTransportationStats
WHERE BusRidership IS NOT NULL;
GO

-- View: Fuel Cost Analysis
CREATE VIEW vw_FuelCostAnalysis AS
SELECT 
    Year,
    AVG(DieselPrice) AS AvgDieselPrice,
    MIN(DieselPrice) AS MinDieselPrice,
    MAX(DieselPrice) AS MaxDieselPrice,
    AVG(GasolinePrice) AS AvgGasolinePrice
FROM USDOTTransportationStats
WHERE DieselPrice IS NOT NULL
GROUP BY Year;
GO

-- View: Bus Performance
CREATE VIEW vw_BusPerformance AS
SELECT 
    b.BusId,
    b.BusNumber,
    b.Manufacturer,
    b.Model,
    b.Year,
    b.CurrentOdometer,
    COUNT(DISTINCT do.OperationId) AS TotalTrips,
    SUM(do.PassengerCount) AS TotalPassengers,
    SUM(do.FuelConsumed) AS TotalFuelConsumed,
    SUM(do.FuelCost) AS TotalFuelCost,
    AVG(do.PassengerCount) AS AvgPassengersPerTrip,
    CASE 
        WHEN SUM(do.FuelConsumed) > 0 
        THEN SUM(do.ActualDistance) / SUM(do.FuelConsumed)
        ELSE NULL 
    END AS ActualMPG
FROM BusFleet b
LEFT JOIN DailyOperations do ON b.BusId = do.BusId
GROUP BY b.BusId, b.BusNumber, b.Manufacturer, b.Model, b.Year, b.CurrentOdometer;
GO

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

-- Procedure: Get Dashboard KPIs
CREATE PROCEDURE sp_GetDashboardKPIs
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        -- Fleet Status
        (SELECT COUNT(*) FROM BusFleet WHERE Status = 'Operational') AS OperationalBuses,
        (SELECT COUNT(*) FROM BusFleet WHERE Status = 'Maintenance') AS BusesInMaintenance,
        (SELECT COUNT(*) FROM BusFleet) AS TotalBuses,
        
        -- Recent Ridership
        (SELECT TOP 1 BusRidership FROM USDOTTransportationStats 
         WHERE BusRidership IS NOT NULL ORDER BY Date DESC) AS LatestMonthRidership,
        
        -- Fuel Prices
        (SELECT TOP 1 DieselPrice FROM USDOTTransportationStats 
         WHERE DieselPrice IS NOT NULL ORDER BY Date DESC) AS CurrentDieselPrice,
        
        -- Alerts
        (SELECT COUNT(*) FROM Alerts WHERE Status = 'New') AS NewAlerts,
        (SELECT COUNT(*) FROM Alerts WHERE Status = 'New' AND Severity = 'Critical') AS CriticalAlerts;
END;
GO

-- Procedure: Get Ridership Trends
CREATE PROCEDURE sp_GetRidershipTrends
    @StartDate DATE,
    @EndDate DATE
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        Date,
        Year,
        Month,
        BusRidership,
        DieselPrice,
        IsCOVIDPeriod,
        EstimatedCostPerPassenger
    FROM USDOTTransportationStats
    WHERE Date BETWEEN @StartDate AND @EndDate
        AND BusRidership IS NOT NULL
    ORDER BY Date;
END;
GO

-- ============================================================================
-- SAMPLE DATA NOTES
-- ============================================================================

PRINT '
============================================================================
DATABASE SCHEMA CREATED SUCCESSFULLY!
============================================================================

Tables Created:
1. USDOTTransportationStats - Real US DOT data (2015-2023)
2. BusFleet - Bus inventory
3. Routes - Bus routes
4. DailyOperations - Trip records
5. MaintenanceRecords - Maintenance history
6. FuelPurchases - Fuel purchase records
7. Alerts - System alerts

Views Created:
- vw_FleetSummary
- vw_MonthlyRidershipTrends
- vw_FuelCostAnalysis
- vw_BusPerformance

Stored Procedures:
- sp_GetDashboardKPIs
- sp_GetRidershipTrends

Next Steps:
1. Run 05_import_data.sql to load US DOT data
2. Run 06_generate_sample_fleet.sql to create sample bus fleet
3. Build .NET API with Entity Framework models

============================================================================
';
GO
