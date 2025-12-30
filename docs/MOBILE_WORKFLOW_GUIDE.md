# Mobile Workflow Guide - iPad/Web Development

## 🌍 Working from Valencia, Spain

**Device**: iPad with Continue (web-based)  
**Status**: Day 1 Complete, Ready for Day 2  
**Last Commit**: Phase 1 - Data Foundation & Business Analysis

---

## 📱 iPad Development Setup

### Option 1: GitHub Codespaces (Recommended)
```
1. Go to: https://github.com/bluehawana/FleetManagement-DotNet-React-SQLServer
2. Click "Code" → "Codespaces" → "Create codespace on main"
3. Full VS Code in browser with all tools pre-installed
4. Terminal access for all commands
```

### Option 2: Continue.dev Web
```
1. Go to: https://continue.dev
2. Connect to your GitHub repo
3. AI-assisted coding from browser
```

### Option 3: GitHub.dev (Quick Edits)
```
1. Go to your repo
2. Press "." (period key)
3. VS Code editor in browser (no terminal)
4. Good for documentation and quick edits
```

---

## 🚀 Day 2 Plan - Backend Development

### Morning Session (3-4 hours)

#### 1. Database Setup (1 hour)
**Using Azure SQL Database** (iPad-friendly, no local install):

```bash
# Option A: Azure SQL Database (Recommended for iPad)
# 1. Go to: https://portal.azure.com
# 2. Create SQL Database (Free tier available)
# 3. Use Azure Data Studio web or Query Editor in portal
# 4. Copy/paste 04_create_database.sql
# 5. Import CSV files using Azure portal

# Option B: Docker (if using Codespaces)
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong@Passw0rd" \
   -p 1433:1433 --name sqlserver \
   -d mcr.microsoft.com/mssql/server:2022-latest
```

**Files to use**:
- `database/scripts/04_create_database.sql` (run this first)
- `database/data/cleaned/*.csv` (import these)

#### 2. .NET 8 API Project Setup (2-3 hours)

```bash
# Navigate to backend folder
cd backend

# Create solution and projects
dotnet new sln -n FleetManagement

# Create API project
dotnet new webapi -n FleetManagement.API
dotnet sln add FleetManagement.API/FleetManagement.API.csproj

# Create Core project (domain models)
dotnet new classlib -n FleetManagement.Core
dotnet sln add FleetManagement.Core/FleetManagement.Core.csproj

# Create Infrastructure project (database)
dotnet new classlib -n FleetManagement.Infrastructure
dotnet sln add FleetManagement.Infrastructure/FleetManagement.Infrastructure.csproj

# Create Tests project
dotnet new xunit -n FleetManagement.Tests
dotnet sln add FleetManagement.Tests/FleetManagement.Tests.csproj

# Add project references
cd FleetManagement.API
dotnet add reference ../FleetManagement.Core/FleetManagement.Core.csproj
dotnet add reference ../FleetManagement.Infrastructure/FleetManagement.Infrastructure.csproj

cd ../FleetManagement.Infrastructure
dotnet add reference ../FleetManagement.Core/FleetManagement.Core.csproj

cd ../FleetManagement.Tests
dotnet add reference ../FleetManagement.API/FleetManagement.API.csproj
dotnet add reference ../FleetManagement.Core/FleetManagement.Core.csproj

# Add NuGet packages
cd ../FleetManagement.API
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools
dotnet add package Swashbuckle.AspNetCore
dotnet add package Serilog.AspNetCore
dotnet add package AutoMapper.Extensions.Microsoft.DependencyInjection

cd ../FleetManagement.Infrastructure
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Design

cd ../..
```

### Afternoon Session (3-4 hours)

#### 3. Create Entity Models (1 hour)

**File**: `backend/FleetManagement.Core/Entities/Bus.cs`
```csharp
namespace FleetManagement.Core.Entities;

public class Bus
{
    public int BusId { get; set; }
    public string BusNumber { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Capacity { get; set; }
    public decimal FuelTankCapacity { get; set; }
    public string Status { get; set; } = "Active"; // Active, Maintenance, Retired
    public DateTime PurchaseDate { get; set; }
    public decimal PurchasePrice { get; set; }
    public int CurrentMileage { get; set; }
    public DateTime LastMaintenanceDate { get; set; }
    public DateTime NextMaintenanceDate { get; set; }
    
    // Navigation properties
    public ICollection<DailyOperation> DailyOperations { get; set; } = new List<DailyOperation>();
    public ICollection<MaintenanceRecord> MaintenanceRecords { get; set; } = new List<MaintenanceRecord>();
    public ICollection<FuelPurchase> FuelPurchases { get; set; } = new List<FuelPurchase>();
}
```

