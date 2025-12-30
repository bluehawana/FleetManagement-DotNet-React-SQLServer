"""
US DOT Transportation Data Cleaning
Purpose: Extract and clean only the columns needed for bus fleet management
Author: Harvad Li
Date: 2024-12-30
"""

import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime

print("=" * 80)
print("US DOT DATA CLEANING FOR BUS FLEET MANAGEMENT")
print("=" * 80)

# Paths
csv_path = Path(__file__).parent.parent.parent / 'docs' / 'datafromus' / 'Monthly_Transportation_Statistics.csv'
output_dir = Path(__file__).parent.parent / 'data' / 'cleaned'
output_dir.mkdir(parents=True, exist_ok=True)

# Load data
print("\n1. Loading raw data...")
df = pd.read_csv(csv_path)
print(f"   Loaded {len(df)} rows, {len(df.columns)} columns")

# Convert date
df['Date'] = pd.to_datetime(df['Date'])

# Filter to recent data (2015-2023) - most relevant and complete
print("\n2. Filtering to 2015-2023 (most relevant period)...")
df_filtered = df[df['Date'] >= '2015-01-01'].copy()
print(f"   Filtered to {len(df_filtered)} rows")

# Select only columns we need for bus fleet management
print("\n3. Selecting relevant columns...")

columns_to_keep = {
    # Date
    'Date': 'Date',
    
    # Bus Ridership (PRIMARY METRIC)
    'Transit Ridership - Fixed Route Bus - Adjusted': 'BusRidership',
    'Transit Ridership - Urban Rail - Adjusted': 'RailRidership',
    'Transit Ridership - Other Transit Modes - Adjusted': 'OtherTransitRidership',
    
    # Fuel Prices (COST ANALYSIS)
    'Highway Fuel Price - On-highway Diesel': 'DieselPrice',
    'Highway Fuel Price - Regular Gasoline': 'GasolinePrice',
    
    # Highway/Traffic Data (ROUTE OPTIMIZATION)
    'Highway Vehicle Miles Traveled - All Systems': 'HighwayMilesTraveled',
    'Highway Fatalities': 'HighwayFatalities',
    'Highway Fatalities Per 100 Million Vehicle Miles Traveled': 'FatalityRate',
    
    # Employment (WORKFORCE PLANNING)
    'Transportation Employment - Transit and ground passenger transportation': 'TransitEmployment',
    'Transportation Employment - Truck Transportation': 'TruckEmployment',
    
    # Economic Indicators
    'Unemployment Rate - Seasonally Adjusted': 'UnemploymentRate',
    'Real Gross Domestic Product - Seasonally Adjusted': 'GDP',
    
    # Vehicle Sales (MARKET TRENDS)
    'Heavy truck sales': 'HeavyTruckSales',
    'Auto sales': 'AutoSales',
}

# Check which columns exist
available_cols = {}
missing_cols = []

for original, new_name in columns_to_keep.items():
    if original in df_filtered.columns:
        available_cols[original] = new_name
    else:
        missing_cols.append(original)

print(f"   Found {len(available_cols)} out of {len(columns_to_keep)} columns")
if missing_cols:
    print(f"   Missing columns: {len(missing_cols)}")
    for col in missing_cols:
        print(f"     - {col}")

# Create cleaned dataframe
df_clean = df_filtered[list(available_cols.keys())].copy()
df_clean.rename(columns=available_cols, inplace=True)

# Add calculated fields
print("\n4. Adding calculated fields...")

# Year, Month for grouping
df_clean['Year'] = df_clean['Date'].dt.year
df_clean['Month'] = df_clean['Date'].dt.month
df_clean['Quarter'] = df_clean['Date'].dt.quarter

# COVID period flag
df_clean['IsCOVIDPeriod'] = (df_clean['Date'] >= '2020-03-01') & (df_clean['Date'] <= '2021-12-31')

