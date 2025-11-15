from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from typing import List, Dict, Any
from models import Mention, Alert

class SpikeDetector:
    def __init__(self, db: Session):
        self.db = db
        self.spike_threshold = 2.0  # 200% increase
        self.negative_surge_threshold = 0.7  # 70% negative mentions
        self.high_volume_threshold = 100  # mentions per hour
    
    def detect_spikes(self) -> List[Dict[str, Any]]:
        """Detect various types of spikes and return alert data"""
        alerts = []
        
        # Check for mention volume spikes
        volume_alert = self._check_volume_spike()
        if volume_alert:
            alerts.append(volume_alert)
        
        # Check for negative sentiment surges
        negative_alert = self._check_negative_surge()
        if negative_alert:
            alerts.append(negative_alert)
        
        # Check for high volume periods
        high_volume_alert = self._check_high_volume()
        if high_volume_alert:
            alerts.append(high_volume_alert)
        
        return alerts
    
    def _check_volume_spike(self) -> Dict[str, Any]:
        """Check for unusual spikes in mention volume"""
        now = datetime.utcnow()
        current_hour = now.replace(minute=0, second=0, microsecond=0)
        previous_hour = current_hour - timedelta(hours=1)
        baseline_start = current_hour - timedelta(hours=25)  # 24h + 1h for comparison
        baseline_end = current_hour - timedelta(hours=1)
        
        # Get current hour count
        current_count = self.db.query(Mention).filter(
            and_(
                Mention.created_at >= current_hour,
                Mention.created_at < current_hour + timedelta(hours=1)
            )
        ).count()
        
        # Get baseline average (last 24 hours)
        baseline_counts = []
        for i in range(24):
            hour_start = baseline_start + timedelta(hours=i)
            hour_end = hour_start + timedelta(hours=1)
            count = self.db.query(Mention).filter(
                and_(
                    Mention.created_at >= hour_start,
                    Mention.created_at < hour_end
                )
            ).count()
            baseline_counts.append(count)
        
        if not baseline_counts:
            return None
        
        baseline_avg = sum(baseline_counts) / len(baseline_counts)
        
        if baseline_avg > 0 and current_count / baseline_avg >= self.spike_threshold:
            spike_percentage = int((current_count / baseline_avg - 1) * 100)
            return {
                "type": "spike",
                "message": f"{spike_percentage}% spike in mentions detected ({current_count} vs {baseline_avg:.1f} avg)",
                "severity": "critical" if spike_percentage > 300 else "warning",
                "mention_count": current_count,
                "alert_metadata": {
                    "previous_avg": baseline_avg,
                    "current_count": current_count,
                    "spike_percentage": spike_percentage
                }
            }
        
        return None
    
    def _check_negative_surge(self) -> Dict[str, Any]:
        """Check for surge in negative sentiment"""
        now = datetime.utcnow()
        last_hour = now - timedelta(hours=1)
        
        # Get mentions from last hour
        recent_mentions = self.db.query(Mention).filter(
            Mention.created_at >= last_hour
        ).all()
        
        if len(recent_mentions) < 10:  # Need minimum sample size
            return None
        
        negative_count = sum(1 for m in recent_mentions if m.sentiment == "negative")
        negative_ratio = negative_count / len(recent_mentions)
        
        if negative_ratio >= self.negative_surge_threshold:
            return {
                "type": "negative_surge",
                "message": f"High negative sentiment detected: {negative_ratio:.0%} of recent mentions",
                "severity": "critical" if negative_ratio > 0.8 else "warning",
                "mention_count": len(recent_mentions),
                "alert_metadata": {
                    "negative_count": negative_count,
                    "total_count": len(recent_mentions),
                    "negative_ratio": negative_ratio
                }
            }
        
        return None
    
    def _check_high_volume(self) -> Dict[str, Any]:
        """Check for high volume periods"""
        now = datetime.utcnow()
        last_hour = now - timedelta(hours=1)
        
        count = self.db.query(Mention).filter(
            Mention.created_at >= last_hour
        ).count()
        
        if count >= self.high_volume_threshold:
            return {
                "type": "high_volume",
                "message": f"High mention volume: {count} mentions in the last hour",
                "severity": "info",
                "mention_count": count,
                "alert_metadata": {
                    "hourly_count": count,
                    "threshold": self.high_volume_threshold
                }
            }
        
        return None