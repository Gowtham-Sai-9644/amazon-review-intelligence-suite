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

# Review Analyzer response schema
class AnalyzeReviewResponse(BaseModel):
    helpfulness_score: float = Field(..., description="Predicted helpfulness percentage (0-100)")
    confidence: float = Field(..., description="Confidence score (0-100)")
    quality_rating: str = Field(..., description="Quality bucket (Low, Medium, High)")
    sentiment: SentimentResult
    explanation: ExplanationResult
    recommendations: List[str] = Field(default=[], description="Actionable AI recommendations to improve review helpfulness")
    natural_explanation: str = Field(default="", description="A natural language summary explaining the prediction")


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
