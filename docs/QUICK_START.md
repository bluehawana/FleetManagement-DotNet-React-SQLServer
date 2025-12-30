# Quick Start Guide
## Get the Project Running in 15 Minutes

---

## ⚡ Fast Track Setup

### Step 1: Clone & Install (2 minutes)

```bash
# Clone repository
git clone https://github.com/bluehawana/FleetManagement-DotNet-React-SQLServer.git
cd FleetManagement-DotNet-React-SQLServer

# Install Python dependencies
pip3 install pandas numpy matplotlib seaborn
```

### Step 2: Process Data (5 minutes)

```bash
cd database/scripts

# Run all 3 scripts in sequence
python3 01_data_exploration.py    # 1 minute - analyze data
python3 02_data_cleaning.py       # 1 minute - clean data
python3 03_generate_sql_schema.py # 1 minute - generate SQL
```

**What you'll see**:
- ✅ Analysis of 924 months of US DOT data
- ✅ 4 cleaned CSV files created
- ✅ SQL database schema generated
- ✅ Business insights: $46K/year savings potential

### Step 3: Create Database (3 minutes)

```bash
# Option A: Using sqlcmd
sqlcmd -S localhost -U sa -P "YourPassword" \
  -i 04_create_database.sql

# Option B: Using SSMS
# 1. Open SQL Server Management Studio
# 2. File → Open → 04_create_database.sql
# 3. Execute (F5)
```

### Step 4: Import Data (5 minutes)

```sql
-- In SSMS:
-- 1. Right-click USBusTransit database
-- 2. Tasks → Import Data
-- 3. Select: database/data/cleaned/us_bus_transit_data_2015_2023.csv
-- 4. Map to: USDOTTransportationStats table
-- 5. Finish

-- Or use BULK INSERT:
BULK INSERT USDOTTransportationStats
FROM 'C:\path\to\us_bus_transit_data_2015_2023.csv'
WITH (FIRSTROW = 2, FIELDTERMINATOR = ',', ROWTERMINATOR = '\n');
```

### Step 5: Verify (1 minute)

```sql
-- Check data
SELECT COUNT(*) FROM USDOTTransportationStats;
-- Expected: 108 rows

-- View ridership trends
SELECT Year, AVG(BusRidership) as AvgRidership
FROM USDOTTransportationStats
WHERE BusRidership IS NOT NULL
GROUP BY Year
ORDER BY Year;

-- Check fuel prices
SELECT Year, AVG(DieselPrice) as AvgDieselPrice
FROM USDOTTransportationStats
WHERE DieselPrice IS NOT NULL
GROUP BY Year
ORDER BY Year;
```

---

## 🎯 What You Have Now

✅ **Real Data**: 108 months of US DOT transportation statistics  
✅ **Clean Database**: 7 tables, 4 views, 2 stored procedures  
✅ **Business Insights**: $46K/year savings potential identified  
✅ **Production Ready**: Professional database schema  

---

## 📊 Quick Data Queries

### See COVID Impact on Ridership

```sql
SELECT 
    Year,
    AVG(BusRidership) as AvgRidership,
    AVG(CASE WHEN IsCOVIDPeriod = 1 THEN BusRidership END) as COVIDRidership
FROM USDOTTransportationStats
WHERE BusRidership IS NOT NULL
GROUP BY Year
ORDER BY Year;
```

### See Fuel Price Trends

```sql
SELECT 
    Year,
    MIN(DieselPrice) as MinPrice,
    MAX(DieselPrice) as MaxPrice,
    AVG(DieselPrice) as AvgPrice
FROM USDOTTransportationStats
WHERE DieselPrice IS NOT NULL
GROUP BY Year
ORDER BY Year;
```

### Calculate Potential Savings

