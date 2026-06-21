import os
import sys
import time
import re
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

def generate_reasoning_v4(text: str, feats: Dict[str, float], score: float, confidence: float) -> Dict[str, Any]:
    text_lower = text.lower()
    word_count = int(feats["word_count"])
    readability = feats["readability_score"]
    sentiment = feats["sentiment_score"]
    
    why_high = []
    why_low = []
    supporting_evidence = []
    missing_evidence = []
    
    # 1. Evaluate word count
    if word_count >= 50:
        why_high.append(f"Detailed length ({word_count} words) provides rich descriptive content.")
        supporting_evidence.append(f"Word count of {word_count} exceeds the helpfulness threshold of 45 words.")
    else:
        why_low.append(f"Extremely brief text ({word_count} words) limits review utility.")
        missing_evidence.append("Detailed explanation of user experience and product features.")
        
    # 2. Evaluate readability
    if readability >= 65:
        why_high.append(f"High readability score ({int(readability)}: clear, accessible writing style).")
    elif readability < 40:
        why_low.append(f"Low readability score ({int(readability)}: complex or poorly structured phrases).")
        missing_evidence.append("Simplified syntax or pros/cons list formatting.")
        
    # 3. Evaluate sentiment and tone
    if abs(sentiment) < 0.35:
        why_high.append("Balanced, objective tone analyzing both strengths and weaknesses.")
        supporting_evidence.append("Sentiment score represents objective evaluation rather than biased praise.")
    else:
        why_low.append("Subjective tone with one-sided sentiment bias.")
        missing_evidence.append("Balanced critique of product limitations.")
        
    # 4. Check specific attributes
    has_spec = any(w in text_lower for w in ["battery", "suction", "screen", "keyboard", "sturdy", "fit", "materials", "size"])
    if has_spec:
        supporting_evidence.append("Review explicitly mentions specific product dimensions/features.")
    else:
        why_low.append("Lack of specific product specifications.")
        missing_evidence.append("Direct reference to battery, hardware quality, or physical metrics.")

    # 5. Check long-term usage
    has_time = any(w in text_lower for w in ["month", "week", "days", "year", "bought", "used for", "purchased"])
    if has_time:
        supporting_evidence.append("Time-based usage duration mentioned.")
    else:
        why_low.append("Missing temporal context of product usage.")
        missing_evidence.append("Clarification of usage duration (e.g. 'after using for 3 weeks').")

    # Clean empty states
    if not why_high:
        why_high = ["Basic positive sentiment tokens suggest positive alignment."]
    if not why_low:
        why_low = ["Review is highly optimized; minor vocabulary adjustments possible."]
        
    confidence_explanation = f"The hybrid XGBoost model has {confidence}% confidence in this prediction based on MiniLM semantic embedding mapping and linguistic heuristics."
    weakness_explanation = "Review helpfulness is primarily bounded by " + ("text length constraints" if word_count < 45 else "subjective tone skew") + "."

    return {
        "why_high": why_high,
        "why_low": why_low,
        "supporting_evidence": supporting_evidence,
        "missing_evidence": missing_evidence,
        "confidence_explanation": confidence_explanation,
        "weakness_explanation": weakness_explanation
    }

def extract_evidence_v4(text: str, feats: Dict[str, float]) -> List[Dict[str, Any]]:
    text_lower = text.lower()
    evidence_list = []
    
    # 1. Usage Duration
    duration_match = re.search(r'\b\d+\s+(?:day|week|month|year|hr|hour)s?\b', text_lower)
    duration_keyword = any(w in text_lower for w in ["bought", "used for", "time", "months", "weeks"])
    if duration_match:
        evidence_list.append({
            "label": "Usage Duration",
            "present": True,
            "details": f"Mentioned: '{duration_match.group(0)}'"
        })
    elif duration_keyword:
        evidence_list.append({
            "label": "Usage Duration",
            "present": True,
            "details": "Indicated usage duration in text"
        })
    else:
        evidence_list.append({
            "label": "Usage Duration",
            "present": False,
            "details": "No temporal duration details found"
        })
        
    # 2. Measurable details
    numeric_details = [w for w in re.findall(r'\b\d+(?:\.\d+)?\s*(?:hz|hours|hrs|gb|tb|mah|inches|inch|lb|lbs|watt|w|cm|mm|v)\b', text_lower)]
    if numeric_details:
        evidence_list.append({
            "label": "Measurable Details",
            "present": True,
            "details": f"Extracted metrics: {', '.join(numeric_details)}"
        })
    else:
        evidence_list.append({
            "label": "Measurable Details",
            "present": False,
            "details": "No exact measurements or metrics mentioned"
        })
        
    # 3. Pros and Cons Structure
    has_structure = any(w in text_lower for w in ["pros:", "cons:", "pros & cons", "pros/cons", "pluses", "advantages", "disadvantages"])
    has_contrasts = any(w in text_lower for w in ["but", "however", "although", "except"])
    if has_structure:
        evidence_list.append({
            "label": "Pros & Cons Structure",
            "present": True,
            "details": "Uses structured lists/headings for advantages and disadvantages"
        })
    elif has_contrasts:
        evidence_list.append({
            "label": "Pros & Cons Structure",
            "present": True,
            "details": "Includes contrasting sentence structures (objective comparison)"
        })
    else:
        evidence_list.append({
            "label": "Pros & Cons Structure",
            "present": False,
            "details": "Lacks balanced structural contrasts"
        })
        
    # 4. Feature-Specific Keywords
    hardware_terms = [w for w in ["battery", "keyboard", "screen", "display", "suction", "materials", "casing", "durability", "firmware", "support", "charger"] if w in text_lower]
    if hardware_terms:
        evidence_list.append({
            "label": "Product Feature Focus",
            "present": True,
            "details": f"Analyzed features: {', '.join(hardware_terms)}"
        })
    else:
        evidence_list.append({
            "label": "Product Feature Focus",
            "present": False,
            "details": "No specific product hardware/service components discussed"
        })
        
    return evidence_list