# Calculate cost per passenger (if we have both ridership and fuel price)
if 'BusRidership' in df_clean.columns and 'DieselPrice' in df_clean.columns:
    # Assume average bus gets 6 MPG and travels 30,000 miles/month
    avg_miles_per_month = 30000
    avg_mpg = 6
    gallons_per_month = avg_miles_per_month / avg_mpg
    
    df_clean['EstimatedFuelCostPerMonth'] = df_clean['DieselPrice'] * gallons_per_month
    df_clean['EstimatedCostPerPassenger'] = df_clean['EstimatedFuelCostPerMonth'] / df_clean['BusRidership']

# Data quality summary
print("\n5. Data Quality Summary:")
print("-" * 80)
print(f"{'Column':<35} {'Non-Null':<10} {'Null %':<10} {'Min':<15} {'Max':<15}")
print("-" * 80)

for col in df_clean.columns:
    if col != 'Date':
        non_null = df_clean[col].notna().sum()
        null_pct = (df_clean[col].isna().sum() / len(df_clean)) * 100
        
        if pd.api.types.is_numeric_dtype(df_clean[col]):
            valid_data = df_clean[col].dropna()
            if len(valid_data) > 0:
                min_val = f"{valid_data.min():.2f}"
                max_val = f"{valid_data.max():.2f}"
            else:
                min_val = "N/A"
                max_val = "N/A"
        else:
            min_val = "N/A"
            max_val = "N/A"
        
        print(f"{col:<35} {non_null:<10} {null_pct:<10.1f} {min_val:<15} {max_val:<15}")

# Save cleaned data
print("\n6. Saving cleaned data...")

# Main cleaned file
output_file = output_dir / 'us_bus_transit_data_2015_2023.csv'
df_clean.to_csv(output_file, index=False)
print(f"   ✓ Saved: {output_file}")
print(f"   Rows: {len(df_clean)}, Columns: {len(df_clean.columns)}")

# Create separate files for different purposes

# 6a. Ridership data only (for ridership analysis)
if 'BusRidership' in df_clean.columns:
    ridership_cols = ['Date', 'Year', 'Month', 'Quarter', 'BusRidership', 'RailRidership', 
                      'OtherTransitRidership', 'IsCOVIDPeriod']
    ridership_cols = [c for c in ridership_cols if c in df_clean.columns]
    df_ridership = df_clean[ridership_cols].dropna(subset=['BusRidership'])
    
    output_file = output_dir / 'ridership_data.csv'
    df_ridership.to_csv(output_file, index=False)
    print(f"   ✓ Saved: {output_file} ({len(df_ridership)} rows)")

# 6b. Fuel price data (for cost analysis)
if 'DieselPrice' in df_clean.columns:
    fuel_cols = ['Date', 'Year', 'Month', 'DieselPrice', 'GasolinePrice']
    fuel_cols = [c for c in fuel_cols if c in df_clean.columns]
    df_fuel = df_clean[fuel_cols].dropna(subset=['DieselPrice'])
    
    output_file = output_dir / 'fuel_price_data.csv'
    df_fuel.to_csv(output_file, index=False)
    print(f"   ✓ Saved: {output_file} ({len(df_fuel)} rows)")

# 6c. Combined metrics (for dashboard)
dashboard_cols = ['Date', 'Year', 'Month', 'Quarter', 'BusRidership', 'DieselPrice', 
                  'HighwayMilesTraveled', 'TransitEmployment', 'IsCOVIDPeriod',
                  'EstimatedCostPerPassenger']
dashboard_cols = [c for c in dashboard_cols if c in df_clean.columns]
df_dashboard = df_clean[dashboard_cols].copy()

output_file = output_dir / 'dashboard_data.csv'
df_dashboard.to_csv(output_file, index=False)
print(f"   ✓ Saved: {output_file} ({len(df_dashboard)} rows)")

# Generate summary statistics
print("\n7. Summary Statistics (2015-2023):")
print("=" * 80)

