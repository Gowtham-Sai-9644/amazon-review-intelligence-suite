import re
import numpy as np
import pandas as pd
from typing import List, Dict, Any

# Simple syllable counter for readability calculations
def count_syllables(word: str) -> int:
    word = word.lower()
    if len(word) <= 3:
        return 1
    # Remove silent 'e' at the end
    if word.endswith('e'):
        word = word[:-1]
    # Count vowel groups
    vowels = "aeiouy"
    count = 0
    prev_char_was_vowel = False
    for char in word:
        is_vowel = char in vowels
        if is_vowel and not prev_char_was_vowel:
            count += 1
        prev_char_was_vowel = is_vowel
    if count == 0:
        count = 1
    return count

def calculate_readability(text: str) -> float:
    """
    Computes a simplified Flesch Reading Ease score:
    206.835 - 1.015 * (total_words / total_sentences) - 84.6 * (total_syllables / total_words)
    """
    if not text.strip():
        return 0.0
    
    # Simple sentence tokenization
    sentences = [s for s in re.split(r'[.!?]+', text) if s.strip()]
    num_sentences = max(len(sentences), 1)
    
    # Word tokenization
    words = [w for w in re.findall(r'\b\w+\b', text) if w]
    num_words = max(len(words), 1)
    
    # Syllables count
    num_syllables = sum(count_syllables(w) for w in words)
    
    # Flesch Reading Ease Formula
    score = 206.835 - 1.015 * (num_words / num_sentences) - 84.6 * (num_syllables / num_words)
    # Clip between 0 and 100 for safety
    return float(np.clip(score, 0.0, 100.0))

def get_lexicon_sentiment(text: str) -> float:
    """
    Simple lexicon-based sentiment analyzer.
    Returns polarity between -1.0 (extremely negative) and 1.0 (extremely positive).
    Avoids heavy nltk/textblob downloads during startup but gives robust results.
    """
    positive_words = {
        'excellent', 'great', 'good', 'sturdy', 'love', 'perfect', 'amazing', 'best', 
        'awesome', 'superb', 'happy', 'durability', 'durable', 'satisfied', 'worth', 
        'nice', 'fast', 'easy', 'smooth', 'helpful', 'beautiful', 'quality', 'value'
    }
    negative_words = {
        'bad', 'poor', 'worst', 'waste', 'disappointing', 'broke', 'broken', 'useless', 
        'garbage', 'cheap', 'terrible', 'return', 'returned', 'stop', 'stopped', 'failed', 
        'hate', 'difficult', 'slow', 'defect', 'defective', 'charge', 'drain', 'drains'
    }
    
    words = re.findall(r'\b\w+\b', text.lower())
    if not words:
        return 0.0
    
    pos_count = sum(1 for w in words if w in positive_words)
    neg_count = sum(1 for w in words if w in negative_words)
    
    total = pos_count + neg_count
    if total == 0:
        return 0.0
    
    return float((pos_count - neg_count) / total)

def clean_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    # Remove extra whitespaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_tabular_features(text: str) -> Dict[str, float]:
    """
    Extracts tabular linguistic features for the hybrid model.
    """
    cleaned = clean_text(text)
    words = cleaned.split()
    word_count = len(words)
    char_count = len(cleaned)
    avg_word_length = char_count / max(word_count, 1)
    
    # Exclamation mark density
    excl_count = text.count('!')
    excl_density = excl_count / max(char_count, 1)
    
    readability = calculate_readability(cleaned)
    sentiment = get_lexicon_sentiment(cleaned)
    
    return {
        "word_count": float(word_count),
        "char_count": float(char_count),
        "avg_word_length": float(avg_word_length),
        "exclamation_density": float(excl_density),
        "readability_score": float(readability),
        "sentiment_score": float(sentiment)
    }

class TextEmbeddingExtractor:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.model = None
        
    def load_model(self):
        if self.model is None:
            try:
                from sentence_transformers import SentenceTransformer
                self.model = SentenceTransformer(self.model_name)
            except ImportError:
                print("sentence-transformers not installed. Embedding features will return zeros.")
                self.model = "fallback"

    def get_embeddings(self, texts: List[str]) -> np.ndarray:
        self.load_model()
        if self.model == "fallback" or self.model is None:
            # Return dummy 384-dimensional embeddings (MiniLM output size)
            return np.zeros((len(texts), 384))
        
        return self.model.encode(texts, show_progress_bar=False)

def build_feature_matrix(texts: List[str], embedding_extractor: TextEmbeddingExtractor) -> np.ndarray:
    """
    Builds the fused feature matrix: Concatenates Tabular Features + MiniLM Embeddings.
    """
    # Extract tabular features
    tab_list = []
    for t in texts:
        feats = extract_tabular_features(t)
        tab_list.append([
            feats["word_count"],
            feats["char_count"],
            feats["avg_word_length"],
            feats["exclamation_density"],
            feats["readability_score"],
            feats["sentiment_score"]
        ])
    X_tab = np.array(tab_list)
    
    # Extract sentence embeddings
    X_emb = embedding_extractor.get_embeddings(texts)
    
    # Fuse features
    return np.hstack((X_tab, X_emb))

# Header names for tabular columns
TABULAR_FEATURE_NAMES = [
    "word_count",
    "char_count",
    "avg_word_length",
    "exclamation_density",
    "readability_score",
    "sentiment_score"
]
