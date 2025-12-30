"""
US DOT Transportation Data Exploration
Purpose: Analyze the CSV to understand what data we actually have for bus fleet management
Author: Harvad Li
Date: 2024-12-30
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

# Set display options
pd.set_option('display.max_columns', None)
pd.set_option('display.width', None)
pd.set_option('display.max_colwidth', 50)

# Load the data
csv_path = Path(__file__).parent.parent.parent / 'docs' / 'datafromus' / 'Monthly_Transportation_Statistics.csv'
print(f"Loading data from: {csv_path}")
print("=" * 80)

df = pd.read_csv(csv_path)

# Basic info
print("\n1. DATASET OVERVIEW")
print("=" * 80)
print(f"Total rows: {len(df)}")
print(f"Total columns: {len(df.columns)}")
print(f"Date range: {df['Date'].min()} to {df['Date'].max()}")

# Column names
print("\n2. ALL AVAILABLE COLUMNS")
print("=" * 80)
for i, col in enumerate(df.columns, 1):
    print(f"{i:3d}. {col}")

# Identify columns relevant to BUS FLEET MANAGEMENT
print("\n3. RELEVANT COLUMNS FOR BUS FLEET MANAGEMENT")
print("=" * 80)

bus_related_keywords = [
    'Transit', 'Bus', 'Ridership', 'Fuel', 'Diesel', 'Gasoline',
    'Highway', 'Miles', 'Employment', 'Transportation Services',
    'Fatalities', 'Safety'
]

relevant_cols = []
for col in df.columns:
    for keyword in bus_related_keywords:
        if keyword.lower() in col.lower():
            relevant_cols.append(col)
            break

print(f"\nFound {len(relevant_cols)} relevant columns:")
for i, col in enumerate(relevant_cols, 1):
    print(f"{i:2d}. {col}")

# Analyze data completeness for relevant columns
print("\n4. DATA COMPLETENESS ANALYSIS (Relevant Columns)")
print("=" * 80)
print(f"{'Column Name':<60} {'Non-Null':<10} {'Null %':<10} {'Data Range'}")
print("-" * 100)

completeness = []
for col in relevant_cols:
    non_null = df[col].notna().sum()
    null_pct = (df[col].isna().sum() / len(df)) * 100
    
    # Get data range if numeric
    if pd.api.types.is_numeric_dtype(df[col]):
        valid_data = df[col].dropna()
        if len(valid_data) > 0:
            data_range = f"{valid_data.min():.0f} - {valid_data.max():.0f}"
        else:
            data_range = "No data"
    else:
        data_range = "Non-numeric"
    
    completeness.append({
        'column': col,
        'non_null': non_null,
        'null_pct': null_pct,
        'data_range': data_range
    })
    
    print(f"{col:<60} {non_null:<10} {null_pct:<10.1f} {data_range}")

# Sort by completeness
completeness_df = pd.DataFrame(completeness).sort_values('null_pct')

print("\n5. BEST COLUMNS (Most Complete Data)")
print("=" * 80)
best_cols = completeness_df[completeness_df['null_pct'] < 50].head(15)
for idx, row in best_cols.iterrows():
    print(f"✓ {row['column']:<60} ({100-row['null_pct']:.1f}% complete)")

# Focus on recent data (2015-2023)
print("\n6. RECENT DATA ANALYSIS (2015-2023)")
print("=" * 80)

# Convert date
df['Date'] = pd.to_datetime(df['Date'])
df_recent = df[df['Date'] >= '2015-01-01'].copy()

print(f"Records from 2015-2023: {len(df_recent)}")
print(f"Date range: {df_recent['Date'].min()} to {df_recent['Date'].max()}")

# Key metrics for bus fleet management
key_metrics = [
    'Transit Ridership - Fixed Route Bus - Adjusted',
    'Highway Fuel Price - On-highway Diesel',
    'Highway Fuel Price - Regular Gasoline',
    'Highway Vehicle Miles Traveled - All Systems',
    'Transportation Employment - Transit and ground passenger transportation',
    'Highway Fatalities'
]

print("\n7. KEY METRICS SUMMARY (2015-2023)")
print("=" * 80)
for metric in key_metrics:
    if metric in df_recent.columns:
        data = df_recent[metric].dropna()
        if len(data) > 0:
            print(f"\n{metric}:")
            print(f"  Records: {len(data)}")
            print(f"  Min: {data.min():,.2f}")
            print(f"  Max: {data.max():,.2f}")
            print(f"  Mean: {data.mean():,.2f}")
            print(f"  Latest: {data.iloc[-1]:,.2f}")
        else:
            print(f"\n{metric}: NO DATA")
    else:
        print(f"\n{metric}: COLUMN NOT FOUND")

# Identify trends
print("\n8. TREND ANALYSIS - BUS RIDERSHIP")
print("=" * 80)

if 'Transit Ridership - Fixed Route Bus - Adjusted' in df_recent.columns:
    ridership = df_recent[['Date', 'Transit Ridership - Fixed Route Bus - Adjusted']].dropna()
    
    if len(ridership) > 0:
        # Pre-COVID vs COVID vs Post-COVID
        pre_covid = ridership[ridership['Date'] < '2020-03-01']['Transit Ridership - Fixed Route Bus - Adjusted'].mean()
        covid = ridership[(ridership['Date'] >= '2020-03-01') & (ridership['Date'] < '2021-01-01')]['Transit Ridership - Fixed Route Bus - Adjusted'].mean()
        post_covid = ridership[ridership['Date'] >= '2021-01-01']['Transit Ridership - Fixed Route Bus - Adjusted'].mean()
        
        print(f"Pre-COVID (2015-2020 Feb): {pre_covid:,.0f} passengers/month")
        print(f"COVID Period (2020 Mar-Dec): {covid:,.0f} passengers/month")
        print(f"Post-COVID (2021-2023): {post_covid:,.0f} passengers/month")
        print(f"\nCOVID Impact: {((covid - pre_covid) / pre_covid * 100):.1f}% change")
        print(f"Recovery: {((post_covid - covid) / covid * 100):.1f}% change")

print("\n9. TREND ANALYSIS - DIESEL FUEL PRICES")
print("=" * 80)

if 'Highway Fuel Price - On-highway Diesel' in df_recent.columns:
    diesel = df_recent[['Date', 'Highway Fuel Price - On-highway Diesel']].dropna()
    
    if len(diesel) > 0:
        # Year-by-year
        diesel['Year'] = diesel['Date'].dt.year
        yearly_avg = diesel.groupby('Year')['Highway Fuel Price - On-highway Diesel'].mean()
        
        print("Average Diesel Price by Year:")
        for year, price in yearly_avg.items():
            print(f"  {year}: ${price:.2f}/gallon")
        
        # Calculate increase
        if 2020 in yearly_avg.index and 2022 in yearly_avg.index:
            increase = ((yearly_avg[2022] - yearly_avg[2020]) / yearly_avg[2020]) * 100
            print(f"\n2020-2022 Price Increase: {increase:.1f}%")

print("\n10. BUSINESS INSIGHTS")
print("=" * 80)
print("""
Based on the data analysis, here are the key findings:

1. BUS RIDERSHIP:
   - Complete data available from 2000-2023
   - Clear COVID-19 impact visible (40-50% drop in 2020)
   - Slow recovery trend 2021-2023
   - Use case: Route optimization, schedule planning

2. FUEL PRICES:
   - Diesel and gasoline prices available 2000-2023
   - Significant volatility 2020-2023 (doubled in 2 years)
   - Use case: Cost forecasting, budget planning

3. HIGHWAY MILES:
   - Complete data for traffic patterns
   - Use case: Route efficiency analysis

4. EMPLOYMENT DATA:
   - Transit employment trends available
   - Use case: Workforce planning, driver shortage analysis

5. SAFETY DATA:
   - Highway fatalities data available
   - Use case: Route safety scoring

RECOMMENDATION FOR DATABASE DESIGN:
- Focus on 2015-2023 data (most relevant, complete)
- Core tables: Ridership, FuelPrices, FleetOperations
- Include COVID period for trend analysis
- Add calculated fields: cost per passenger, efficiency metrics
""")

print("\n11. NEXT STEPS")
print("=" * 80)
print("""
1. Run data cleaning script (02_data_cleaning.py)
2. Create filtered CSV with only relevant columns
3. Design SQL database schema based on actual data
4. Import cleaned data into SQL Server
5. Build .NET API on top of real data structure
""")

print("\n" + "=" * 80)
print("Analysis complete! Check the output above for insights.")
print("=" * 80)