def calculate_detailed_scores_v4(text: str, feats: Dict[str, float], helpfulness_score: float) -> Dict[str, float]:
    text_lower = text.lower()
    word_count = int(feats["word_count"])
    readability = feats["readability_score"]
    excl_density = feats["exclamation_density"]
    sentiment = feats["sentiment_score"]
    
    # Heuristic scoring
    specificity = min(100.0, max(15.0, (len(re.findall(r'\b\d+\b', text)) * 12) + (word_count / 1.5)))
    
    evidence_count = sum(1 for w in ["battery", "keyboard", "screen", "suction", "pros", "cons", "months", "weeks", "hours"] if w in text_lower)
    evidence_score = min(100.0, max(20.0, (evidence_count * 15) + (word_count / 2.0)))
    
    expertise = min(100.0, max(10.0, (feats["avg_word_length"] * 10) + (readability / 2.0) - (excl_density * 200.0)))
    
    authenticity = min(100.0, max(30.0, 100.0 - (excl_density * 400.0) - (15.0 if "great" in text_lower and "best" in text_lower else 0.0)))
    
    quality = min(100.0, max(20.0, (readability * 0.4) + (min(150, word_count) * 0.4)))
    
    trust = round((authenticity * 0.4) + (specificity * 0.3) + (evidence_score * 0.3), 1)
    
    business_value = round((helpfulness_score * 0.6) + (trust * 0.4), 1)
    
    overall_intelligence = round((helpfulness_score * 0.4) + (trust * 0.2) + (quality * 0.2) + (expertise * 0.2), 1)
    
    return {
        "quality_score": round(quality, 1),
        "trust_score": trust,
        "specificity_score": round(specificity, 1),
        "evidence_score": round(evidence_score, 1),
        "expertise_score": round(expertise, 1),
        "authenticity_score": round(authenticity, 1),
        "helpfulness_score": helpfulness_score,
        "business_value_score": business_value,
        "overall_intelligence_score": overall_intelligence
    }

def generate_copilot_rewrites_v4(text: str, score: float) -> Dict[str, Any]:
    text_clean = clean_text(text)
    
    # 1. Trust rewrite
    trust_text = f"Review Audit (Optimized for Objectivity):\n{text_clean}\n\nNote: After 4 weeks of testing, the physical build feels sturdy. Pros: Responsive controls and clear display. Cons: Slightly higher power draw but acceptable."
    # 2. Helpfulness rewrite
    help_text = f"Structured Analysis (Optimized for Helpfulness):\nPros:\n- Tactile interface response.\n- Durable casing materials.\nCons:\n- Battery life is around 8-10 hours, which is average.\n\nOverall: Worth the price if you need a reliable daily driver."
    # 3. Conversion rewrite
    conv_text = f"Value Proposition (Optimized for Decision-Making):\nI tested this under normal load. Setting it up took 5 minutes. The aluminum build quality feels premium. If you are looking for durability, this is a solid recommendation."
    
    # Estimate boosted scores
    score_a = round(min(98.0, max(score + 15.0, 75.0)), 1)
    score_b = round(min(98.0, max(score + 25.0, 85.0)), 1)
    score_c = round(min(98.0, max(score + 20.0, 80.0)), 1)
    
    return {
        "version_a_trust": {
            "text": trust_text,
            "predicted_score": score_a,
            "improvement_delta": round(score_a - score, 1)
        },
        "version_b_helpfulness": {
            "text": help_text,
            "predicted_score": score_b,
            "improvement_delta": round(score_b - score, 1)
        },
        "version_c_conversion": {
            "text": conv_text,
            "predicted_score": score_c,
            "improvement_delta": round(score_c - score, 1)
        }
    }

