using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Http;
using Microsoft.Extensions.Logging;
using FleetManagement.Core.Common;
using FleetManagement.Core.Services.AI;

namespace FleetManagement.Infrastructure.Services;

/// <summary>
/// MiniMax2 AI Service implementation for fleet analysis
/// Provides AI-powered insights using MiniMax's advanced language model
/// </summary>
public class MiniMaxAIService : IAIAnalysisService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<MiniMaxAIService> _logger;
    private readonly string _apiKey;
    private const string MiniMaxApiUrl = "https://api.minimaxi.chat/v1/text/chatcompletion_v2";

    public MiniMaxAIService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<MiniMaxAIService> logger)
    {
        _httpClient = httpClientFactory.CreateClient("MiniMax");
        _logger = logger;
        _apiKey = configuration["MiniMax:ApiKey"]
            ?? throw new InvalidOperationException("MiniMax API key not configured");
    }

    public async Task<Result<DailyAIAnalysis>> AnalyzeDailyOperationsAsync(DailyOperationsData data)
    {
        try
        {
            var prompt = $@"You are an AI fleet management analyst. Analyze the following daily operations data and provide comprehensive insights:

**Date**: {data.AnalysisDate:yyyy-MM-dd}
**Operations**: {data.TotalOperations} trips
**Passengers**: {data.TotalPassengers:N0}
**Revenue**: ${data.TotalRevenue:N2}
**Fuel Cost**: ${data.TotalFuelCost:N2}
**Fuel Efficiency**: {data.AverageFuelEfficiency:F2} MPG
**Delayed Operations**: {data.DelayedOperations} ({(data.TotalOperations > 0 ? (decimal)data.DelayedOperations / data.TotalOperations * 100 : 0):F1}%)
**Buses in Maintenance**: {data.BusesInMaintenance}

Please analyze this data and provide:
1. Overall status (Excellent/Good/Needs Attention/Critical)
2. Performance score (0-100)
3. Key findings (concise summary)
4. 3-5 positive aspects
5. 3-5 concerning aspects
6. Immediate actions (today/tomorrow)
7. Short-term actions (next week)
8. AI insight (your expert analysis)

Respond in JSON format matching this structure:
{{
  ""overallStatus"": ""Good"",
  ""performanceScore"": 85,
  ""keyFindings"": ""Fleet performing well with strong revenue but fuel efficiency needs attention"",
  ""positiveAspects"": [""High passenger count"", ""Revenue up 12%""],
  ""concerningAspects"": [""Fuel efficiency below target""],
  ""immediateActions"": [
    {{""action"": ""Check bus BUS-001 fuel consumption"", ""reason"": ""20% below average"", ""priority"": ""High"", ""estimatedImpact"": 500}}
  ],
  ""shortTermActions"": [
    {{""action"": ""Schedule driver training"", ""reason"": ""Improve efficiency"", ""priority"": ""Medium"", ""estimatedImpact"": 2000}}
  ],
  ""aiInsight"": ""Your detailed expert analysis here""
}}";

            var response = await CallMiniMaxAPIAsync(prompt);

            if (!response.IsSuccess)
                return Result.Failure<DailyAIAnalysis>(response.Error);

            var analysis = JsonSerializer.Deserialize<DailyAIAnalysis>(response.Value,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (analysis == null)
                return Result.Failure<DailyAIAnalysis>("Failed to parse AI response");

            analysis = analysis with { AnalysisDate = data.AnalysisDate };

            _logger.LogInformation("AI analysis completed for {Date}. Status: {Status}, Score: {Score}",
                data.AnalysisDate, analysis.OverallStatus, analysis.PerformanceScore);

            return Result.Success(analysis);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error analyzing daily operations with AI");
            return Result.Failure<DailyAIAnalysis>($"AI analysis failed: {ex.Message}");
        }
    }

    public async Task<Result<BusinessGoalPrediction>> PredictGoalAchievementAsync(BusinessGoalData goalData)
    {
        try
        {
            var historicalTrend = goalData.HistoricalValues.Count > 1
                ? string.Join(", ", goalData.HistoricalValues.TakeLast(10).Select(v => $"${v:N0}"))
                : "No historical data";

            var prompt = $@"You are a business analyst AI. Predict if this business goal will be achieved:

**Goal**: {goalData.GoalName}
**Target Value**: ${goalData.TargetValue:N2}
**Target Date**: {goalData.TargetDate:yyyy-MM-dd}
**Current Value**: ${goalData.CurrentValue:N2}
**Historical Values (last 10 periods)**: {historicalTrend}
**Days Remaining**: {(goalData.TargetDate - DateTime.UtcNow).Days}

Analyze the trend and provide:
1. Projected value at target date
2. Probability of success (0-100%)
3. Prediction confidence (High/Medium/Low)
4. Risk factors that could prevent achievement
5. Success factors supporting achievement
6. Specific recommendation
7. Estimated achievement date

Respond in JSON format:
{{
  ""goalName"": ""{goalData.GoalName}"",
  ""targetValue"": {goalData.TargetValue},
  ""currentValue"": {goalData.CurrentValue},
  ""projectedValue"": 150000,
  ""probabilityOfSuccess"": 75,
  ""predictionConfidence"": ""High"",
  ""riskFactors"": [""Seasonal downturn in Q1"", ""Fuel price volatility""],
  ""successFactors"": [""Strong growth trend"", ""New routes added""],
  ""recommendation"": ""On track to achieve goal. Focus on maintaining current efficiency."",
  ""projectedAchievementDate"": ""{goalData.TargetDate:yyyy-MM-dd}""
}}";

            var response = await CallMiniMaxAPIAsync(prompt);

            if (!response.IsSuccess)
                return Result.Failure<BusinessGoalPrediction>(response.Error);

            var prediction = JsonSerializer.Deserialize<BusinessGoalPrediction>(response.Value,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (prediction == null)
                return Result.Failure<BusinessGoalPrediction>("Failed to parse AI response");

            _logger.LogInformation("Goal prediction completed for {Goal}. Probability: {Probability}%",
                goalData.GoalName, prediction.ProbabilityOfSuccess);

            return Result.Success(prediction);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error predicting goal achievement");
            return Result.Failure<BusinessGoalPrediction>($"Goal prediction failed: {ex.Message}");
        }
    }

    public async Task<Result<AIRecommendations>> GetImprovementRecommendationsAsync(FleetPerformanceData performanceData)
    {
        try
        {
            var prompt = $@"You are a fleet optimization expert AI. Provide actionable recommendations based on this performance data:

**Fleet Size**: {performanceData.TotalBuses} buses ({performanceData.ActiveBuses} active)
**Average Fuel Efficiency**: {performanceData.AverageFuelEfficiency:F2} MPG
**On-Time Performance**: {performanceData.OnTimePercentage:F1}%
**Maintenance Cost/Bus**: ${performanceData.MaintenanceCostPerBus:N2}

Analyze and provide:
1. High priority recommendations (urgent, high impact)
2. Medium priority recommendations (important, moderate impact)
3. Low priority recommendations (nice to have)

For each recommendation include:
- Title
- Description
- Category (Fuel/Maintenance/Routes/Drivers)
- Estimated annual savings
- Implementation difficulty (Easy/Medium/Hard)
- Estimated days to implement
- Implementation steps

Also provide:
- Total potential savings
- Overall strategy

Respond in JSON format with arrays of recommendations categorized by priority.";

            var response = await CallMiniMaxAPIAsync(prompt);

            if (!response.IsSuccess)
                return Result.Failure<AIRecommendations>(response.Error);

            var recommendations = JsonSerializer.Deserialize<AIRecommendations>(response.Value,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (recommendations == null)
                return Result.Failure<AIRecommendations>("Failed to parse AI response");

            _logger.LogInformation("AI recommendations generated. Potential savings: ${Savings:N2}",
                recommendations.TotalPotentialSavings);

            return Result.Success(recommendations);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting AI recommendations");
            return Result.Failure<AIRecommendations>($"Recommendations failed: {ex.Message}");
        }
    }

    public async Task<Result<EfficiencyAnalysis>> AnalyzeFleetEfficiencyAsync(FleetEfficiencyData efficiencyData)
    {
        try
        {
            var prompt = $@"Analyze fleet efficiency and identify optimization opportunities:

**Metrics**:
- Fuel Cost per Mile: ${efficiencyData.FuelCostPerMile:F2}
- Cost per Passenger: ${efficiencyData.CostPerPassenger:F2}
- Revenue per Mile: ${efficiencyData.RevenuePerMile:F2}
- Capacity Utilization: {efficiencyData.CapacityUtilization:F1}%

**Route Count**: {efficiencyData.RouteEfficiencies.Count}

Provide:
1. Overall efficiency score (0-100)
2. Critical/High/Medium/Low severity issues
3. Optimization opportunities
4. Benchmark comparison (vs industry standards)
5. Total potential cost savings

Respond in JSON format.";

            var response = await CallMiniMaxAPIAsync(prompt);

            if (!response.IsSuccess)
                return Result.Failure<EfficiencyAnalysis>(response.Error);

            var analysis = JsonSerializer.Deserialize<EfficiencyAnalysis>(response.Value,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (analysis == null)
                return Result.Failure<EfficiencyAnalysis>("Failed to parse AI response");

            return Result.Success(analysis);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error analyzing fleet efficiency");
            return Result.Failure<EfficiencyAnalysis>($"Efficiency analysis failed: {ex.Message}");
        }
    }

    public async Task<Result<ExecutiveSummary>> GenerateExecutiveSummaryAsync(ComprehensiveFleetData fleetData)
    {
        try
        {
            var prompt = $@"Generate an executive summary for fleet management:

**Operations**:
- Date: {fleetData.Operations.AnalysisDate:yyyy-MM-dd}
- Operations: {fleetData.Operations.TotalOperations}
- Passengers: {fleetData.Operations.TotalPassengers:N0}
- Revenue: ${fleetData.Operations.TotalRevenue:N2}

**Performance**:
- Active Buses: {fleetData.Performance.ActiveBuses}/{fleetData.Performance.TotalBuses}
- Fuel Efficiency: {fleetData.Performance.AverageFuelEfficiency:F2} MPG
- On-Time: {fleetData.Performance.OnTimePercentage:F1}%

**Efficiency**:
- Cost/Passenger: ${fleetData.Efficiency.CostPerPassenger:F2}
- Capacity Utilization: {fleetData.Efficiency.CapacityUtilization:F1}%

Provide executive-level summary with:
1. Executive overview (2-3 sentences for C-level)
2. Key metrics with status (Good/Warning/Critical)
3. Top 3 achievements
4. Top 3 concerns
5. Strategic recommendations
6. Financial summary with projections

Respond in JSON format suitable for executive dashboard.";

            var response = await CallMiniMaxAPIAsync(prompt);

            if (!response.IsSuccess)
                return Result.Failure<ExecutiveSummary>(response.Error);

            var summary = JsonSerializer.Deserialize<ExecutiveSummary>(response.Value,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (summary == null)
                return Result.Failure<ExecutiveSummary>("Failed to parse AI response");

            summary = summary with { ReportDate = DateTime.UtcNow };

            return Result.Success(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating executive summary");
            return Result.Failure<ExecutiveSummary>($"Executive summary failed: {ex.Message}");
        }
    }

    private async Task<Result<string>> CallMiniMaxAPIAsync(string prompt)
    {
        try
        {
            var request = new
            {
                model = "abab6.5s-chat",
                messages = new[]
                {
                    new { role = "system", content = "You are an expert fleet management AI analyst. Always respond with valid JSON." },
                    new { role = "user", content = prompt }
                },
                temperature = 0.7,
                max_tokens = 2000
            };

            var httpRequest = new HttpRequestMessage(HttpMethod.Post, MiniMaxApiUrl)
            {
                Content = new StringContent(
                    JsonSerializer.Serialize(request),
                    Encoding.UTF8,
                    "application/json")
            };

            httpRequest.Headers.Add("Authorization", $"Bearer {_apiKey}");

            var response = await _httpClient.SendAsync(httpRequest);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                _logger.LogError("MiniMax API error: {StatusCode} - {Error}",
                    response.StatusCode, error);
                return Result.Failure<string>($"AI API error: {response.StatusCode}");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var apiResponse = JsonSerializer.Deserialize<MiniMaxResponse>(responseContent);

            if (apiResponse?.Choices == null || apiResponse.Choices.Length == 0)
                return Result.Failure<string>("Empty response from AI");

            var content = apiResponse.Choices[0].Message.Content;

            // Extract JSON from markdown code blocks if present
            if (content.Contains("```json"))
            {
                var start = content.IndexOf("```json") + 7;
                var end = content.LastIndexOf("```");
                content = content.Substring(start, end - start).Trim();
            }

            return Result.Success(content);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling MiniMax API");
            return Result.Failure<string>($"API call failed: {ex.Message}");
        }
    }

    private class MiniMaxResponse
    {
        public Choice[]? Choices { get; set; }
    }

    private class Choice
    {
        public Message Message { get; set; } = new();
    }

    private class Message
    {
        public string Content { get; set; } = string.Empty;
    }
}
