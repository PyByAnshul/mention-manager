from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime
from database import SessionLocal
from models import KeywordSearch, Alert
from services.data_sources import DataSourceManager
from services.spike_detector import SpikeDetector
from sqlalchemy import and_
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

class BackgroundTaskRunner:
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.data_manager = DataSourceManager()
    
    def fetch_all_keywords_mentions(self):
        """Background task to fetch mentions for all keywords with sentiment analysis and spike detection"""
        try:
            db = SessionLocal()
            
            # Get all active keyword searches
            keyword_searches = db.query(KeywordSearch).filter(KeywordSearch.is_active == True).all()
            
            if not keyword_searches:
                logger.info("No active keywords found")
                return
            
            logger.info(f"Starting fetch for {len(keyword_searches)} keywords")
            
            total_mentions = 0
            for keyword_search in keyword_searches:
                mentions_count = self.data_manager.fetch_all_mentions(db, keyword_search)
                total_mentions += mentions_count
                logger.info(f"Fetched {mentions_count} mentions for '{keyword_search.keyword}'")
            
            # Run spike detection after fetching all mentions
            if total_mentions > 0:
                self._check_for_spikes(db)
            
            logger.info(f"Background task completed. Total mentions: {total_mentions}")
            
        except Exception as e:
            logger.error(f"Error in background task: {e}")
        finally:
            db.close()
    
    def _check_for_spikes(self, db):
        """Check for spikes and create alerts"""
        try:
            spike_detector = SpikeDetector(db)
            alert_data_list = spike_detector.detect_spikes()
            
            created_alerts = 0
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
                    created_alerts += 1
            
            if created_alerts > 0:
                db.commit()
                logger.info(f"Created {created_alerts} new alerts")
            
        except Exception as e:
            logger.error(f"Error in spike detection: {e}")
    
    def start(self):
        """Start the scheduler"""
        # Run immediately on startup
        logger.info("Running initial fetch on startup...")
        self.fetch_all_keywords_mentions()
        
        # Add job to run every hour
        self.scheduler.add_job(
            func=self.fetch_all_keywords_mentions,
            trigger=IntervalTrigger(hours=1),
            id='fetch_keywords_mentions',
            name='Fetch mentions with sentiment analysis and spike detection',
            replace_existing=True
        )
        
        self.scheduler.start()
        logger.info("Background scheduler started - runs immediately then every hour")
    
    def stop(self):
        """Stop the scheduler"""
        self.scheduler.shutdown()
        logger.info("Background scheduler stopped")

# Global instance
task_runner = BackgroundTaskRunner()