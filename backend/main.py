from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc, func, or_
from datetime import datetime, timedelta, timezone
from typing import List, Optional
import uvicorn
import logging
import json

from database import get_db, create_tables
from models import Mention, Alert, Topic, KeywordSearch
from schemas import (
    MentionCreate, MentionResponse, MentionFilters,
    AlertCreate, AlertResponse, TopicResponse,
    KeywordSearchCreate, KeywordSearchResponse,
    SentimentAnalysis
)
from services.sentiment_analyzer import SentimentAnalyzer
from services.spike_detector import SpikeDetector
from services.data_sources import DataSourceManager
from services.scheduler import task_runner
# from services.mock_data import MockDataGenerator

from database import SessionLocal

# Background task for new keywords
def fetch_mentions_for_new_keyword(keyword_id: int):
    """Background task to fetch mentions for a newly added keyword"""
    db = None
    try:
        db = SessionLocal()
        keyword_search = db.query(KeywordSearch).filter(KeywordSearch.id == keyword_id).first()
        
        if keyword_search and keyword_search.is_active:
            mentions_count = data_source_manager.fetch_mentions_for_single_keyword(db, keyword_search)
            logger.info(f"Fetched {mentions_count} mentions for new keyword '{keyword_search.keyword}'")
        
    except Exception as e:
        logger.error(f"Error fetching mentions for new keyword {keyword_id}: {e}")
    finally:
        if db:
            db.close()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    create_tables()
    task_runner.start()
    logger.info("Background task runner started")
    yield
    # Shutdown
    task_runner.stop()
    logger.info("Background task runner stopped")

