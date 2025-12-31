using FleetManagement.Core.Common;

namespace FleetManagement.Core.Services.AI;

/// <summary>
/// AI-powered analysis service for fleet operations
/// Uses MiniMax2 for intelligent insights and recommendations
/// </summary>
public interface IAIAnalysisService
{
    /// <summary>
    /// Analyze daily operations and provide AI-powered insights
    /// </summary>
    Task<Result<DailyAIAnalysis>> AnalyzeDailyOperationsAsync(DailyOperationsData data);

    /// <summary>
    /// Predict if business goals will be achieved based on current trends
    /// </summary>
    Task<Result<BusinessGoalPrediction>> PredictGoalAchievementAsync(BusinessGoalData goalData);

    /// <summary>
    /// Get AI recommendations for improvement
    /// </summary>
    Task<Result<AIRecommendations>> GetImprovementRecommendationsAsync(FleetPerformanceData performanceData);

    /// <summary>
    /// Analyze fleet efficiency and identify optimization opportunities
    /// </summary>
    Task<Result<EfficiencyAnalysis>> AnalyzeFleetEfficiencyAsync(FleetEfficiencyData efficiencyData);

    /// <summary>
    /// Generate executive summary for management
    /// </summary>
    Task<Result<ExecutiveSummary>> GenerateExecutiveSummaryAsync(ComprehensiveFleetData fleetData);
}

/// <summary>
/// Daily operations data for AI analysis
/// </summary>
public record DailyOperationsData
{
    public DateTime AnalysisDate { get; init; }
    public int TotalOperations { get; init; }
    public int TotalPassengers { get; init; }
    public decimal TotalRevenue { get; init; }
    public decimal TotalFuelCost { get; init; }
    public decimal AverageFuelEfficiency { get; init; }
    public int DelayedOperations { get; init; }
    public int BusesInMaintenance { get; init; }
    public List<RoutePerformance> RoutePerformances { get; init; } = new();
}

/// <summary>
/// AI analysis result for daily operations
/// </summary>
public record DailyAIAnalysis
{
    public DateTime AnalysisDate { get; init; }
    public string OverallStatus { get; init; } = string.Empty; // "Excellent", "Good", "Needs Attention", "Critical"
    public decimal PerformanceScore { get; init; } // 0-100
    public string KeyFindings { get; init; } = string.Empty;
    public List<string> PositiveAspects { get; init; } = new();
    public List<string> ConcerningAspects { get; init; } = new();
    public List<ActionItem> ImmediateActions { get; init; } = new();
    public List<ActionItem> ShortTermActions { get; init; } = new();
    public string AIInsight { get; init; } = string.Empty;
}

/// <summary>
/// Business goal prediction
/// </summary>
public record BusinessGoalPrediction
{
    public string GoalName { get; init; } = string.Empty;
    public decimal TargetValue { get; init; }
    public decimal CurrentValue { get; init; }
    public decimal ProjectedValue { get; init; }
    public decimal ProbabilityOfSuccess { get; init; } // 0-100%
    public string PredictionConfidence { get; init; } = string.Empty; // "High", "Medium", "Low"
    public List<string> RiskFactors { get; init; } = new();
    public List<string> SuccessFactors { get; init; } = new();
    public string Recommendation { get; init; } = string.Empty;
    public DateTime ProjectedAchievementDate { get; init; }
}

/// <summary>
/// AI-powered recommendations
/// </summary>
public record AIRecommendations
{
    public List<Recommendation> HighPriority { get; init; } = new();
    public List<Recommendation> MediumPriority { get; init; } = new();
    public List<Recommendation> LowPriority { get; init; } = new();
    public decimal TotalPotentialSavings { get; init; }
    public string OverallStrategy { get; init; } = string.Empty;
}

public record Recommendation
{
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty; // "Fuel", "Maintenance", "Routes", "Drivers"
    public decimal EstimatedSavings { get; init; }
    public string ImplementationDifficulty { get; init; } = string.Empty; // "Easy", "Medium", "Hard"
    public int EstimatedDaysToImplement { get; init; }
    public List<string> Steps { get; init; } = new();
}

/// <summary>
/// Fleet efficiency analysis
/// </summary>
public record EfficiencyAnalysis
{
    public decimal OverallEfficiencyScore { get; init; } // 0-100
    public List<EfficiencyIssue> IssuesFound { get; init; } = new();
    public List<EfficiencyOpportunity> Opportunities { get; init; } = new();
    public string BenchmarkComparison { get; init; } = string.Empty;
    public decimal PotentialCostSavings { get; init; }
}