**File**: `backend/FleetManagement.Core/Entities/Route.cs`
```csharp
namespace FleetManagement.Core.Entities;

public class Route
{
    public int RouteId { get; set; }
    public string RouteNumber { get; set; } = string.Empty;
    public string RouteName { get; set; } = string.Empty;
    public decimal Distance { get; set; }
    public int EstimatedDuration { get; set; } // minutes
    public int NumberOfStops { get; set; }
    public string StartLocation { get; set; } = string.Empty;
    public string EndLocation { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public ICollection<DailyOperation> DailyOperations { get; set; } = new List<DailyOperation>();
}
```

**File**: `backend/FleetManagement.Core/Entities/DailyOperation.cs`
```csharp
namespace FleetManagement.Core.Entities;

public class DailyOperation
{
    public int OperationId { get; set; }
    public int BusId { get; set; }
    public int RouteId { get; set; }
    public DateTime OperationDate { get; set; }
    public TimeSpan DepartureTime { get; set; }
    public TimeSpan ArrivalTime { get; set; }
    public int PassengerCount { get; set; }
    public decimal FuelConsumed { get; set; }
    public decimal DistanceTraveled { get; set; }
    public int DelayMinutes { get; set; }
    public string DriverName { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public string? Notes { get; set; }
    
    // Navigation properties
    public Bus Bus { get; set; } = null!;
    public Route Route { get; set; } = null!;
}
```

#### 4. Create DbContext (30 minutes)

**File**: `backend/FleetManagement.Infrastructure/Data/FleetDbContext.cs`
```csharp
using Microsoft.EntityFrameworkCore;
using FleetManagement.Core.Entities;

namespace FleetManagement.Infrastructure.Data;

public class FleetDbContext : DbContext
{
    public FleetDbContext(DbContextOptions<FleetDbContext> options) : base(options)
    {
    }

    public DbSet<Bus> Buses { get; set; }
    public DbSet<Route> Routes { get; set; }
    public DbSet<DailyOperation> DailyOperations { get; set; }
    public DbSet<MaintenanceRecord> MaintenanceRecords { get; set; }
    public DbSet<FuelPurchase> FuelPurchases { get; set; }
    public DbSet<Alert> Alerts { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure relationships
        modelBuilder.Entity<DailyOperation>()
            .HasOne(d => d.Bus)
            .WithMany(b => b.DailyOperations)
            .HasForeignKey(d => d.BusId);

        modelBuilder.Entity<DailyOperation>()
            .HasOne(d => d.Route)
            .WithMany(r => r.DailyOperations)
            .HasForeignKey(d => d.RouteId);

        // Configure decimal precision
        modelBuilder.Entity<Bus>()
            .Property(b => b.FuelTankCapacity)
            .HasPrecision(10, 2);

        modelBuilder.Entity<DailyOperation>()
            .Property(d => d.FuelConsumed)
            .HasPrecision(10, 2);

        // Add indexes for performance
        modelBuilder.Entity<DailyOperation>()
            .HasIndex(d => d.OperationDate);

        modelBuilder.Entity<Bus>()
            .HasIndex(b => b.BusNumber)
            .IsUnique();
    }
}
```

#### 5. Create API Controllers (1-2 hours)

**File**: `backend/FleetManagement.API/Controllers/FleetController.cs`
```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FleetManagement.Infrastructure.Data;

namespace FleetManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FleetController : ControllerBase
{
    private readonly FleetDbContext _context;
    private readonly ILogger<FleetController> _logger;

    public FleetController(FleetDbContext context, ILogger<FleetController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/fleet/status
    [HttpGet("status")]
    public async Task<IActionResult> GetFleetStatus()
    {
        var status = await _context.Buses
            .GroupBy(b => b.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        return Ok(status);
    }

    // GET: api/fleet/buses
    [HttpGet("buses")]
    public async Task<IActionResult> GetAllBuses()
    {
        var buses = await _context.Buses
            .OrderBy(b => b.BusNumber)
            .ToListAsync();

        return Ok(buses);
    }

    // GET: api/fleet/buses/{id}
    [HttpGet("buses/{id}")]
    public async Task<IActionResult> GetBus(int id)
    {
        var bus = await _context.Buses
            .Include(b => b.DailyOperations)
            .Include(b => b.MaintenanceRecords)
            .FirstOrDefaultAsync(b => b.BusId == id);

        if (bus == null)
            return NotFound();

        return Ok(bus);
    }

    // POST: api/fleet/buses
    [HttpPost("buses")]
    public async Task<IActionResult> CreateBus([FromBody] Bus bus)
    {
        _context.Buses.Add(bus);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBus), new { id = bus.BusId }, bus);
    }

    // PUT: api/fleet/buses/{id}
    [HttpPut("buses/{id}")]
    public async Task<IActionResult> UpdateBus(int id, [FromBody] Bus bus)
    {
        if (id != bus.BusId)
            return BadRequest();

        _context.Entry(bus).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/fleet/buses/{id}
    [HttpDelete("buses/{id}")]
    public async Task<IActionResult> DeleteBus(int id)
    {
        var bus = await _context.Buses.FindAsync(id);
        if (bus == null)
            return NotFound();

        bus.Status = "Retired";
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
```

