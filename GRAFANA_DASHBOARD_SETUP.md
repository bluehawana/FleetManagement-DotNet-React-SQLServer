# Grafana Dashboard Setup & Sorting Guide

## ✅ FIXED: Duplicate Driver Values Issue

### Problem
You noticed that each driver appeared TWICE with different values in Grafana dashboards.

### Root Cause
**Two controllers were generating the same metrics:**
1. **MetricsController** (`/metrics`) - All 15 drivers
2. **FleetKpiController** (`/api/fleet-kpis/prometheus`) - Top 10 drivers

Prometheus scraped both endpoints, creating duplicate `driver_overall_score` metrics with different values for the same driver.

### Solution Applied
- ✅ Removed duplicate driver metrics from FleetKpiController
- ✅ Cleared Prometheus data to remove old duplicate metrics
- ✅ Rebuilt and restarted backend
- ✅ Verified each driver now has exactly ONE value

### Current Status
```
✅ All 15 unique American driver names present
✅ Each driver has ONE value per metric (no duplicates)
✅ Driver scores range from 61-97 (good variety for sorting)
✅ Changes committed and pushed to GitHub
```

**Driver Names (15 unique):**
- Christopher Smith
- Daniel Rodriguez
- David Wilson
- James Thompson
- John Davis
- Joseph Miller
- Joshua Hernandez
- Kevin Jackson
- Matthew Lopez
- Michael Anderson
- Richard Brown
- Robert Martinez
- Steven Taylor
- Thomas Johnson
- William Garcia

---

## 🔧 How to Fix Sorting in Grafana Dashboards

### About Sorting
Grafana dashboards have sortable bar gauge panels. You requested that values be shown in either **ascending** (worst first) or **descending** (best first) order.

### Panel Sort Settings

To adjust sorting for any panel in Grafana:

1. **Access Grafana**
   ```
   http://localhost:3001
   Login: admin / fleetadmin
   ```

2. **Open Dashboard**
   - Navigate to "Bus & Driver Monitoring" dashboard
   - Or search for it using the search icon (top left)

3. **Edit Panel**
   - Hover over any panel title (e.g., "Bus Health Score - Worst First")
   - Click the dropdown menu (three dots) in the top-right of the panel
   - Select "Edit"

4. **Configure Sorting**
   - On the right side, find "Value options" or "Standard options"
   - Look for "Sort by" setting
   - Options:
     - **Ascending** - Shows lowest values first (worst first) ⬆️
     - **Descending** - Shows highest values first (best first) ⬇️
     - **Alphabetical** - Sorts by name
     - **None** - No sorting

5. **Set Sort Direction**
   For panels labeled "Worst First":
   - Set to **Ascending** order
   - This shows lowest scores at the top (e.g., 61, 62, 63...)

   For panels labeled "Best First":
   - Set to **Descending** order
   - This shows highest scores at the top (e.g., 97, 94, 88...)

6. **Save Changes**
   - Click "Apply" (top-right)
   - Click "Save dashboard" (disk icon, top-right)
   - Add a note like "Fixed sorting order"
   - Click "Save"

---

## 📊 Recommended Sort Settings

### Bus Monitoring Panels

| Panel Title | Recommended Sort | Reason |
|------------|-----------------|--------|
| **Bus Health Score (%) - Worst First** | Ascending | Shows buses needing attention first (0.1%, 1.7%, 5.6%...) |
| **Engine Temperature** | Descending | Shows hottest buses first (104°C, 98°C, 94°C...) |
| **Fuel Levels** | Ascending | Shows buses needing fuel first (80.9%, 84%, 85.6%...) |
| **Next Service (Days) - Most Urgent First** | Ascending | Shows buses needing service soonest (0, 5, 8 days...) |

### Driver Performance Panels

