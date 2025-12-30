# Data Processing Workflow
## From Raw Kaggle Data to Production Database

---

## 📊 Complete Data Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA PIPELINE                                │
└─────────────────────────────────────────────────────────────────────┘

1. DATA SOURCE (Kaggle)
   ↓
   📥 Monthly_Transportation_Statistics.csv
   • 924 rows (1947-2023)
   • 136 columns
   • ~2.5 MB
   ↓
   
2. DATA EXPLORATION (Python)
   ↓
   🔍 01_data_exploration.py
   • Analyze all 136 columns
   • Identify 40 relevant columns for bus fleet
   • Check data completeness
   • Find trends (COVID, fuel prices)
   ↓
   📊 Analysis Results:
   • Bus ridership: 96 records (2015-2023)
   • Diesel prices: 98 records
   • COVID impact: -55.7% ridership
   • Fuel spike: +95.6% (2020-2022)
   ↓
   
3. DATA CLEANING (Python)
   ↓
   🧹 02_data_cleaning.py
   • Filter to 2015-2023 (108 months)
   • Extract 15 key columns
   • Add calculated fields
   • Generate business insights
   ↓
   📁 Cleaned CSV Files:
   ├── us_bus_transit_data_2015_2023.csv (108 rows, 21 cols)
   ├── ridership_data.csv (96 rows)
   ├── fuel_price_data.csv (98 rows)
   └── dashboard_data.csv (108 rows)
   ↓
   
4. SQL SCHEMA GENERATION (Python)
   ↓
   🏗️ 03_generate_sql_schema.py
   • Analyze cleaned data structure
   • Generate SQL Server schema
   • Create tables, views, procedures
   ↓
   📄 04_create_database.sql (14 KB)
   • 7 tables
   • 4 views
   • 2 stored procedures
   • Indexes & constraints
   ↓
   
5. DATABASE CREATION (SQL Server)
   ↓
   🗄️ SQL Server
   • Run 04_create_database.sql
   • Create USBusTransit database
   • Import cleaned CSV data
   ↓
   ✅ Production Database Ready
   ↓
   
6. API DEVELOPMENT (.NET 8)
   ↓
   🔌 ASP.NET Core Web API
   • Entity Framework models
   • RESTful endpoints
   • Business logic
   ↓
   
7. FRONTEND DASHBOARD (React 18)
   ↓
   🎨 React + TypeScript
   • Data visualizations
   • Interactive charts
   • Real-time monitoring
   ↓
   
8. DEPLOYMENT
   ↓
   ☁️ Azure / Vercel
   • Backend: Azure App Service
   • Frontend: Vercel
   • Database: Azure SQL
```

---

## 🔄 Detailed Process Flow

### Step 1: Data Exploration

**Input**: `Monthly_Transportation_Statistics.csv` (924 rows, 136 columns)

**Process**:
```python
# 01_data_exploration.py
1. Load CSV with pandas
2. Analyze all 136 columns
3. Search for keywords: Transit, Bus, Fuel, Highway, etc.
4. Check data completeness (null percentages)
5. Analyze trends (COVID impact, fuel prices)
6. Generate business insights
```

**Output**: Console report with:
- 40 relevant columns identified
- Data quality metrics
- Key trends and insights
- Recommendations for database design

**Key Findings**:
```
✓ Bus Ridership: 96 complete records (2015-2023)
✓ Diesel Prices: 98 complete records
✓ COVID Impact: -55.7% ridership drop
✓ Fuel Crisis: +95.6% price increase (2020-2022)
```

---

### Step 2: Data Cleaning

**Input**: Raw CSV (924 rows, 136 columns)

**Process**:
```python
# 02_data_cleaning.py
1. Filter to 2015-2023 (most relevant period)
2. Select 15 key columns:
   - Transit Ridership (Bus, Rail, Other)
   - Fuel Prices (Diesel, Gasoline)
   - Highway Miles Traveled
   - Employment Data
   - Economic Indicators
