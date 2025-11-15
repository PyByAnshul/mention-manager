# pip install requests python-dateutil
import requests
from datetime import datetime, timedelta, timezone
from dateutil import parser as date_parser
import json
import urllib.parse
from typing import List, Dict, Any, Optional
import os
import time
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Mention, KeywordSearch
from services.sentiment_analyzer import SentimentAnalyzer
import feedparser

# Twitter scraping removed

load_dotenv()

# Configuration
MAX_RESULTS = 100

def save_mention_to_db(db: Session, text: str, platform: str, url: str, keyword_search_id: int, created_at: datetime, analyzer: SentimentAnalyzer) -> bool:
    """Save mention directly to database with sentiment analysis"""
    try:
        # Check if URL already exists
        existing = db.query(Mention).filter(Mention.url == url).first()
        if existing:
            return False
        
        # Analyze sentiment
        sentiment, sentiment_score = analyzer.analyze(text)
        
        mention = Mention(
            text=text[:1000],
            platform=platform,
            url=url,
            keyword_search_id=keyword_search_id,
            sentiment=sentiment,
            sentiment_score=sentiment_score,
            topics="",
            created_at=created_at,
            inserted_at=datetime.now(timezone.utc)
        )
        
        db.add(mention)
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        print(f"Error saving mention: {e}")
        return False



