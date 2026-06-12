import os
import sys
import time
import joblib
import numpy as np
from typing import Dict, Any, List

# Ensure backend can import from ml/src
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../ml/src')))

from preprocess import (
    extract_tabular_features, 
    TextEmbeddingExtractor, 
    build_feature_matrix
)
from explain import SHAPExplainerManager

def generate_ai_recommendations(text: str, feats: Dict[str, float], score: float) -> List[Dict[str, str]]:
    recs = []
    text_lower = text.lower()
    word_count = feats["word_count"]
    excl_density = feats["exclamation_density"]
    
    # 1. Word count recommendation
    if word_count < 45:
        recs.append({"impact": "High", "text": "Increase review detail (aim for 50-150 words) to share a complete experience."})
    elif word_count > 250:
        recs.append({"impact": "Medium", "text": "Consider summarizing key points to keep the review concise and readable."})
        
    # 2. Long-term usage recommendation
    time_keywords = ["day", "week", "month", "year", "time", "bought", "used", "purchased", "duration", "long-term", "run"]
    has_time = any(w in text_lower for w in time_keywords)
    if not has_time and word_count < 100:
        recs.append({"impact": "Medium", "text": "State the usage duration (e.g., 'after 3 weeks of daily use') to establish credibility."})
        
    # 3. Product attributes / details
    attr_keywords = ["durability", "durable", "easy", "quality", "material", "feel", "keyboard", "battery", "camera", "screen", "support", "service", "charge", "refund", "price", "worth", "sturdy", "fit"]
    has_attrs = any(w in text_lower for w in attr_keywords)
    if not has_attrs and word_count < 120:
        recs.append({"impact": "High", "text": "Mention specific product features, durability, build quality, or ease of use."})
        
    # 4. Balanced review structure
    balance_keywords = ["pros", "cons", "plus", "minus", "however", "although", "but", "while", "except", "limitation"]
    has_balance = any(w in text_lower for w in balance_keywords)
    if not has_balance and word_count < 100:
        recs.append({"impact": "Medium", "text": "Include both advantages and limitations (pros/cons) for a more objective perspective."})
        
    # 5. Tone / Exclamation points
    if excl_density > 0.02:
        recs.append({"impact": "Low", "text": "Reduce the usage of exclamation marks ('!') to maintain a professional, objective tone."})
        
    # Fallback if review is already near-perfect
    if not recs:
        recs.append({"impact": "Low", "text": "Your review is highly optimized! Keep writing detailed reviews with feature-specific feedback."})
        
    return recs

def generate_natural_explanation(text: str, feats: Dict[str, float], score: float) -> str:
    word_count = int(feats["word_count"])
    readability_score = feats["readability_score"]
    
    if score >= 70.0:
        readability_str = "excellent readability" if readability_score > 60 else "standard readability"
        return f"This review is predicted to be highly helpful ({score}% helpfulness score). The ML pipeline attributes this to its detailed length ({word_count} words), {readability_str}, and clear usage of feature-specific descriptive terms."
    elif score >= 40.0:
        return f"This review has moderate helpfulness ({score}% helpfulness score). It contains useful sentiment cues, but it could be significantly improved by adding more detailed observations about product features or long-term durability."
    else:
        return f"This review is predicted to have low helpfulness ({score}% helpfulness score). The ML pipeline flagged this due to its brevity ({word_count} words), which lacks enough descriptive detail for other shoppers to make an informed decision."

class MLInferencePipeline:
    def __init__(self, models_dir: str = "ml/models"):
        self.models_dir = os.path.abspath(models_dir)
        self.hybrid_model = None
        self.emb_extractor = None
        self.shap_manager = None
        
    def load_pipeline(self):
        """Loads model binaries and explainers into memory."""
        if self.hybrid_model is None:
            print(f"Loading model artifacts from {self.models_dir}...")
            # Load classifier
            self.hybrid_model = joblib.load(os.path.join(self.models_dir, "hybrid_xgb.pkl"))
            
            # Load embeddings extractor (loaded lazily on first prediction request)
            self.emb_extractor = TextEmbeddingExtractor()
            
            # Load SHAP manager
            self.shap_manager = SHAPExplainerManager(models_dir=self.models_dir)
            self.shap_manager.load_models()
            print("ML Inference Pipeline loaded successfully!")
 
    def predict(self, text: str) -> Dict[str, Any]:
        self.load_pipeline()
        start_time = time.perf_counter()
        
        # 1. Extract tabular features
        tabular_feats = extract_tabular_features(text)
        
        # 2. Build fused feature matrix (Tabular + Sentence Embeddings)
        X_fused = build_feature_matrix([text], self.emb_extractor)
        
        # 3. Predict helpfulness probability
        prob = float(self.hybrid_model.predict_proba(X_fused)[0, 1])
        helpfulness_score = round(prob * 100, 1)
        
        # 4. Confidence estimation
        # For binary classifier, confidence = 2 * |prob - 0.5| * 100
        confidence_val = 2 * abs(prob - 0.5) * 100
        # Floor confidence at 50% for standard binary decisions, cap at 98%
        confidence = round(max(50.0, min(98.0, confidence_val)), 1)
        
        # 5. Quality rating bucket
        word_count = tabular_feats["word_count"]
        if helpfulness_score >= 70.0 and word_count >= 25:
            quality_rating = "High"
        elif helpfulness_score >= 40.0 or word_count >= 15:
            quality_rating = "Medium"
        else:
            quality_rating = "Low"
            
        # 6. Sentiment classification
        sentiment_score = tabular_feats["sentiment_score"]
        if sentiment_score > 0.15:
            sentiment_label = "Positive"
            sentiment_conf = min(0.98, 0.5 + abs(sentiment_score)/2)
        elif sentiment_score < -0.15:
            sentiment_label = "Negative"
            sentiment_conf = min(0.98, 0.5 + abs(sentiment_score)/2)
        else:
            sentiment_label = "Neutral"
            sentiment_conf = 1.0 - abs(sentiment_score)
            
        # 7. Generate SHAP explainability
        explanation = self.shap_manager.explain(text, tabular_feats)
        
        # 8. Generate AI Recommendations and Natural Explanation
        recs = generate_ai_recommendations(text, tabular_feats, helpfulness_score)
        nat_expl = generate_natural_explanation(text, tabular_feats, helpfulness_score)
        
        # 9. Compute inference execution time
        inference_time_ms = round((time.perf_counter() - start_time) * 1000, 2)
        
        return {
            "helpfulness_score": helpfulness_score,
            "confidence": confidence,
            "quality_rating": quality_rating,
            "sentiment": {
                "label": sentiment_label,
                "score": round(float(sentiment_conf) * 100, 1)
            },
            "explanation": {
                "tabular_shap": explanation["tabular_shap"],
                "top_positive_words": explanation["top_positive_words"],
                "top_negative_words": explanation["top_negative_words"],
                "readability_impact": explanation["readability_impact"],
                "length_impact": explanation["length_impact"]
            },
            "length": int(word_count),
            "recommendations": recs,
            "natural_explanation": nat_expl,
            "inference_time_ms": inference_time_ms,
            "model_version": "1.0.0-hybrid-xgb"
        }