app = FastAPI(
    title="Brand Monitoring API",
    description="Track brand mentions across social media and news sites",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
sentiment_analyzer = SentimentAnalyzer()
data_source_manager = DataSourceManager()
# mock_generator = MockDataGenerator()

# Mentions endpoints
@app.get("/mentions")
async def get_mentions(
    sentiment: Optional[str] = None,
    platform: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Get brand mentions with pagination and filtering"""
    # Validate pagination parameters
    if limit > 100:
        raise HTTPException(status_code=400, detail="Limit cannot exceed 100")
    if offset < 0:
        raise HTTPException(status_code=400, detail="Offset cannot be negative")
    
    query = db.query(Mention)
    
    if platform:
        query = query.filter(Mention.platform == platform)
    
    if sentiment:
        query = query.filter(Mention.sentiment == sentiment)
    
    # Get total count for pagination
    total = query.count()
    
    # Get paginated results
    mentions = query.order_by(desc(Mention.created_at)).offset(offset).limit(limit).all()
    
    return {
        "data": mentions,
        "pagination": {
            "total": total,
            "limit": limit,
            "offset": offset,
            "pages": (total + limit - 1) // limit
        }
    }

@app.post("/mentions", response_model=MentionResponse)
async def create_mention(mention: MentionCreate, db: Session = Depends(get_db)):
    """Create a new mention with automatic sentiment analysis"""
    try:
        
        logger.info(f"Received mention creation request: {mention.dict()}")
        
        # Set created_at if not provided
        if not mention.created_at:
            mention.created_at = datetime.now(timezone.utc)
        
        # Analyze sentiment if not provided
        if not mention.sentiment or not mention.sentiment_score:
            sentiment, score = sentiment_analyzer.analyze(mention.text)
            mention.sentiment = sentiment
            mention.sentiment_score = score
            logger.info(f"Analyzed sentiment: {sentiment} (score: {score})")
        
        # Check for duplicate URL
        existing = db.query(Mention).filter(Mention.url == mention.url).first()
        if existing:
            logger.warning(f"Duplicate URL detected: {mention.url}")
            raise HTTPException(status_code=400, detail="Mention with this URL already exists")
        
        db_mention = Mention(**mention.dict())
        db.add(db_mention)
        db.commit()
        db.refresh(db_mention)
        
        logger.info(f"Created mention with ID: {db_mention.id}")
        return db_mention
        
    except Exception as e:
        logger.error(f"Error creating mention: {str(e)}")
        logger.error(f"Request data: {mention.dict() if mention else 'None'}")
        raise HTTPException(status_code=422, detail=f"Validation error: {str(e)}")

@app.get("/mentions/stats")
async def get_mention_stats(
    days: int = 7,
    db: Session = Depends(get_db)
):
    """Get mention statistics for the dashboard"""
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    # Total mentions
    total = db.query(Mention).filter(Mention.created_at >= start_date).count()
    
    # Sentiment breakdown
    sentiment_stats = db.query(
        Mention.sentiment,
        func.count(Mention.id).label('count')
    ).filter(
        Mention.created_at >= start_date
    ).group_by(Mention.sentiment).all()
    
    # Platform breakdown
    platform_stats = db.query(
        Mention.platform,
        func.count(Mention.id).label('count')
    ).filter(
        Mention.created_at >= start_date
    ).group_by(Mention.platform).all()
    
    # Daily trend
    daily_stats = db.query(
        func.date(Mention.created_at).label('date'),
        func.count(Mention.id).label('count')
    ).filter(
        Mention.created_at >= start_date
    ).group_by(func.date(Mention.created_at)).all()
    
    return {
        "total_mentions": total,
        "sentiment_breakdown": {stat.sentiment: stat.count for stat in sentiment_stats},
        "platform_breakdown": {stat.platform: stat.count for stat in platform_stats},
        "daily_trend": [{"date": str(stat.date), "count": stat.count} for stat in daily_stats]
    }

# Sentiment analysis endpoint
@app.post("/analyze-sentiment", response_model=SentimentAnalysis)
async def analyze_sentiment(text: str):
    """Analyze sentiment of provided text"""
    sentiment, score = sentiment_analyzer.analyze(text)
    return SentimentAnalysis(text=text, sentiment=sentiment, score=score)

# Alerts endpoints
@app.get("/alerts", response_model=List[AlertResponse])
async def get_alerts(
    resolved: Optional[bool] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get alerts with optional filtering"""
    query = db.query(Alert)
    
    if resolved is not None:
        query = query.filter(Alert.resolved == resolved)
    
    alerts = query.order_by(desc(Alert.created_at)).limit(limit).all()
    return alerts

@app.post("/alerts/check")
async def check_for_alerts(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Check for spikes and create alerts"""
    spike_detector = SpikeDetector(db)
    alert_data_list = spike_detector.detect_spikes()
    
    created_alerts = []
    for alert_data in alert_data_list:
        # Check if similar alert exists in last hour
        recent_alert = db.query(Alert).filter(
            and_(
                Alert.type == alert_data["type"],
                Alert.created_at >= datetime.now(timezone.utc) - timedelta(hours=1)
            )
        ).first()
        
        if not recent_alert:
            db_alert = Alert(**alert_data)
            db.add(db_alert)
            db.commit()
            db.refresh(db_alert)
            created_alerts.append(db_alert)
    
    return {"alerts_created": len(created_alerts), "alerts": created_alerts}

@app.patch("/alerts/{alert_id}/resolve")
async def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    """Mark an alert as resolved"""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.resolved = True
    db.commit()
    return {"message": "Alert resolved"}

# Data fetching endpoints
@app.post("/fetch-live-data")
async def fetch_live_data(
    brand_keywords: List[str],
    background_tasks: BackgroundTasks,
    limit_per_source: int = 50,
    db: Session = Depends(get_db)
):
    """Fetch live data from external sources"""
    mentions_data = data_source_manager.fetch_all_mentions(brand_keywords, limit_per_source)
    
    created_count = 0
    for mention_data in mentions_data:
        # Check for duplicates
        existing = db.query(Mention).filter(Mention.url == mention_data["url"]).first()
        if existing:
            continue
        
        # Analyze sentiment
        sentiment, score = sentiment_analyzer.analyze(mention_data["text"])
        mention_data["sentiment"] = sentiment
        mention_data["sentiment_score"] = score
        
        # Create mention
        db_mention = Mention(**mention_data)
        db.add(db_mention)
        created_count += 1
    
    db.commit()
    
    # Schedule spike detection
    background_tasks.add_task(check_for_alerts, db)
    
    return {"message": f"Fetched {created_count} new mentions", "total_fetched": len(mentions_data)}

# Missing frontend API endpoints
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}

@app.get("/mentions/search")
async def search_mentions(
    q: Optional[str] = None,
    sentiment: Optional[str] = None,
    platform: Optional[str] = None,
    startDate: Optional[str] = None,
    endDate: Optional[str] = None,
    sortBy: str = "created_at",
    sortOrder: str = "desc",
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Advanced search with multiple filters"""
    query = db.query(Mention)
    
    if q:
        query = query.filter(Mention.text.contains(q))
    if sentiment:
        query = query.filter(Mention.sentiment == sentiment)
    if platform:
        query = query.filter(Mention.platform == platform)
    if startDate:
        start_dt = datetime.fromisoformat(startDate.replace('Z', '+00:00'))
        query = query.filter(Mention.created_at >= start_dt)
    if endDate:
        end_dt = datetime.fromisoformat(endDate.replace('Z', '+00:00'))
        query = query.filter(Mention.created_at <= end_dt)
    
    # Sorting
    sort_column = getattr(Mention, sortBy, Mention.created_at)
    if sortOrder == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(sort_column)
    
    total = query.count()
    mentions = query.offset(offset).limit(limit).all()
    
    return {
        "data": mentions,
        "pagination": {
            "total": total,
            "limit": limit,
            "offset": offset,
            "pages": (total + limit - 1) // limit
        }
    }

@app.post("/keywords", response_model=KeywordSearchResponse)
async def add_keyword(keyword: KeywordSearchCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Add a new keyword search entry and fetch mentions immediately"""
    try:
        logger.info(f"Adding keyword: {keyword.model_dump()}")
        
        db_keyword = KeywordSearch(**keyword.model_dump())
        db.add(db_keyword)
        db.commit()
        db.refresh(db_keyword)
        
        # Fetch mentions for this keyword immediately in background
        background_tasks.add_task(fetch_mentions_for_new_keyword, db_keyword.id)
        
        logger.info(f"Created keyword with ID: {db_keyword.id} - fetching mentions in background")
        return db_keyword
        
    except Exception as e:
        logger.error(f"Error adding keyword: {str(e)}")
        raise HTTPException(status_code=422, detail=f"Validation error: {str(e)}")

@app.get("/keywords")
async def get_keywords(
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Get keyword searches with pagination"""
    # Validate pagination parameters
    if limit > 100:
        raise HTTPException(status_code=400, detail="Limit cannot exceed 100")
    if offset < 0:
        raise HTTPException(status_code=400, detail="Offset cannot be negative")
    
    query = db.query(KeywordSearch).filter(KeywordSearch.is_active == True)
    
    # Get total count for pagination
    total = query.count()
    
    # Get paginated results
    keywords = query.order_by(desc(KeywordSearch.created_at)).offset(offset).limit(limit).all()
    
    return {
        "data": keywords,
        "pagination": {
            "total": total,
            "limit": limit,
            "offset": offset,
            "pages": (total + limit - 1) // limit
        }
    }

@app.delete("/keywords/{keyword_id}")
async def delete_keyword(keyword_id: int, db: Session = Depends(get_db)):
    """Delete a keyword search"""
    keyword = db.query(KeywordSearch).filter(KeywordSearch.id == keyword_id).first()
    if not keyword:
        raise HTTPException(status_code=404, detail="Keyword not found")
    
    keyword.is_active = False
    db.commit()
    return {"message": "Keyword deleted"}

@app.get("/stats")
async def get_stats(db: Session = Depends(get_db)):
    """Get overall statistics"""
    stats = await get_mention_stats(7, db)
    
    # Get recent alerts
    recent_alerts = db.query(Alert).filter(Alert.resolved == False).order_by(desc(Alert.created_at)).limit(5).all()
    
    sentiment_breakdown = stats["sentiment_breakdown"]
    total = stats["total_mentions"]
    
    return {
        "total_mentions": total,
        "positive_count": sentiment_breakdown.get("positive", 0),
        "negative_count": sentiment_breakdown.get("negative", 0),
        "neutral_count": sentiment_breakdown.get("neutral", 0),
        "positive_percentage": round((sentiment_breakdown.get("positive", 0) / total * 100) if total > 0 else 0),
        "negative_percentage": round((sentiment_breakdown.get("negative", 0) / total * 100) if total > 0 else 0),
        "neutral_percentage": round((sentiment_breakdown.get("neutral", 0) / total * 100) if total > 0 else 0),
        "recent_alerts": [{"id": a.id, "message": a.message, "created_at": a.created_at} for a in recent_alerts]
    }

@app.get("/trends")
async def get_trends(db: Session = Depends(get_db)):
    """Get 7-day trend data"""
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=7)
    
    trends = []
    for i in range(7):
        day_start = start_date + timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        
        # Total count for the day
        total_count = db.query(Mention).filter(
            and_(Mention.created_at >= day_start, Mention.created_at < day_end)
        ).count()
        
        # Sentiment breakdown for the day
        sentiment_counts = db.query(
            Mention.sentiment,
            func.count(Mention.id).label('count')
        ).filter(
            and_(Mention.created_at >= day_start, Mention.created_at < day_end)
        ).group_by(Mention.sentiment).all()
        
        sentiment_dict = {s.sentiment: s.count for s in sentiment_counts}
        
        trends.append({
            "date": day_start.strftime("%Y-%m-%d"),
            "count": total_count,
            "positive": sentiment_dict.get("positive", 0),
            "negative": sentiment_dict.get("negative", 0),
            "neutral": sentiment_dict.get("neutral", 0)
        })
    
    return trends

# @app.post("/generate-mock")
# async def generate_mock_data(db: Session = Depends(get_db)):
#     """Generate mock data for development"""
#     mentions_data = mock_generator.generate_mentions("YourBrand", 50)
    
#     created_count = 0
#     for mention_data in mentions_data:
#         existing = db.query(Mention).filter(Mention.url == mention_data["url"]).first()
#         if existing:
#             continue
        
#         db_mention = Mention(**mention_data)
#         db.add(db_mention)
#         created_count += 1
    
#     db.commit()
#     return {
#         "success": True,
#         "message": f"Generated {created_count} new mentions"
#     }

# Topics endpoint
@app.get("/topics", response_model=List[TopicResponse])
async def get_trending_topics(limit: int = 20, db: Session = Depends(get_db)):
    """Get trending topics"""
    topics = db.query(Topic).order_by(desc(Topic.mention_count)).limit(limit).all()
    return topics

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)