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

// Add DbContext - Use In-Memory for testing
builder.Services.AddDbContext<FleetDbContext>(options =>
{
    // Use In-Memory database for testing (no SQL Server needed)
    options.UseInMemoryDatabase("FleetManagementDB");

    // Uncomment below to use SQL Server instead:
    // options.UseSqlServer(
    //     builder.Configuration.GetConnectionString("DefaultConnection"),
    //     b => b.MigrationsAssembly("FleetManagement.Infrastructure"));
});

// Add Unit of Work
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy
            .WithOrigins("http://localhost:5173", "http://localhost:3000", "http://localhost:5174")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

var app = builder.Build();

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

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseAuthorization();
app.MapControllers();

// Log startup
Log.Information("Fleet Management API starting up...");

app.Run();