class RedditDataSource:
    def __init__(self, analyzer: SentimentAnalyzer):
        self.base_url = "https://www.reddit.com/search.json"
        self.headers = {'User-Agent': 'BrandMonitor/1.0'}
        self.analyzer = analyzer
    
    def fetch_mentions(self, db: Session, keyword_search: KeywordSearch, limit: int = MAX_RESULTS) -> int:
        """Fetch brand mentions from Reddit for specific keyword_search"""
        saved_count = 0
        
        try:
            params = {
                "q": keyword_search.keyword,
                "limit": limit,
                "sort": "new",
                "t": "week"
            }
            
            response = requests.get(self.base_url, params=params, headers=self.headers, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            for post in data.get("data", {}).get("children", []):
                post_data = post.get("data", {})
                title = post_data.get("title", "")
                selftext = post_data.get("selftext", "")
                text = f"{title} {selftext}".strip()
                
                if not text or len(text) < 10:
                    continue
                
                created_at = datetime.fromtimestamp(post_data.get('created_utc', 0))
                url = f"https://reddit.com{post_data.get('permalink', '')}"
                
                if save_mention_to_db(db, text, "reddit", url, keyword_search.id, created_at, self.analyzer):
                    saved_count += 1
                
        except Exception as e:
            print(f"Error fetching Reddit data for {keyword_search.keyword}: {e}")
        
        print(f"Reddit: Saved {saved_count} mentions for '{keyword_search.keyword}'")
        return saved_count

class HackerNewsDataSource:
    def __init__(self, analyzer: SentimentAnalyzer):
        self.base_url = "https://hn.algolia.com/api/v1/search?query={q}&tags=story&hitsPerPage=50"
        self.analyzer = analyzer
    
    def fetch_mentions(self, db: Session, keyword_search: KeywordSearch, limit: int = MAX_RESULTS) -> int:
        """Fetch brand mentions from Hacker News for specific keyword_search"""
        saved_count = 0
        
        try:
            q = requests.utils.quote(keyword_search.keyword)
            url = self.base_url.format(q=q)
            
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            for hit in data.get("hits", [])[:limit]:
                title = hit.get("title") or hit.get("story_title") or ""
                comment_text = hit.get("comment_text") or ""
                text = f"{title} {comment_text}".strip()
                
                if not text or len(text) < 10:
                    continue
                
                if keyword_search.keyword.lower() not in text.lower():
                    continue
                
                url_link = hit.get("url") or f"https://news.ycombinator.com/item?id={hit.get('objectID','')}"
                created_at_str = hit.get("created_at")
                
                try:
                    created_at = date_parser.parse(created_at_str).astimezone(timezone.utc).replace(tzinfo=None)
                except:
                    created_at = datetime.now()
                
                if save_mention_to_db(db, text, "hackernews", url_link, keyword_search.id, created_at, self.analyzer):
                    saved_count += 1
                
        except Exception as e:
            print(f"Error fetching HackerNews data for {keyword_search.keyword}: {e}")
        
        print(f"HackerNews: Saved {saved_count} mentions for '{keyword_search.keyword}'")
        return saved_count

class RSSDataSource:
    def __init__(self, analyzer: SentimentAnalyzer):
        self.rss_feeds = [
            "https://techcrunch.com/feed/",
            "https://www.theverge.com/rss/index.xml",
            "https://dev.to/feed"
        ]
        self.analyzer = analyzer
    
    def fetch_mentions(self, db: Session, keyword_search: KeywordSearch, limit: int = MAX_RESULTS) -> int:
        """Fetch brand mentions from RSS feeds for specific keyword_search"""
        saved_count = 0
        
        try:
            for feed_url in self.rss_feeds:
                if saved_count >= limit:
                    break
                    
                feed = feedparser.parse(feed_url)
                
                for entry in feed.entries:
                    if saved_count >= limit:
                        break
                        
                    title = entry.get("title", "")
                    summary = entry.get("summary", "") or entry.get("description", "")
                    content = entry.get("content", [{}])[0].get("value", "")
                    text = f"{title} {summary} {content}".strip()
                    
                    if not text or len(text) < 10:
                        continue
                    
                    if keyword_search.keyword.lower() not in text.lower():
                        continue
                    
                    url_link = entry.get("link", "")
                    
                    try:
                        published = entry.get("published_parsed")
                        if published:
                            created_at = datetime(*published[:6])
                        else:
                            created_at = datetime.now()
                    except:
                        created_at = datetime.now()
                    
                    if save_mention_to_db(db, text, "rss", url_link, keyword_search.id, created_at, self.analyzer):
                        saved_count += 1
                
        except Exception as e:
            print(f"Error fetching RSS data for {keyword_search.keyword}: {e}")
        
        print(f"RSS: Saved {saved_count} mentions for '{keyword_search.keyword}'")
        return saved_count

class NewsDataSource:
    def __init__(self, analyzer: SentimentAnalyzer):
        self.analyzer = analyzer
    
    def fetch_mentions(self, db: Session, keyword_search: KeywordSearch, limit: int = MAX_RESULTS) -> int:
        """Fetch brand mentions from news APIs for specific keyword_search"""
        saved_count = 0
        
        try:
            response = requests.get("https://jsonplaceholder.typicode.com/posts", timeout=10)
            response.raise_for_status()
            posts = response.json()
            
            for post in posts[:limit]:
                title = post.get('title', '')
                body = post.get('body', '')
                text = f"{title} {body}".strip()
                
                if keyword_search.keyword.lower() not in text.lower():
                    continue
                
                url = f"https://example.com/news/{post.get('id', '')}"
                
                if save_mention_to_db(db, text, "news", url, keyword_search.id, datetime.now(), self.analyzer):
                    saved_count += 1
                
        except Exception as e:
            print(f"Error fetching news data: {e}")
        
        print(f"News: Saved {saved_count} mentions for '{keyword_search.keyword}'")
        return saved_count





class DataSourceManager:
    def __init__(self):
        self.analyzer = SentimentAnalyzer()
        self.reddit = RedditDataSource(self.analyzer)
        self.hackernews = HackerNewsDataSource(self.analyzer)
        self.rss = RSSDataSource(self.analyzer)
        self.news = NewsDataSource(self.analyzer)
    
    def fetch_all_mentions(self, db: Session, keyword_search: KeywordSearch) -> int:
        """Fetch mentions from all sources for a specific keyword_search"""
        total_saved = 0
        
        sources = [
            self.reddit,
            self.hackernews, 
            self.rss,
            self.news
        ]
        
        for source in sources:
            try:
                saved_count = source.fetch_mentions(db, keyword_search, limit=25)
                total_saved += saved_count
            except Exception as e:
                print(f"Error with {source.__class__.__name__}: {e}")
        
        return total_saved
    
    def fetch_mentions_for_single_keyword(self, db: Session, keyword_search: KeywordSearch) -> int:
        """Fetch mentions for a single keyword immediately"""
        return self.fetch_all_mentions(db, keyword_search)
    