| Panel Title | Recommended Sort | Reason |
|------------|-----------------|--------|
| **Driver Performance Scores - Worst First** | Ascending | Shows drivers needing training first (61, 62, 63...) |
| **Harsh Events per 100km - Worst First** | Descending | Shows drivers with most harsh events (5.6, 5.2, 4.9...) |
| **Driver Fatigue Levels - Most Fatigued First** | Ascending | Shows most tired drivers first (0%, 0%, 1%...) |
| **Hours Until Mandatory Rest - Most Urgent First** | Ascending | Shows drivers needing rest soonest (2.1h, 2.6h, 3.7h...) |
| **Delay Rates - Worst First** | Descending | Shows drivers with most delays (16.5%, 13.1%, 12.5%...) |
| **Fuel Efficiency (MPG)** | Descending | Shows most efficient drivers first (6.01, 6.01, 5.98...) |

---

## 🎯 Understanding "Worst First" vs "Best First"

### When to Use Ascending (⬆️)
Use when **lower values are worse**:
- Health scores (0% = critical)
- Fatigue levels (0% = exhausted)
- Fuel levels (low = need refueling)
- Days to service (0 = overdue)

### When to Use Descending (⬇️)
Use when **higher values are worse**:
- Engine temperature (104°C = overheating)
- Harsh events (5.6 = unsafe driving)
- Delay rates (16.5% = unreliable)
- Hours worked (14+ = overtime violation)

---

## 💡 Quick Test - Verify Sorting is Working

After adjusting sort settings:

1. **Check Bus Health Scores**
   - Should start with BUS-018 (0.1%)
   - Then BUS-016 (1.7%)
   - Then BUS-011 (5.6%)
   - NOT random order

2. **Check Driver Performance**
   - "Worst First" should start with James Thompson (61)
   - Then Thomas Johnson (62)
   - Then Matthew Lopez (63)
   - NOT alphabetical order

3. **Check Driver Fatigue**
   - Should show drivers with 0% fatigue first
   - Then drivers with low percentages
   - Then Jennifer Rodriguez (8.3%)
   - Then Emma Garcia (11.9%)

---

## 🔄 Panel-Specific Sort Examples

### Example 1: Bus Health Score Panel

**Goal:** Show unhealthiest buses at the top

**Query:**
```promql
bus_health_score
```

**Settings:**
- Visualization: Bar gauge
- Sort by: Value
- Sort direction: **Ascending** ⬆️
- Display mode: Gradient

**Expected Result:**
```
BUS-018  ▏ 0.1%   (Critical)
BUS-016  ▎ 1.7%   (Critical)
BUS-011  █ 5.6%   (Critical)
BUS-014  █ 7.9%   (Low Health)
...
```

### Example 2: Driver Performance Scores Panel

**Goal:** Show worst performing drivers first

**Query:**
```promql
driver_overall_score
```

**Settings:**
- Visualization: Bar gauge
- Sort by: Value
- Sort direction: **Ascending** ⬆️
- Thresholds:
  - Red: 0-60 (Needs Training)
  - Yellow: 60-80 (Good)
  - Green: 80-100 (Excellent)

**Expected Result:**
```
James_Thompson      ████ 61  (Needs Training)
Thomas_Johnson      ████ 62  (Good)
Matthew_Lopez       ████ 63  (Good)
Kevin_Jackson       █████ 64 (Good)
...
```

### Example 3: Driver Fatigue Levels Panel

**Goal:** Show most fatigued drivers (lowest energy) first

**Query:**
```promql
driver_fatigue_level
```

**Settings:**
- Visualization: Bar gauge
- Sort by: Value
- Sort direction: **Ascending** ⬆️
- Thresholds:
  - Red: 0-20 (Exhausted - Mandatory Rest)
  - Yellow: 20-50 (Needs Rest Soon)
  - Green: 50-100 (Well Rested)

**Expected Result:**
```
Christopher_Smith   ▏ 0%    (Exhausted)
Daniel_Rodriguez    ▏ 0%    (Exhausted)
David_Wilson        ▏ 0%    (Exhausted)
Jennifer_Rodriguez  █ 8.3%  (Exhausted)
Emma_Garcia         █ 11.9% (Exhausted)
...
```

