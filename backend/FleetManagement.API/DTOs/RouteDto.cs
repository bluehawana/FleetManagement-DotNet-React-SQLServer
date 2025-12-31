namespace FleetManagement.API.DTOs;

public record RouteDto(
    int RouteId,
    string RouteNumber,
    string RouteName,
    decimal Distance,
    int EstimatedDuration,
    int NumberOfStops,
    string StartLocation,
    string EndLocation,
    bool IsActive,
    decimal EstimatedFuelCost,
    string FuelCostCurrency,
    decimal AverageDistancePerStop
);

public record CreateRouteRequest(
    string RouteNumber,
    string RouteName,
    decimal Distance,
    int EstimatedDuration,
    int NumberOfStops,
    string StartLocation,
    string EndLocation,
    decimal EstimatedFuelCost,
    string Currency = "USD"
);

public record UpdateRouteRequest(
    string RouteName,
    decimal Distance,
    int EstimatedDuration,
    int NumberOfStops,
    string StartLocation,
    string EndLocation,
    decimal EstimatedFuelCost
);
