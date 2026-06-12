import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List

class SHAPExplainerManager:
    def __init__(self, models_dir: str = "ml/models"):
        self.models_dir = models_dir
        self.hybrid_model = None
        self.tfidf_vectorizer = None
        self.tfidf_model = None
        self.tabular_explainer = None
        self.word_explainer = None

    def load_models(self):
        """Loads models and initializes SHAP explainers."""
        if self.hybrid_model is None:
            self.hybrid_model = joblib.load(os.path.join(self.models_dir, "hybrid_xgb.pkl"))
            self.tfidf_vectorizer = joblib.load(os.path.join(self.models_dir, "tfidf_vectorizer.pkl"))
            self.tfidf_model = joblib.load(os.path.join(self.models_dir, "tfidf_xgb.pkl"))
            
            # Initialize TreeSHAP explainers
            import shap
            # Tabular SHAP explainer from hybrid XGBoost (first 6 features represent the tabular statistics)
            self.tabular_explainer = shap.TreeExplainer(self.hybrid_model)
            # Word SHAP explainer from TF-IDF XGBoost
            self.word_explainer = shap.TreeExplainer(self.tfidf_model)

    def explain(self, text: str, tabular_feats_dict: Dict[str, float]) -> Dict[str, Any]:
        self.load_models()
        
        # 1. Compute Tabular Feature Contributions
        # Build tabular feature vector
        tab_vector = np.array([
            tabular_feats_dict["word_count"],
            tabular_feats_dict["char_count"],
            tabular_feats_dict["avg_word_length"],
            tabular_feats_dict["exclamation_density"],
            tabular_feats_dict["readability_score"],
            tabular_feats_dict["sentiment_score"]
        ]).reshape(1, -1)
        
        # We padd dummy embedding values (384 dimensions of zeros) so the input size matches 389 features
        full_vector = np.hstack((tab_vector, np.zeros((1, 384))))
        
        # Compute SHAP values for the full vector
        shap_values_full = self.tabular_explainer.shap_values(full_vector)
        
        # If binary classification output is a list, extract the array
        if isinstance(shap_values_full, list):
            shap_values_full = shap_values_full[1] # Use positive class contribution
            
        # Extract the SHAP values corresponding to the first 6 tabular features
        # Flatten shap_values if it's 2D
        shap_values_flat = shap_values_full.flatten()
        tab_shap = shap_values_flat[:6]
        
        tabular_contributions = {
            "word_count": float(tab_shap[0]),
            "char_count": float(tab_shap[1]),
            "avg_word_length": float(tab_shap[2]),
            "exclamation_density": float(tab_shap[3]),
            "readability_score": float(tab_shap[4]),
            "sentiment_score": float(tab_shap[5])
        }
        
        # 2. Compute Word-Level Contributions using TF-IDF XGBoost model
        # Vectorize text
        tfidf_features = self.tfidf_vectorizer.transform([text]).toarray()
        shap_values_words = self.word_explainer.shap_values(tfidf_features)
        
        if isinstance(shap_values_words, list):
            shap_values_words = shap_values_words[1]
            
        shap_values_words_flat = shap_values_words.flatten()
        
        # Map back to feature names (words)
        feature_names = self.tfidf_vectorizer.get_feature_names_out()
        
        # Find active features (words that appear in this specific review)
        active_indices = np.where(tfidf_features[0] > 0)[0]
        
        word_attributions = []
        for idx in active_indices:
            word = feature_names[idx]
            weight = float(shap_values_words_flat[idx])
            if abs(weight) > 1e-4:  # Filter out noise
                word_attributions.append({"word": word, "weight": weight})
                
        # Sort word attributions
        word_attributions.sort(key=lambda x: x["weight"], reverse=True)
        
        top_positive_words = [item for item in word_attributions if item["weight"] > 0][:5]
        top_negative_words = [item for item in word_attributions if item["weight"] < 0]
        # Sort negative words ascendingly (most negative first)
        top_negative_words.sort(key=lambda x: x["weight"])
        top_negative_words = top_negative_words[:5]
        
        # 3. Formulate human-readable explanations based on tabular SHAP and stats
        readability_impact = "Neutral"
        if tabular_feats_dict["readability_score"] > 70:
            readability_impact = f"Positive (Readability Score of {int(tabular_feats_dict['readability_score'])}: Review is highly accessible and clear)"
        elif tabular_feats_dict["readability_score"] < 40:
            readability_impact = f"Negative (Readability Score of {int(tabular_feats_dict['readability_score'])}: Text uses complex or unstructured phrases)"
            
        length_impact = "Neutral"
        if tabular_feats_dict["word_count"] > 30:
            length_impact = f"Positive (Word Count of {int(tabular_feats_dict['word_count'])}: Review is detailed, providing real-world usage insights)"
        elif tabular_feats_dict["word_count"] < 10:
            length_impact = f"Negative (Word Count of {int(tabular_feats_dict['word_count'])}: Review is too brief to supply concrete information)"
            
        return {
            "tabular_shap": tabular_contributions,
            "top_positive_words": top_positive_words,
            "top_negative_words": top_negative_words,
            "readability_impact": readability_impact,
            "length_impact": length_impact
        }