3. Add calculated fields:
   - Year, Month, Quarter
   - COVID period flag (Mar 2020 - Dec 2021)
   - Estimated fuel cost per month
   - Cost per passenger
4. Create 4 specialized CSV files
5. Generate business insights
```

**Output**: 4 cleaned CSV files
```
database/data/cleaned/
├── us_bus_transit_data_2015_2023.csv  # Complete dataset
├── ridership_data.csv                 # Ridership analysis
├── fuel_price_data.csv                # Cost analysis
└── dashboard_data.csv                 # Dashboard metrics
```

**Business Insights Generated**:
```
• Small city fleet (20 buses): $312K/year fuel cost
• 15% optimization savings: $46,807/year
• Average diesel price: $3.12/gallon
• COVID impact: -48.5% average ridership
```

---

### Step 3: SQL Schema Generation

**Input**: Cleaned CSV files (108 rows, 21 columns)

**Process**:
```python
# 03_generate_sql_schema.py
1. Load cleaned data to understand structure
2. Generate SQL Server database schema
3. Create tables based on business requirements:
   - USDOTTransportationStats (historical data)
   - BusFleet (bus inventory)
   - Routes (bus routes)
   - DailyOperations (trip records)
   - MaintenanceRecords (maintenance history)
   - FuelPurchases (fuel tracking)
   - Alerts (system alerts)
4. Add views for common queries
5. Add stored procedures for API endpoints
6. Add indexes for performance
7. Add constraints for data integrity
```

**Output**: `04_create_database.sql` (14 KB)

**Database Structure**:
```sql
-- 7 Tables
USDOTTransportationStats  -- Real US DOT data (2015-2023)
BusFleet                  -- Bus inventory
Routes                    -- Bus routes
DailyOperations           -- Trip records
MaintenanceRecords        -- Maintenance history
FuelPurchases             -- Fuel tracking
Alerts                    -- System alerts

-- 4 Views
vw_FleetSummary           -- Fleet status overview
vw_MonthlyRidershipTrends -- Ridership analysis
vw_FuelCostAnalysis       -- Fuel cost trends
vw_BusPerformance         -- Bus performance metrics

-- 2 Stored Procedures
sp_GetDashboardKPIs       -- Dashboard key metrics
sp_GetRidershipTrends     -- Ridership trend analysis
```

---

### Step 4: Database Creation

**Input**: `04_create_database.sql`

**Process**:
```sql
-- Run in SQL Server Management Studio or sqlcmd
1. Drop existing database (if exists)
2. Create USBusTransit database
3. Create all 7 tables with constraints
4. Create indexes for performance
5. Create 4 views
6. Create 2 stored procedures
```

**Output**: Production-ready SQL Server database

**Verification**:
```sql
-- Check tables
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES;

-- Check views
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.VIEWS;

-- Check stored procedures
SELECT ROUTINE_NAME FROM INFORMATION_SCHEMA.ROUTINES 
WHERE ROUTINE_TYPE = 'PROCEDURE';
```

---

### Step 5: Data Import

**Input**: Cleaned CSV files

**Process**:
```sql
-- Option 1: BULK INSERT (Command Line)
BULK INSERT USDOTTransportationStats
FROM 'database/data/cleaned/us_bus_transit_data_2015_2023.csv'
WITH (
    FIRSTROW = 2,
    FIELDTERMINATOR = ',',
    ROWTERMINATOR = '\n',
    TABLOCK
);

-- Option 2: SQL Server Import Wizard (GUI)
1. Open SSMS
2. Right-click USBusTransit database
3. Tasks → Import Data
4. Select CSV file
5. Map columns to table
6. Execute import
```

**Output**: Database populated with real data

**Verification**:
```sql
-- Check record count
SELECT COUNT(*) FROM USDOTTransportationStats;
-- Expected: 108 rows

