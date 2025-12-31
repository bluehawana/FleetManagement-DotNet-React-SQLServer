using Microsoft.AspNetCore.Mvc;
using FleetManagement.Core.Interfaces;
using FleetManagement.Core.Aggregates.BusAggregate;
using FleetManagement.Core.ValueObjects;
using FleetManagement.API.DTOs;

namespace FleetManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BusController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<BusController> _logger;

    public BusController(IUnitOfWork unitOfWork, ILogger<BusController> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    /// <summary>
    /// Get all buses
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<BusDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var buses = await _unitOfWork.Buses.GetAllAsync();
        var dtos = buses.Select(MapToDto);
        return Ok(dtos);
    }

    /// <summary>
    /// Get bus by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(BusDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var bus = await _unitOfWork.Buses.GetByIdAsync(id);
        if (bus == null)
            return NotFound($"Bus with ID {id} not found");

        return Ok(MapToDto(bus));
    }

    /// <summary>
    /// Get buses by status
    /// </summary>
    [HttpGet("status/{status}")]
    [ProducesResponseType(typeof(IEnumerable<BusDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByStatus(string status)
    {
        if (!Enum.TryParse<BusStatus>(status, true, out var busStatus))
            return BadRequest($"Invalid status: {status}");

        var buses = await _unitOfWork.Buses.GetByStatusAsync(busStatus);
        var dtos = buses.Select(MapToDto);
        return Ok(dtos);
    }

    /// <summary>
    /// Get buses requiring maintenance
    /// </summary>
    [HttpGet("maintenance/required")]
    [ProducesResponseType(typeof(IEnumerable<BusDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRequiringMaintenance()
    {
        var buses = await _unitOfWork.Buses.GetBusesRequiringMaintenanceAsync();
        var dtos = buses.Select(MapToDto);
        return Ok(dtos);
    }

    /// <summary>
    /// Create a new bus
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(BusDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateBusRequest request)
    {
        // Create value objects
        var busNumberResult = BusNumber.Create(request.BusNumber);
        if (busNumberResult.IsFailure)
            return BadRequest(busNumberResult.Error);

        var priceResult = Money.Create(request.PurchasePrice, request.Currency);
        if (priceResult.IsFailure)
            return BadRequest(priceResult.Error);

        // Create bus aggregate
        var busResult = Bus.Create(
            busNumberResult.Value,
            request.Model,
            request.Year,
            request.Capacity,
            request.FuelTankCapacity,
            request.PurchaseDate,
            priceResult.Value);

        if (busResult.IsFailure)
            return BadRequest(busResult.Error);

        var bus = busResult.Value;

        // Save to database
        await _unitOfWork.Buses.AddAsync(bus);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Created new bus: {BusNumber}", request.BusNumber);

        return CreatedAtAction(nameof(GetById), new { id = bus.BusId }, MapToDto(bus));
    }

    /// <summary>
    /// Update bus mileage
    /// </summary>
    [HttpPut("{id}/mileage")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateMileage(int id, [FromBody] UpdateMileageRequest request)
    {
        var bus = await _unitOfWork.Buses.GetByIdAsync(id);
        if (bus == null)
            return NotFound($"Bus with ID {id} not found");

        var result = bus.UpdateMileage(request.NewMileage);
        if (result.IsFailure)
            return BadRequest(result.Error);

        await _unitOfWork.Buses.UpdateAsync(bus);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Updated mileage for bus {BusId} to {Mileage}", id, request.NewMileage);

        return NoContent();
    }

    /// <summary>
    /// Schedule maintenance for a bus
    /// </summary>
    [HttpPost("{id}/maintenance/schedule")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ScheduleMaintenance(int id, [FromBody] ScheduleMaintenanceRequest request)
    {
        var bus = await _unitOfWork.Buses.GetByIdAsync(id);
        if (bus == null)
            return NotFound($"Bus with ID {id} not found");

        var result = bus.ScheduleMaintenance(
            request.MaintenanceDate,
            request.MaintenanceType,
            request.Description);

        if (result.IsFailure)
            return BadRequest(result.Error);

        await _unitOfWork.Buses.UpdateAsync(bus);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Scheduled maintenance for bus {BusId} on {Date}", id, request.MaintenanceDate);

        return NoContent();
    }

    /// <summary>
    /// Complete maintenance for a bus
    /// </summary>
    [HttpPost("{id}/maintenance/complete")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CompleteMaintenance(int id, [FromBody] CompleteMaintenanceRequest request)
    {
        var bus = await _unitOfWork.Buses.GetByIdAsync(id);
        if (bus == null)
            return NotFound($"Bus with ID {id} not found");

        var result = bus.CompleteMaintenance(
            request.Cost,
            request.PerformedBy,
            request.PartsReplaced,
            request.DowntimeHours);

        if (result.IsFailure)
            return BadRequest(result.Error);

        await _unitOfWork.Buses.UpdateAsync(bus);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Completed maintenance for bus {BusId}", id);

        return NoContent();
    }

    /// <summary>
    /// Retire a bus
    /// </summary>
    [HttpPost("{id}/retire")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Retire(int id, [FromBody] string reason)
    {
        var bus = await _unitOfWork.Buses.GetByIdAsync(id);
        if (bus == null)
            return NotFound($"Bus with ID {id} not found");

        var result = bus.Retire(reason);
        if (result.IsFailure)
            return BadRequest(result.Error);

        await _unitOfWork.Buses.UpdateAsync(bus);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Retired bus {BusId}: {Reason}", id, reason);

        return NoContent();
    }

    /// <summary>
    /// Get fleet statistics
    /// </summary>
    [HttpGet("statistics")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStatistics()
    {
        var activeCount = await _unitOfWork.Buses.CountByStatusAsync(BusStatus.Active);
        var maintenanceCount = await _unitOfWork.Buses.CountByStatusAsync(BusStatus.Maintenance);
        var retiredCount = await _unitOfWork.Buses.CountByStatusAsync(BusStatus.Retired);
        var requiresMaintenance = (await _unitOfWork.Buses.GetBusesRequiringMaintenanceAsync()).Count();

        var stats = new
        {
            TotalBuses = activeCount + maintenanceCount + retiredCount,
            ActiveBuses = activeCount,
            InMaintenance = maintenanceCount,
            Retired = retiredCount,
            RequiresMaintenance = requiresMaintenance
        };

        return Ok(stats);
    }

    private static BusDto MapToDto(Bus bus)
    {
        return new BusDto(
            bus.BusId,
            bus.BusNumber.Value,
            bus.Model,
            bus.Year,
            bus.Capacity,
            bus.FuelTankCapacity,
            bus.Status.ToString(),
            bus.PurchaseDate,
            bus.PurchasePrice.Amount,
            bus.PurchasePrice.Currency,
            bus.CurrentMileage,
            bus.LastMaintenanceDate,
            bus.NextMaintenanceDate,
            bus.DaysUntilMaintenance(),
            bus.RequiresMaintenance()
        );
    }
}