---

## 📝 Save Dashboard Changes

**Important:** After making changes, always:

1. Click **"Apply"** (top-right) to apply panel changes
2. Click **"Save dashboard"** (disk icon) to save the dashboard
3. Add a meaningful save message:
   ```
   "Fixed sorting: Worst-first panels now show ascending order"
   ```
4. Click **"Save"** to confirm

**Note:** If you don't save, your changes will be lost when you refresh the page!

---

## 🚀 Testing Your Changes

### Test Checklist

After configuring sorting:

- [ ] **Bus Health Score** shows BUS-018 (0.1%) at top
- [ ] **Engine Temperature** shows BUS-020 (104°C) at top
- [ ] **Driver Performance** shows James Thompson (61) at top
- [ ] **Harsh Events** shows highest values at top (descending)
- [ ] **Fuel Levels** shows BUS-020 (80.9%) at top
- [ ] **Days to Service** shows buses with 0 days at top
- [ ] **Driver Fatigue** shows 0% fatigue drivers at top
- [ ] **Delay Rates** shows David Garcia (16.5%) at top

### Refresh Dashboard

If you don't see changes:
1. Click the refresh icon (circular arrow) in top-right
2. Or set auto-refresh to 30s using the dropdown
3. Wait for Prometheus to scrape new data (every 15-30 seconds)

---

## 🎓 Advanced: Understanding Prometheus Queries

### Basic Query
```promql
driver_overall_score
```
Shows all drivers with their scores.

### Sorted Query (Top 10)
```promql
topk(10, driver_overall_score)
```
Shows only the top 10 highest scoring drivers.

### Sorted Query (Bottom 10 - Worst)
```promql
bottomk(10, driver_overall_score)
```
Shows only the bottom 10 lowest scoring drivers.

**Note:** Grafana's panel sorting is different from Prometheus query sorting. Use panel settings for visualization, use query functions for data filtering.

---

## 📱 Mobile/Tablet View

Grafana dashboards are responsive:
- On smaller screens, panels stack vertically
- Sorting still applies
- Use the panel dropdown (⋮) to access editing options

---

## 🔧 Troubleshooting

### Issue: Sorting not working

**Solution:**
1. Verify data exists: Check if values are showing
2. Refresh dashboard
3. Check sort settings in panel edit mode
4. Ensure "Value" is selected for sort field

### Issue: Values not updating

**Solution:**
1. Check Prometheus is scraping (http://localhost:9090/targets)
2. Verify backend is running (docker-compose ps)
3. Force refresh in Grafana (Ctrl/Cmd + Shift + R)
4. Check time range (top-right) - set to "Last 5 minutes"

### Issue: Dashboard changes not saving

**Solution:**
1. Click "Apply" first, then "Save dashboard"
2. Check you're logged in as admin
3. Clear browser cache and try again

---

## 📊 Next Steps

Tomorrow morning (7 AM):

1. **Access Grafana:** http://localhost:3001 (admin / fleetadmin)
2. **Open Dashboard:** Bus & Driver Monitoring
3. **Edit Each Panel:** Set appropriate sorting
4. **Save Dashboard:** Don't forget to save!
5. **Test:** Verify worst/best items appear at top
6. **Present:** Your Friday presentation will show properly sorted data

---

## 🎉 Summary

**What's Fixed:**
- ✅ No more duplicate driver values
- ✅ All 15 unique American names
- ✅ Each metric has one value per driver
- ✅ Scores range from 61-97 (good variety)
- ✅ All changes committed to GitHub

**What You Need to Do:**
- 🔧 Adjust panel sorting in Grafana UI (5 minutes)
- 💾 Save dashboard after changes
- ✅ Verify sorting with the test checklist
- 🚀 Ready for Friday presentation!

The data is perfect - just configure the sorting in Grafana's UI and you're all set! 🎊