#### 6. Configure API (30 minutes)

**File**: `backend/FleetManagement.API/Program.cs`
```csharp
using Microsoft.EntityFrameworkCore;
using FleetManagement.Infrastructure.Data;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Add Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/fleet-api-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add DbContext
builder.Services.AddDbContext<FleetDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add CORS for React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy
            .WithOrigins("http://localhost:5173", "http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseAuthorization();
app.MapControllers();

app.Run();
```

**File**: `backend/FleetManagement.API/appsettings.json`
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=FleetManagementDB;User Id=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=True"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

---

## 📝 Quick Commands Reference

### Git Commands (iPad-friendly)
```bash
# Check status
git status

# Add all changes
git add .

# Commit with message
git commit -m "feat: Add .NET API with Entity Framework"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main

# Create new branch
git checkout -b feature/api-development
```

### .NET Commands
```bash
# Build solution
dotnet build

# Run API
cd backend/FleetManagement.API
dotnet run

# Run tests
dotnet test

# Add migration
dotnet ef migrations add InitialCreate --project FleetManagement.Infrastructure --startup-project FleetManagement.API

# Update database
dotnet ef database update --project FleetManagement.Infrastructure --startup-project FleetManagement.API

# Check installed packages
dotnet list package
```

### Docker Commands (if using Codespaces)
```bash
# Start SQL Server
docker start sqlserver

# Stop SQL Server
docker stop sqlserver

# View logs
docker logs sqlserver

# Connect to SQL Server
docker exec -it sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrong@Passw0rd'
```

---

## 🎯 Day 2 Success Criteria

By end of Day 2, you should have:

- [ ] SQL Server database created and running
- [ ] All 7 tables created from schema
- [ ] CSV data imported successfully
- [ ] .NET 8 solution with 4 projects
- [ ] Entity Framework models for all entities
- [ ] DbContext configured
- [ ] At least 3 API controllers (Fleet, Routes, Analytics)
- [ ] 10+ API endpoints working
- [ ] Swagger documentation accessible
- [ ] All code committed to GitHub

---

## 📱 iPad-Specific Tips

### 1. Use Split Screen
- Left: GitHub Codespaces (coding)
- Right: Documentation or browser (testing API)

### 2. Keyboard Shortcuts
- `Cmd + P`: Quick file open
- `Cmd + Shift + P`: Command palette
- `Cmd + B`: Toggle sidebar
- `Ctrl + ` `: Toggle terminal

### 3. Testing API from iPad
- Use Swagger UI: `http://localhost:5000/swagger`
- Or use browser console:
```javascript
fetch('http://localhost:5000/api/fleet/status')
  .then(r => r.json())
  .then(console.log)
```

### 4. Save Battery
- Close unused tabs
- Use dark theme
- Disable auto-save (save manually)

---

## 🌐 Useful Links (Bookmark These)

### Your Project
- **GitHub Repo**: https://github.com/bluehawana/FleetManagement-DotNet-React-SQLServer
- **GitHub Codespaces**: https://github.com/codespaces

### Documentation
- **.NET Docs**: https://learn.microsoft.com/en-us/dotnet/
- **EF Core**: https://learn.microsoft.com/en-us/ef/core/
- **ASP.NET Core**: https://learn.microsoft.com/en-us/aspnet/core/

### Tools
- **Azure Portal**: https://portal.azure.com
- **Continue.dev**: https://continue.dev
- **GitHub.dev**: Press `.` in your repo

---

## 🚨 Troubleshooting

### Can't connect to SQL Server
```bash
# Check if container is running
docker ps

# Restart container
docker restart sqlserver

# Check connection string in appsettings.json
```

### Build errors
```bash
# Clean and rebuild
dotnet clean
dotnet build

# Restore packages
dotnet restore
```

### Port already in use
```bash
# Change port in launchSettings.json
# Or kill process using port
lsof -ti:5000 | xargs kill -9
```

---

## 📅 Day 3 Preview

### Morning: React Frontend
- Create Vite + React + TypeScript project
- Install Ant Design, Recharts
- Build dashboard layout
- Create API service layer

### Afternoon: Dashboard Components
- Ridership trends chart
- Fuel cost analysis
- Fleet status cards
- Connect to API

---

## ✈️ Travel Checklist

Before leaving for Valencia:

- [x] Day 1 committed and pushed
- [ ] iPad charged
- [ ] Bookmark this guide
- [ ] Test GitHub Codespaces access
- [ ] Save Azure credentials (if using)
- [ ] Download offline docs (optional)

---

## 🎉 You're All Set!

Everything you need is in this guide. Work at your own pace, and remember:

- **Focus on progress, not perfection**
- **Commit frequently** (every 30-60 minutes)
- **Test as you build**
- **Take breaks** (Pomodoro: 25 min work, 5 min break)

Enjoy Valencia! 🇪🇸

---

**Last Updated**: December 30, 2024  
**Next Session**: Day 2 - Backend Development  
**Location**: Valencia, Spain 🌴

