# Day 2: Complete Backend Setup Guide

## 🎯 Goal
Build a production-ready .NET 8 Web API with Entity Framework Core, connected to SQL Server database.

## ⏱️ Time Estimate: 6-8 hours

---

## Part 1: Database Setup (1 hour)

### Option A: Azure SQL Database (Recommended for iPad)

1. **Create Azure SQL Database**
   - Go to https://portal.azure.com
   - Create Resource → SQL Database
   - Choose Free tier or Basic ($5/month)
   - Note: Server name, database name, admin credentials

2. **Run Database Script**
   - Open Query Editor in Azure Portal
   - Copy entire content from `database/scripts/04_create_database.sql`
   - Execute script
   - Verify 7 tables created

3. **Import CSV Data**
   - Use Azure Data Studio or Import Wizard
   - Import files from `database/data/cleaned/`
   - Verify data imported correctly

### Option B: Docker SQL Server (Codespaces)

```bash
# Start SQL Server container
docker run -e "ACCEPT_EULA=Y" \
  -e "SA_PASSWORD=YourStrong@Passw0rd123" \
  -p 1433:1433 \
  --name sqlserver \
  -d mcr.microsoft.com/mssql/server:2022-latest

# Wait 30 seconds for startup
sleep 30

# Copy SQL script to container
docker cp database/scripts/04_create_database.sql sqlserver:/tmp/

# Execute script
docker exec -it sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P 'YourStrong@Passw0rd123' \
  -i /tmp/04_create_database.sql
```

---

## Part 2: Project Structure (30 minutes)


### Create Solution and Projects

```bash
cd backend

# Create solution
dotnet new sln -n FleetManagement

# Create projects
dotnet new webapi -n FleetManagement.API
dotnet new classlib -n FleetManagement.Core
dotnet new classlib -n FleetManagement.Infrastructure
dotnet new xunit -n FleetManagement.Tests

# Add to solution
dotnet sln add FleetManagement.API/FleetManagement.API.csproj
dotnet sln add FleetManagement.Core/FleetManagement.Core.csproj
dotnet sln add FleetManagement.Infrastructure/FleetManagement.Infrastructure.csproj
dotnet sln add FleetManagement.Tests/FleetManagement.Tests.csproj

# Add project references
cd FleetManagement.API
dotnet add reference ../FleetManagement.Core/FleetManagement.Core.csproj
dotnet add reference ../FleetManagement.Infrastructure/FleetManagement.Infrastructure.csproj

cd ../FleetManagement.Infrastructure
dotnet add reference ../FleetManagement.Core/FleetManagement.Core.csproj

cd ../FleetManagement.Tests
dotnet add reference ../FleetManagement.API/FleetManagement.API.csproj

cd ..
```

### Install NuGet Packages

```bash
# API packages
cd FleetManagement.API
dotnet add package Microsoft.EntityFrameworkCore.SqlServer --version 8.0.0
dotnet add package Microsoft.EntityFrameworkCore.Tools --version 8.0.0
dotnet add package Swashbuckle.AspNetCore --version 6.5.0
dotnet add package Serilog.AspNetCore --version 8.0.0

# Infrastructure packages
cd ../FleetManagement.Infrastructure
dotnet add package Microsoft.EntityFrameworkCore.SqlServer --version 8.0.0
dotnet add package Microsoft.EntityFrameworkCore.Design --version 8.0.0

# Test packages
cd ../FleetManagement.Tests
dotnet add package Microsoft.EntityFrameworkCore.InMemory --version 8.0.0
dotnet add package Moq --version 4.20.0

cd ..
```

---

## Part 3: Entity Models (1 hour)

All models go in `FleetManagement.Core/Entities/`

### Create folder structure:
```bash
cd FleetManagement.Core
mkdir Entities
mkdir DTOs
mkdir Interfaces
cd ..
```

### Models are provided in separate files (see DAY2_ENTITY_MODELS.md)

---

## Part 4: Database Context (30 minutes)

File: `FleetManagement.Infrastructure/Data/FleetDbContext.cs`

See DAY2_DBCONTEXT.md for complete code.

---

## Part 5: API Controllers (2 hours)

Controllers go in `FleetManagement.API/Controllers/`

See DAY2_CONTROLLERS.md for complete code.

---

## Part 6: Configuration (30 minutes)

### Update Program.cs
See DAY2_PROGRAM_CS.md

### Update appsettings.json
See DAY2_APPSETTINGS.md

---

## Part 7: Testing (1 hour)

```bash
# Build solution
dotnet build

# Run API
cd FleetManagement.API
dotnet run

# API should start on http://localhost:5000
# Swagger UI: http://localhost:5000/swagger
```

### Test Endpoints

Open browser or use curl:

```bash
# Get fleet status
curl http://localhost:5000/api/fleet/status

# Get all buses
curl http://localhost:5000/api/fleet/buses

# Get ridership trends
curl http://localhost:5000/api/analytics/ridership/trends?startDate=2023-01-01&endDate=2023-12-31
```

---

## Part 8: Commit Your Work

```bash
git add .
git commit -m "feat: Add .NET 8 API with Entity Framework Core

- Create solution with 4 projects (API, Core, Infrastructure, Tests)
- Implement entity models for all database tables
- Configure DbContext with relationships and indexes
- Create 3 controllers (Fleet, Routes, Analytics)
- Add 15+ API endpoints with business logic
- Configure Swagger documentation
- Add logging with Serilog
- Add CORS for React frontend

Endpoints:
- GET /api/fleet/status - Fleet overview
- GET /api/fleet/buses - All buses
- POST /api/fleet/buses - Create bus
- GET /api/routes - All routes
- GET /api/analytics/ridership/trends - Ridership analysis
- GET /api/analytics/fuel/costs - Fuel cost analysis
- GET /api/analytics/dashboard/kpis - Dashboard metrics

Next: Day 3 - React frontend development"

git push origin main
```

---

## ✅ Day 2 Checklist

- [ ] SQL Server database running
- [ ] All tables created from schema
- [ ] .NET solution with 4 projects
- [ ] All NuGet packages installed
- [ ] Entity models created (7 entities)
- [ ] DbContext configured
- [ ] 3 controllers implemented
- [ ] 15+ endpoints working
- [ ] Swagger documentation accessible
- [ ] API tested and working
- [ ] Code committed to GitHub

---

## 🚨 Common Issues

### Issue: Can't connect to database
**Solution**: Check connection string in appsettings.json

### Issue: Build errors
**Solution**: 
```bash
dotnet clean
dotnet restore
dotnet build
```

### Issue: Port 5000 in use
**Solution**: Change port in launchSettings.json or:
```bash
dotnet run --urls "http://localhost:5001"
```

---

## 📚 Reference Files

All detailed code is split into separate files:
- `DAY2_ENTITY_MODELS.md` - All entity classes
- `DAY2_DBCONTEXT.md` - Database context
- `DAY2_CONTROLLERS.md` - All controllers
- `DAY2_PROGRAM_CS.md` - API configuration
- `DAY2_APPSETTINGS.md` - Configuration files

---

**Time to complete**: 6-8 hours  
**Difficulty**: Medium  
**Prerequisites**: Day 1 complete, .NET 8 SDK installed

