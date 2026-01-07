using Microsoft.EntityFrameworkCore;
using FleetManagement.Infrastructure.Data;
using FleetManagement.Core.Interfaces;
using FleetManagement.Infrastructure;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/fleet-api-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() 
    { 
        Title = "Fleet Management API", 
        Version = "v1",
        Description = "Smart Public Bus Transit Management System - Domain-Driven Design Architecture"
    });
});

// Add DbContext - Use PostgreSQL for production
builder.Services.AddDbContext<FleetDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
        ?? "Host=localhost;Port=5432;Database=FleetManagement;Username=fleetuser;Password=FleetPass123!;";
    options.UseNpgsql(connectionString, b => b.MigrationsAssembly("FleetManagement.Infrastructure"));
});

// Add Unit of Work
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy
            .WithOrigins("http://localhost:5173", "http://localhost:3000", "http://localhost:3001", "http://localhost:5174")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

var app = builder.Build();

// Auto-migrate and seed database on startup
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<FleetDbContext>();
    try
    {
        Log.Information("📊 Applying database migrations...");
        await context.Database.MigrateAsync();
        Log.Information("✅ Database migrations applied successfully!");

        // Auto-seed if database is empty
        if (!await context.Buses.AnyAsync())
        {
            Log.Information("🌱 Seeding database with mock data...");
            var seeder = new MockDataSeeder(context);
            await seeder.SeedAsync();
            Log.Information("✅ Database seeded successfully!");
        }
        else
        {
            Log.Information("✅ Database already contains data, skipping seed.");
        }
    }
    catch (Exception ex)
    {
        Log.Error(ex, "❌ Error during database initialization");
    }
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Fleet Management API v1");
        c.RoutePrefix = string.Empty; // Swagger at root
    });
}

// Skip HTTPS redirect in development for Prometheus compatibility
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowReactApp");
// app.UseAuthorization(); // Commented out - not using authentication
app.MapControllers();

// Log startup
Log.Information("🚀 Fleet Management API is ready!");
Log.Information("📊 Prometheus metrics available at /metrics (Custom MetricsController)");
Log.Information("📈 Fleet KPI metrics available at /api/fleet-kpis/prometheus");

app.Run();
