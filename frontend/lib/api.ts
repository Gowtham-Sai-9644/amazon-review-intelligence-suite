const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface SentimentData {
  label: string;
  score: number;
}

export interface WordWeight {
  word: string;
  weight: number;
}

export interface ExplanationData {
  tabular_shap: Record<string, number>;
  top_positive_words: WordWeight[];
  top_negative_words: WordWeight[];
  readability_impact: string;
  length_impact: string;
}

export interface AnalysisResponse {
  helpfulness_score: number;
  confidence: number;
  quality_rating: string;
  sentiment: SentimentData;
  explanation: ExplanationData;
}

export interface AnalyticsResponse {
  total_analyzed: number;
  average_helpfulness: number;
  sentiment_distribution: Record<string, number>;
  quality_distribution: Record<string, number>;
  model_metrics: Array<{
    model: string;
    accuracy: number;
    f1: number;
    precision: number;
    recall: number;
    roc_auc: number;
  }>;
}

export interface BusinessInsightsResponse {
  optimal_word_count_min: number;
  optimal_word_count_max: number;
  top_helpful_keywords: Array<{ word: string; correlation: number }>;
  top_unhelpful_keywords: Array<{ word: string; correlation: number }>;
  length_vs_helpfulness: Array<{ range: string; avg_helpfulness: number }>;
}

export interface FailureExample {
  text: string;
  predicted_label: string;
  actual_label: string;
  error_type: string;
  reason: string;
}

export interface ErrorAnalysisResponse {
  confusion_matrix: {
    true_positive: number;
    false_positive: number;
    true_negative: number;
    false_negative: number;
  };
  model_weaknesses: string[];
  failures: FailureExample[];
}

export async function analyzeReview(text: string): Promise<AnalysisResponse> {
  const res = await fetch(`${API_BASE_URL}/analyze-review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to analyze review');
  }
  return res.json();
}

export async function getAnalytics(): Promise<AnalyticsResponse> {
  const res = await fetch(`${API_BASE_URL}/analytics`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function getBusinessInsights(): Promise<BusinessInsightsResponse> {
  const res = await fetch(`${API_BASE_URL}/business-insights`);
  if (!res.ok) throw new Error('Failed to fetch business insights');
  return res.json();
}

export async function getErrorAnalysis(): Promise<ErrorAnalysisResponse> {
  const res = await fetch(`${API_BASE_URL}/error-analysis`);
  if (!res.ok) throw new Error('Failed to fetch error analysis');
  return res.json();
}
