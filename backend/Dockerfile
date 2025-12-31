# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY FleetManagement.sln ./
COPY FleetManagement.API/FleetManagement.API.csproj FleetManagement.API/
COPY FleetManagement.Core/FleetManagement.Core.csproj FleetManagement.Core/
COPY FleetManagement.Infrastructure/FleetManagement.Infrastructure.csproj FleetManagement.Infrastructure/
COPY FleetManagement.Tests/FleetManagement.Tests.csproj FleetManagement.Tests/

# Restore dependencies
RUN dotnet restore

# Copy everything else
COPY . .

# Build and publish
WORKDIR /src/FleetManagement.API
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Copy published app
COPY --from=build /app/publish .

# Expose port
EXPOSE 5000

# Set environment variables
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

# Run the application
ENTRYPOINT ["dotnet", "FleetManagement.API.dll"]