```sql
-- For a 20-bus fleet
DECLARE @FleetSize INT = 20;
DECLARE @MilesPerBus INT = 30000;
DECLARE @MPG DECIMAL(5,2) = 6.0;
DECLARE @OptimizationPercent DECIMAL(5,2) = 0.15;

SELECT 
    Year,
    AVG(DieselPrice) as AvgDieselPrice,
    (@FleetSize * @MilesPerBus / @MPG) * AVG(DieselPrice) as AnnualFuelCost,
    (@FleetSize * @MilesPerBus / @MPG) * AVG(DieselPrice) * @OptimizationPercent as PotentialSavings
FROM USDOTTransportationStats
WHERE DieselPrice IS NOT NULL
GROUP BY Year
ORDER BY Year;
```

---

## 🚀 Next Steps

### Option 1: Build the API (Recommended)

```bash
# Create .NET 8 Web API
cd backend
dotnet new webapi -n BusTransit.API
dotnet new classlib -n BusTransit.Core
dotnet new classlib -n BusTransit.Infrastructure

# Add packages
cd BusTransit.API
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools
dotnet add package Swashbuckle.AspNetCore
```

### Option 2: Document & Share

```bash
# Push to GitHub
git add .
git commit -m "Add data processing pipeline and SQL database"
git push origin main

# Update LinkedIn
# Post about analyzing 924 months of US DOT data
# Mention $46K/year savings potential
# Link to GitHub repo
```

### Option 3: Create Visualizations

```python
# Create charts with matplotlib
import pandas as pd
import matplotlib.pyplot as plt

# Load data
df = pd.read_csv('database/data/cleaned/dashboard_data.csv')

# Plot ridership trends
plt.figure(figsize=(12, 6))
plt.plot(df['Date'], df['BusRidership'])
plt.title('US Bus Ridership Trends (2015-2023)')
plt.xlabel('Date')
plt.ylabel('Passengers per Month')
plt.savefig('docs/screenshots/ridership_trends.png')
```

---

## 💡 Pro Tips

### For Interviews

**When asked "Tell me about a project"**:

> "I built a data-driven bus fleet management system using real US DOT data. I processed 924 months of transportation statistics, cleaned it down to 108 relevant months, and identified a $46,000/year cost savings opportunity for a small city transit authority.
>
> The interesting part was the COVID-19 impact - ridership dropped 55% in 2020, and diesel prices nearly doubled by 2022. I used Python for data analysis, generated a SQL Server database schema, and designed it to support a .NET API and React dashboard.
>
> The project demonstrates real-world data engineering, database design, and business analysis skills."

### For LinkedIn Posts

**Post 1: Data Analysis**
```
🚌 Just analyzed 924 months of US transportation data!

Key findings:
📉 COVID-19 caused 55% drop in bus ridership
⛽ Diesel prices doubled (2020-2022)
💰 Identified $46K/year savings opportunity

Used Python (Pandas) to process 136 metrics down to 15 key indicators for bus fleet management.

#DataAnalysis #Python #Transportation
```

**Post 2: Database Design**
```
🗄️ Designed a production-ready SQL Server database for bus fleet management

Based on real US DOT data:
• 7 tables (fleet, routes, operations, maintenance)
• 4 views (KPIs, trends, performance)
• 2 stored procedures (dashboard, analytics)

From messy CSV to clean database in 3 Python scripts.

#SQLServer #DatabaseDesign #DataEngineering
```

---

## 📚 Documentation

- **Full Workflow**: See `docs/DATA_PROCESSING_WORKFLOW.md`
- **Project Overview**: See `docs/README_PROJECT_OVERVIEW.md`
- **Implementation Plan**: See `docs/PORTFOLIO_PROJECTS_PLAN.md`
- **Data Analysis**: See `docs/DATA_ANALYSIS_SUMMARY.md`

---

## 🆘 Troubleshooting

### Python Import Errors
```bash
pip3 install --upgrade pandas numpy matplotlib seaborn
```

### SQL Server Connection Issues
```bash
# Check if SQL Server is running
docker ps  # If using Docker

# Test connection
sqlcmd -S localhost -U sa -P "YourPassword" -Q "SELECT @@VERSION"
```

### CSV Import Issues
```sql
-- Check file path (use full path)
-- Check CSV format (UTF-8, comma-separated)
-- Check first row (should be headers)
```

---

**You're ready to go! 🚀**

Start with Step 1 and you'll have a working database in 15 minutes.