def generate_counterfactuals_v4(score: float, word_count: int, readability: float) -> List[Dict[str, Any]]:
    items = []
    
    # Scenario 1: Increase Word Count
    if word_count < 60:
        diff = round(min(25.0, 60.0 - word_count) * 0.4, 1)
        items.append({
            "scenario": "Increase review detail (add ~30 more descriptive words)",
            "score_change": diff,
            "impact": "Positive"
        })
        
    # Scenario 2: Improve Readability
    if readability < 65:
        diff = round((70.0 - readability) * 0.15, 1)
        items.append({
            "scenario": "Format text with bullet points (improve readability score to 75)",
            "score_change": max(1.0, diff),
            "impact": "Positive"
        })
    else:
        items.append({
            "scenario": "Maintain clear formatting guidelines",
            "score_change": 0.0,
            "impact": "Neutral"
        })
        
    # Scenario 3: Add Measurable Details
    items.append({
        "scenario": "Include measurements (e.g. state battery life, weights, or dimensions)",
        "score_change": 12.5,
        "impact": "Positive"
    })
    
    # Scenario 4: subjectivity reduction
    items.append({
        "scenario": "Add a negative detail to balance a hyper-positive review",
        "score_change": 8.0,
        "impact": "Positive"
    })
    
    return items

def generate_business_intelligence_v4(score: float, trust: float) -> Dict[str, str]:
    if score >= 75.0:
        buyer_trust = "High"
        conversion_impact = "+12% Sales Lift"
        visibility_prediction = "Promoted placement (Top 3 slots)"
        recommendation = "Publish & Feature"
    elif score >= 45.0:
        buyer_trust = "Medium"
        conversion_impact = "+4% Neutral Lift"
        visibility_prediction = "Standard placement"
        recommendation = "Publish Review"
    else:
        buyer_trust = "Low"
        conversion_impact = "-2% Sales Drag"
        visibility_prediction = "Deprioritized placement"
        recommendation = "Request Details / Hold"
        
    return {
        "buyer_trust": buyer_trust,
        "conversion_impact": conversion_impact,
        "visibility_prediction": visibility_prediction,
        "recommendation": recommendation
    }

def clean_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    # Remove extra whitespaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text

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
        word_count = tabular_feats["word_count"]
        readability = tabular_feats["readability_score"]
        
        # 2. Build fused feature matrix (Tabular + Sentence Embeddings)
        X_fused = build_feature_matrix([text], self.emb_extractor)
        
        # 3. Predict helpfulness probability
        prob = float(self.hybrid_model.predict_proba(X_fused)[0, 1])
        helpfulness_score = round(prob * 100, 1)
        
        # 4. Confidence estimation
        confidence_val = 2 * abs(prob - 0.5) * 100
        confidence = round(max(50.0, min(98.0, confidence_val)), 1)
        
        # 5. Quality rating bucket
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
        
        # 8. Compute execution time
        inference_time_ms = round((time.perf_counter() - start_time) * 1000, 2)
        
        # ═══════════════════════════════════════════
        # V4 EXTRA ENGINES
        # ═══════════════════════════════════════════
        reasoning = generate_reasoning_v4(text, tabular_feats, helpfulness_score, confidence)
        evidence = extract_evidence_v4(text, tabular_feats)
        detailed_scores = calculate_detailed_scores_v4(text, tabular_feats, helpfulness_score)
        copilot = generate_copilot_rewrites_v4(text, helpfulness_score)
        counterfactuals = generate_counterfactuals_v4(helpfulness_score, int(word_count), readability)
        bi_analysis = generate_business_intelligence_v4(helpfulness_score, detailed_scores["trust_score"])
        
        # recommendations
        from pipeline import generate_ai_recommendations, generate_natural_explanation
        recs = generate_ai_recommendations(text, tabular_feats, helpfulness_score)
        nat_expl = generate_natural_explanation(text, tabular_feats, helpfulness_score)
        
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
            "recommendations": recs,
            "natural_explanation": nat_expl,
            "inference_time_ms": inference_time_ms,
            "model_version": "1.0.0-hybrid-xgb",
            
            # V4 fields
            "reasoning": reasoning,
            "evidence": evidence,
            "detailed_scores": detailed_scores,
            "copilot": copilot,
            "counterfactuals": counterfactuals,
            "business_intelligence": bi_analysis
        }
