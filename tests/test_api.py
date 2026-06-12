import os
import sys
import unittest
from unittest.mock import MagicMock

# Ensure we can import from backend/app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend/app')))

import schemas
from main import health_check, get_analytics, get_business_insights, get_error_analysis, analyze_review

class TestBackendAPIRoutes(unittest.TestCase):
    
    def setUp(self):
        # Create a mock database session
        self.db = MagicMock()

    def test_health_route(self):
        response = health_check(self.db)
        self.assertIn("status", response)
        self.assertEqual(response["status"], "healthy")
        self.assertIn("model_loaded", response)
        self.assertIn("database_connected", response)

    def test_analytics_route(self):
        # Setup mock db query responses
        self.db.query().scalar.return_value = 10  # total
        self.db.query().scalar.return_value = 75.5 # avg helpfulness
        self.db.query().group_by().all.return_value = [("Positive", 5), ("Negative", 5)]
        
        response = get_analytics(self.db)
        self.assertIn("total_analyzed", response)
        self.assertIn("average_helpfulness", response)
        self.assertIn("model_metrics", response)
        self.assertGreater(len(response["model_metrics"]), 0)

    def test_business_insights_route(self):
        response = get_business_insights()
        self.assertIn("optimal_word_count_min", response)
        self.assertIn("optimal_word_count_max", response)
        self.assertIn("top_helpful_keywords", response)
        self.assertIn("length_vs_helpfulness", response)

    def test_error_analysis_route(self):
        response = get_error_analysis()
        self.assertIn("confusion_matrix", response)
        self.assertIn("model_weaknesses", response)
        self.assertIn("failures", response)

    def test_analyze_review_route(self):
        # Create a mock review request
        request = schemas.AnalyzeReviewRequest(
            text="This phone lasts for 12 hours. Keyboard feels very sturdy and works perfect."
        )
        
        # Test endpoint. If models are loaded, it returns response dict; otherwise it raises HTTPException
        try:
            response = analyze_review(request, self.db)
            self.assertIn("helpfulness_score", response)
            self.assertIn("confidence", response)
            self.assertIn("quality_rating", response)
            self.assertIn("sentiment", response)
            self.assertIn("explanation", response)
        except Exception as e:
            # If model is not loaded, HTTPException is expected. Verify it's an HTTPException.
            from fastapi import HTTPException
            self.assertTrue(isinstance(e, HTTPException))

if __name__ == "__main__":
    unittest.main()