public record EfficiencyIssue
{
    public string Area { get; init; } = string.Empty;
    public string Issue { get; init; } = string.Empty;
    public string Severity { get; init; } = string.Empty; // "Critical", "High", "Medium", "Low"
    public decimal CostImpact { get; init; }
}

public record EfficiencyOpportunity
{
    public string Area { get; init; } = string.Empty;
    public string Opportunity { get; init; } = string.Empty;
    public decimal PotentialSavings { get; init; }
    public string Complexity { get; init; } = string.Empty;
}

/// <summary>
/// Executive summary for management
/// </summary>
public record ExecutiveSummary
{
    public DateTime ReportDate { get; init; }
    public string ExecutiveOverview { get; init; } = string.Empty;
    public List<KeyMetric> KeyMetrics { get; init; } = new();
    public List<string> TopAchievements { get; init; } = new();
    public List<string> TopConcerns { get; init; } = new();
    public List<StrategicRecommendation> StrategicRecommendations { get; init; } = new();
    public FinancialSummary FinancialSummary { get; init; } = new();
}

public record KeyMetric
{
    public string Name { get; init; } = string.Empty;
    public string CurrentValue { get; init; } = string.Empty;
    public string Trend { get; init; } = string.Empty; // "Up", "Down", "Stable"
    public string Status { get; init; } = string.Empty; // "Good", "Warning", "Critical"
}

public record StrategicRecommendation
{
    public string Title { get; init; } = string.Empty;
    public string Rationale { get; init; } = string.Empty;
    public string ExpectedImpact { get; init; } = string.Empty;
    public string Timeline { get; init; } = string.Empty;
}

public record FinancialSummary
{
    public decimal TotalRevenue { get; init; }
    public decimal TotalCosts { get; init; }
    public decimal NetProfit { get; init; }
    public decimal ProjectedAnnualRevenue { get; init; }
    public decimal ProjectedAnnualProfit { get; init; }
}

/// <summary>
/// Supporting data models
/// </summary>
public record ActionItem
{
    public string Action { get; init; } = string.Empty;
    public string Reason { get; init; } = string.Empty;
    public string Priority { get; init; } = string.Empty;
    public decimal EstimatedImpact { get; init; }
}

public record RoutePerformance
{
    public string RouteNumber { get; init; } = string.Empty;
    public int Passengers { get; init; }
    public decimal Revenue { get; init; }
    public decimal Efficiency { get; init; }
    public int Delays { get; init; }
}

public record BusinessGoalData
{
    public string GoalName { get; init; } = string.Empty;
    public decimal TargetValue { get; init; }
    public DateTime TargetDate { get; init; }
    public List<decimal> HistoricalValues { get; init; } = new();
    public decimal CurrentValue { get; init; }
}

public record FleetPerformanceData
{
    public int TotalBuses { get; init; }
    public int ActiveBuses { get; init; }
    public decimal AverageFuelEfficiency { get; init; }
    public decimal OnTimePercentage { get; init; }
    public decimal MaintenanceCostPerBus { get; init; }
    public List<BusPerformance> BusPerformances { get; init; } = new();
}

public record BusPerformance
{
    public string BusNumber { get; init; } = string.Empty;
    public decimal FuelEfficiency { get; init; }
    public int DelayCount { get; init; }
    public decimal MaintenanceCost { get; init; }
}

public record FleetEfficiencyData
{
    public decimal FuelCostPerMile { get; init; }
    public decimal CostPerPassenger { get; init; }
    public decimal RevenuePerMile { get; init; }
    public decimal CapacityUtilization { get; init; }
    public List<RouteEfficiency> RouteEfficiencies { get; init; } = new();
}

public record RouteEfficiency
{
    public string RouteNumber { get; init; } = string.Empty;
    public decimal Efficiency { get; init; }
    public decimal Occupancy { get; init; }
    public decimal Profitability { get; init; }
}

public record ComprehensiveFleetData
{
    public DailyOperationsData Operations { get; init; } = new();
    public FleetPerformanceData Performance { get; init; } = new();
    public FleetEfficiencyData Efficiency { get; init; } = new();
    public List<BusinessGoalData> BusinessGoals { get; init; } = new();
}
