# Fleet Management Test Suite

## Overview
This test project follows Domain-Driven Design (DDD) testing best practices with separate test categories for different layers of the application.

## Test Structure

```
FleetManagement.Tests/
├── Unit/
│   ├── Domain/          # Domain aggregate business logic tests
│   ├── ValueObjects/    # Value object validation tests
│   └── Services/        # Domain service tests
├── Integration/
│   ├── API/            # API endpoint integration tests
│   ├── Repositories/   # Repository integration tests
│   └── Database/       # Database integration tests
└── Functional/         # End-to-end functional tests
```

## Test Categories

### Unit Tests
Fast, isolated tests that don't require external dependencies.

- **Domain Tests**: Test business logic in aggregates (Bus, Route, DailyOperation)
- **Value Object Tests**: Test value objects (BusNumber, Money, FuelEfficiency)
- **Service Tests**: Test domain services (FleetOptimizationService)

### Integration Tests
Tests that verify components work together correctly.

- **API Tests**: Test HTTP endpoints, routing, and responses
- **Repository Tests**: Test data access patterns with in-memory database
- **Database Tests**: Test Entity Framework configurations and migrations

### Functional Tests
End-to-end tests that verify complete workflows.

## Running Tests

### Run All Tests
```bash
dotnet test
```

### Run Specific Test Category
```bash
# Unit tests only
dotnet test --filter Category=Unit

# Integration tests only
dotnet test --filter Category=Integration

# Specific test class
dotnet test --filter FullyQualifiedName~BusNumberTests
```

### Run with Code Coverage
```bash
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=opencover
```

## Test Documentation

See `Integration/API/IntegrationTests_Dec31_2024.md` for detailed documentation of integration tests performed on December 31, 2024.

## Dependencies

- **xUnit**: Test framework
- **FluentAssertions**: Fluent assertion library for readable tests
- **Moq**: Mocking framework for unit tests
- **Microsoft.EntityFrameworkCore.InMemory**: In-memory database for integration tests

## Test Naming Convention

```csharp
[Fact]
public void MethodName_StateUnderTest_ExpectedBehavior()
{
    // Arrange - Set up test data
    // Act - Execute the method under test
    // Assert - Verify the results
}
```

## Example Test

```csharp
[Fact]
public void Create_WithValidBusNumber_ShouldSucceed()
{
    // Arrange
    var validNumber = "BUS-123";

    // Act
    var result = BusNumber.Create(validNumber);

    // Assert
    result.IsSuccess.Should().BeTrue();
    result.Value.Value.Should().Be("BUS-123");
}
```

## Current Test Status

**Unit Tests**: 11 tests (BusNumber value object)
**Integration Tests**: Manual testing documented (see Integration/API/)
**Coverage**: TBD

## Next Steps

1. Add unit tests for all value objects (Money, FuelEfficiency)
2. Add unit tests for domain aggregates (Bus, Route, DailyOperation)
3. Add integration tests for repositories
4. Add integration tests for API controllers
5. Add functional tests for complete workflows
6. Set up continuous integration with automated test runs

## Contributing

When adding new tests:
1. Follow the AAA (Arrange-Act-Assert) pattern
2. Use descriptive test names
3. Keep tests independent and isolated
4. Use FluentAssertions for readable assertions
5. Add tests to appropriate category folder
