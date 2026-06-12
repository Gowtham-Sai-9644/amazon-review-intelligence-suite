import os
import sys
import unittest
import numpy as np

# Ensure we can import from ml/src
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../ml/src')))

from preprocess import (
    count_syllables,
    calculate_readability,
    get_lexicon_sentiment,
    extract_tabular_features
)

class TestMLPreprocessing(unittest.TestCase):
    
    def test_syllable_counting(self):
        self.assertEqual(count_syllables("battery"), 3)
        self.assertEqual(count_syllables("lasts"), 1)
        self.assertEqual(count_syllables("sturdy"), 2)
        self.assertEqual(count_syllables("the"), 1)
        self.assertEqual(count_syllables("a"), 1)

    def test_readability_scorer(self):
        # High readability test
        simple_text = "The dog sat. The cat ran. It is good."
        simple_score = calculate_readability(simple_text)
        self.assertGreater(simple_score, 80.0)
        
        # Low readability test
        complex_text = "This multi-threaded asynchronous architectural structure facilitates decentralized synchronization algorithms."
        complex_score = calculate_readability(complex_text)
        self.assertLess(complex_score, 40.0)

    def test_lexicon_sentiment(self):
        pos_text = "This laptop is excellent and perfect, very happy."
        neg_text = "This item is bad, terrible, defective and broken."
        neu_text = "The product is standard and average."
        
        self.assertGreater(get_lexicon_sentiment(pos_text), 0.0)
        self.assertLess(get_lexicon_sentiment(neg_text), 0.0)
        self.assertEqual(get_lexicon_sentiment(neu_text), 0.0)

    def test_feature_extraction(self):
        text = "This camera is great!"
        feats = extract_tabular_features(text)
        
        self.assertIn("word_count", feats)
        self.assertIn("char_count", feats)
        self.assertIn("avg_word_length", feats)
        self.assertIn("exclamation_density", feats)
        self.assertIn("readability_score", feats)
        self.assertIn("sentiment_score", feats)
        
        self.assertEqual(feats["word_count"], 4.0)
        self.assertGreater(feats["exclamation_density"], 0.0)

if __name__ == "__main__":
    unittest.main()
