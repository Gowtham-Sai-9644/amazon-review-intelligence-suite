from sqlalchemy.orm import Session
from sqlalchemy import func
from database import ReviewLog
from typing import Dict, Any

def log_review(
    db: Session, 
    review_text: str, 
    helpfulness_score: float, 
    confidence: float, 
    quality_rating: str, 
    sentiment: str, 
    length: int
) -> ReviewLog:
    db_log = ReviewLog(
        review_text=review_text,
        helpfulness_score=helpfulness_score,
        confidence=confidence,
        quality_rating=quality_rating,
        sentiment=sentiment,
        length=length
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_aggregate_analytics(db: Session) -> Dict[str, Any]:
    total = db.query(func.count(ReviewLog.id)).scalar() or 0
    
    if total == 0:
        return {
            "total_analyzed": 0,
            "average_helpfulness": 0.0,
            "sentiment_distribution": {"Positive": 0, "Neutral": 0, "Negative": 0},
            "quality_distribution": {"High": 0, "Medium": 0, "Low": 0}
        }
        
    avg_helpfulness = db.query(func.avg(ReviewLog.helpfulness_score)).scalar() or 0.0
    
    # Sentiment distribution
    sentiments = db.query(ReviewLog.sentiment, func.count(ReviewLog.id)).group_by(ReviewLog.sentiment).all()
    sentiment_dist = {"Positive": 0, "Neutral": 0, "Negative": 0}
    for s, count in sentiments:
        if s in sentiment_dist:
            sentiment_dist[s] = count
            
    # Quality distribution
    qualities = db.query(ReviewLog.quality_rating, func.count(ReviewLog.id)).group_by(ReviewLog.quality_rating).all()
    quality_dist = {"High": 0, "Medium": 0, "Low": 0}
    for q, count in qualities:
        if q in quality_dist:
            quality_dist[q] = count
            
    return {
        "total_analyzed": int(total),
        "average_helpfulness": round(float(avg_helpfulness), 2),
        "sentiment_distribution": sentiment_dist,
        "quality_distribution": quality_dist
    }