if 'BusRidership' in df_clean.columns:
    ridership = df_clean['BusRidership'].dropna()
    print(f"\nBUS RIDERSHIP:")
    print(f"  Total records: {len(ridership)}")
    print(f"  Average: {ridership.mean():,.0f} passengers/month")
    print(f"  Min: {ridership.min():,.0f} (likely COVID period)")
    print(f"  Max: {ridership.max():,.0f}")
    print(f"  Latest: {ridership.iloc[-1]:,.0f}")
    
    # Pre vs Post COVID
    pre_covid = df_clean[~df_clean['IsCOVIDPeriod']]['BusRidership'].mean()
    covid = df_clean[df_clean['IsCOVIDPeriod']]['BusRidership'].mean()
    print(f"\n  Pre/Post COVID avg: {pre_covid:,.0f}")
    print(f"  During COVID avg: {covid:,.0f}")
    print(f"  COVID Impact: {((covid - pre_covid) / pre_covid * 100):.1f}%")

if 'DieselPrice' in df_clean.columns:
    diesel = df_clean['DieselPrice'].dropna()
    print(f"\nDIESEL PRICES:")
    print(f"  Total records: {len(diesel)}")
    print(f"  Average: ${diesel.mean():.2f}/gallon")
    print(f"  Min: ${diesel.min():.2f}")
    print(f"  Max: ${diesel.max():.2f}")
    print(f"  Latest: ${diesel.iloc[-1]:.2f}")
    
    # 2020 vs 2022
    price_2020 = df_clean[df_clean['Year'] == 2020]['DieselPrice'].mean()
    price_2022 = df_clean[df_clean['Year'] == 2022]['DieselPrice'].mean()
    if not pd.isna(price_2020) and not pd.isna(price_2022):
        print(f"\n  2020 average: ${price_2020:.2f}")
        print(f"  2022 average: ${price_2022:.2f}")
        print(f"  Increase: {((price_2022 - price_2020) / price_2020 * 100):.1f}%")

# Business insights
print("\n8. BUSINESS INSIGHTS FOR BUS FLEET MANAGEMENT:")
print("=" * 80)

insights = []

if 'BusRidership' in df_clean.columns and 'DieselPrice' in df_clean.columns:
    # Calculate potential savings
    avg_ridership = df_clean['BusRidership'].mean()
    avg_diesel = df_clean['DieselPrice'].mean()
    
    # Assume 20-bus fleet, each bus 30K miles/year, 6 MPG
    fleet_size = 20
    miles_per_bus = 30000
    mpg = 6
    
    annual_gallons = (fleet_size * miles_per_bus) / mpg
    annual_fuel_cost = annual_gallons * avg_diesel
    
    # 15% savings from optimization
    potential_savings = annual_fuel_cost * 0.15
    
    insights.append(f"• Small city fleet (20 buses): ${annual_fuel_cost:,.0f}/year fuel cost")
    insights.append(f"• 15% optimization savings: ${potential_savings:,.0f}/year")
    insights.append(f"• Cost per gallon: ${avg_diesel:.2f}")
    insights.append(f"• Annual gallons needed: {annual_gallons:,.0f}")

if 'BusRidership' in df_clean.columns:
    latest_ridership = df_clean['BusRidership'].iloc[-1]
    pre_covid_avg = df_clean[df_clean['Date'] < '2020-03-01']['BusRidership'].mean()
    
    if not pd.isna(latest_ridership) and not pd.isna(pre_covid_avg):
        recovery_pct = (latest_ridership / pre_covid_avg) * 100
        insights.append(f"• Current ridership at {recovery_pct:.0f}% of pre-COVID levels")
        insights.append(f"• Opportunity: Optimize routes to match new demand patterns")

for insight in insights:
    print(insight)

print("\n9. NEXT STEPS:")
print("=" * 80)
print("""
✓ Data cleaned and ready for database import
✓ Created 4 CSV files:
  1. us_bus_transit_data_2015_2023.csv (complete dataset)
  2. ridership_data.csv (ridership analysis)
  3. fuel_price_data.csv (cost analysis)
  4. dashboard_data.csv (dashboard metrics)

Next:
1. Design SQL database schema based on cleaned data structure
2. Create SQL import scripts
3. Build .NET API with Entity Framework models matching real data
4. Create React dashboard using actual metrics
""")

print("\n" + "=" * 80)
print("DATA CLEANING COMPLETE!")
print("=" * 80)
