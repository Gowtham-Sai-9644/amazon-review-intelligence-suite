from pydantic import BaseModel, Field
from typing import List, Dict, Any

# Review Analyzer request schema
class AnalyzeReviewRequest(BaseModel):
    text: str = Field(..., min_length=3, description="The customer review text to analyze")

# Sentiment schema
class SentimentResult(BaseModel):
    label: str = Field(..., description="Sentiment label (Positive, Neutral, Negative)")
    score: float = Field(..., description="Confidence score from 0.0 to 1.0")

# Word attributions
class WordWeight(BaseModel):
    word: str
    weight: float

# Explanation schema
class ExplanationResult(BaseModel):
    tabular_shap: Dict[str, float] = Field(..., description="SHAP feature attributions for tabular metrics")
    top_positive_words: List[WordWeight] = Field(..., description="Top words contributing to helpfulness")
    top_negative_words: List[WordWeight] = Field(..., description="Top words reducing helpfulness")
    readability_impact: str
    length_impact: str

class RecommendationItem(BaseModel):
    impact: str = Field(..., description="Impact rating (High, Medium, Low)")
    text: str = Field(..., description="Actionable recommendation description")

# V4 Reasoning Schema
class ReasoningResult(BaseModel):
    why_high: List[str] = Field(..., description="Factors contributing to a high score")
    why_low: List[str] = Field(..., description="Factors dragging down the score")
    supporting_evidence: List[str] = Field(..., description="Evidence supporting the score")
    missing_evidence: List[str] = Field(..., description="Evidence missing from the review")
    confidence_explanation: str = Field(..., description="Explanation of predictions confidence")
    weakness_explanation: str = Field(..., description="Explanation of review weaknesses")

# V4 Evidence Schema
class EvidenceItem(BaseModel):
    label: str = Field(..., description="Type of evidence (e.g. usage duration, pro/con, size detail)")
    present: bool = Field(..., description="Whether evidence is present")
    details: str = Field(..., description="Extracted snippet or descriptive detail")

# V4 Detailed Quality Scores
class DetailedScores(BaseModel):
    quality_score: float = Field(..., description="Overall text structure score (0-100)")
    trust_score: float = Field(..., description="Review trust score (0-100)")
    specificity_score: float = Field(..., description="Level of concrete details (0-100)")
    evidence_score: float = Field(..., description="Empirical evidence density (0-100)")
    expertise_score: float = Field(..., description="Technical detail/domain expertise (0-100)")
    authenticity_score: float = Field(..., description="Non-spam indicators (0-100)")
    helpfulness_score: float = Field(..., description="Core ML predicted score (0-100)")
    business_value_score: float = Field(..., description="Business utility metric (0-100)")
    overall_intelligence_score: float = Field(..., description="Synthesized AI score (0-100)")

# V4 Rewrite Copilot Schema
class CopilotSuggestion(BaseModel):
    text: str = Field(..., description="Generated text suggestion")
    predicted_score: float = Field(..., description="New predicted helpfulness score")
    improvement_delta: float = Field(..., description="Score difference compared to current")

class CopilotResult(BaseModel):
    version_a_trust: CopilotSuggestion = Field(..., description="Optimized for buyer trust")
    version_b_helpfulness: CopilotSuggestion = Field(..., description="Optimized for help votes")
    version_c_conversion: CopilotSuggestion = Field(..., description="Optimized for product sales conversion")

# V4 Counterfactual Schema
class CounterfactualItem(BaseModel):
    scenario: str = Field(..., description="Adjustment description (e.g. 'If word count increased by 30')")
    score_change: float = Field(..., description="Calculated change in helpfulness score")
    impact: str = Field(..., description="Direction ('Positive', 'Negative', 'Neutral')")

# V4 Business Intelligence Schema
class BusinessIntelligenceResult(BaseModel):
    buyer_trust: str = Field(..., description="Recruiter/Buyer trust bracket (High, Medium, Low)")
    conversion_impact: str = Field(..., description="Estimated sales conversion delta (e.g. '+11%')")
    visibility_prediction: str = Field(..., description="Review placement indicator ('Positive', 'Neutral', 'Negative')")
    recommendation: str = Field(..., description="PM decision ('Publish Review', 'Request Details', 'Flag for Moderation')")

# Review Analyzer response schema
class AnalyzeReviewResponse(BaseModel):
    helpfulness_score: float = Field(..., description="Predicted helpfulness percentage (0-100)")
    confidence: float = Field(..., description="Confidence score (0-100)")
    quality_rating: str = Field(..., description="Quality bucket (Low, Medium, High)")
    sentiment: SentimentResult
    explanation: ExplanationResult
    recommendations: List[RecommendationItem] = Field(default=[], description="Actionable prioritized AI recommendations")
    natural_explanation: str = Field(default="", description="A natural language summary explaining the prediction")
    inference_time_ms: float = Field(..., description="Inference execution duration")
    model_version: str = Field(..., description="Model binary release version")
    
    # V4 Fields
    reasoning: ReasoningResult
    evidence: List[EvidenceItem]
    detailed_scores: DetailedScores
    copilot: CopilotResult
    counterfactuals: List[CounterfactualItem]
    business_intelligence: BusinessIntelligenceResult

# Analytics Response Schema
class AnalyticsResponse(BaseModel):
    model_config = {'protected_namespaces': ()}
    
    total_analyzed: int
    average_helpfulness: float
    sentiment_distribution: Dict[str, int]
    quality_distribution: Dict[str, int]
    model_metrics: List[Dict[str, Any]]

# Business Insights Response Schema
class BusinessInsightsResponse(BaseModel):
    optimal_word_count_min: int
    optimal_word_count_max: int
    top_helpful_keywords: List[Dict[str, Any]]
    top_unhelpful_keywords: List[Dict[str, Any]]
    length_vs_helpfulness: List[Dict[str, Any]]

# Error Analysis Response Schema
class ConfusionMatrix(BaseModel):
    true_positive: int
    false_positive: int
    true_negative: int
    false_negative: int

class FailureExample(BaseModel):
    text: str
    predicted_label: str
    actual_label: str
    error_type: str
    reason: str

class ErrorAnalysisResponse(BaseModel):
    model_config = {'protected_namespaces': ()}
    
    confusion_matrix: ConfusionMatrix
    model_weaknesses: List[str]
    failures: List[FailureExample]

# Health check response schema
class HealthCheckResponse(BaseModel):
    model_config = {'protected_namespaces': ()}
    
    status: str
    model_loaded: bool
    database_connected: bool