-- Check date range
SELECT MIN(Date), MAX(Date) FROM USDOTTransportationStats;
-- Expected: 2015-01-01 to 2023-12-01

-- Check ridership data
SELECT AVG(BusRidership) FROM USDOTTransportationStats 
WHERE BusRidership IS NOT NULL;
-- Expected: ~330M passengers/month
```

---

## 📊 Data Transformation Summary

| Stage | Input | Output | Size | Records |
|-------|-------|--------|------|---------|
| **Raw Data** | Kaggle CSV | - | 2.5 MB | 924 rows, 136 cols |
| **Exploration** | Raw CSV | Analysis Report | - | 40 relevant cols identified |
| **Cleaning** | Raw CSV | 4 Clean CSVs | ~50 KB | 108 rows, 21 cols |
| **Schema** | Clean CSVs | SQL Script | 14 KB | 7 tables, 4 views |
| **Database** | SQL Script | SQL Server DB | - | Production ready |

---

## 🎯 Data Quality Metrics

### Completeness (2015-2023)

| Metric | Records | Completeness |
|--------|---------|--------------|
| Bus Ridership | 96 / 108 | 88.9% |
| Diesel Prices | 98 / 108 | 90.7% |
| Highway Miles | 50 / 108 | 46.3% |
| Employment | 97 / 108 | 89.8% |
| **Overall** | - | **85%+** |

### Data Ranges

| Metric | Min | Max | Average |
|--------|-----|-----|---------|
| Bus Ridership | 111M | 464M | 331M passengers/month |
| Diesel Price | $2.00 | $5.75 | $3.12/gallon |
| Highway Miles | 168B | 296B | 262B miles/month |

### Trend Analysis

**COVID-19 Impact**:
- Pre-COVID (2015-2020 Feb): 396M passengers/month
- COVID Period (2020 Mar-Dec): 175M passengers/month (**-55.7%**)
- Post-COVID (2021-2023): 226M passengers/month (**+28.8% recovery**)

**Fuel Price Volatility**:
- 2020 Low: $2.00/gallon
- 2022 Peak: $5.75/gallon (**+187% increase**)
- 2023 Average: $4.49/gallon

---

## 🔧 Tools & Technologies

### Data Processing
- **Python 3.9+** - Data analysis and cleaning
- **Pandas** - Data manipulation
- **NumPy** - Numerical operations
- **Matplotlib/Seaborn** - Data visualization

### Database
- **SQL Server 2022** - Production database
- **SSMS** - Database management
- **T-SQL** - Stored procedures and views

### Development (Next Phase)
- **.NET 8** - Backend API
- **Entity Framework Core** - ORM
- **React 18** - Frontend dashboard
- **TypeScript** - Type safety

---

## 📝 Best Practices Applied

### Data Processing
✅ **Reproducible** - All scripts can be re-run  
✅ **Documented** - Clear comments and output  
✅ **Validated** - Data quality checks at each step  
✅ **Versioned** - All scripts in Git  

### Database Design
✅ **Normalized** - Proper table relationships  
✅ **Indexed** - Performance optimization  
✅ **Constrained** - Data integrity rules  
✅ **Documented** - Clear table/column names  

### Code Quality
✅ **Modular** - Separate scripts for each step  
✅ **Reusable** - Functions can be imported  
✅ **Tested** - Validation at each stage  
✅ **Professional** - Production-ready code  

---

## 🚀 Next Steps

1. ✅ Data exploration complete
2. ✅ Data cleaning complete
3. ✅ SQL schema generated
4. ⏳ Import data to SQL Server
5. ⏳ Build .NET 8 Web API
6. ⏳ Create React dashboard
7. ⏳ Deploy to Azure/Vercel

---

**This workflow demonstrates**:
- Professional data engineering practices
- Real-world data processing skills
- Database design expertise
- Business analysis capabilities
- Production-ready development approach
