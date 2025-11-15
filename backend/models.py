from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, JSON, Index, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

Base = declarative_base()

class Mention(Base):
    __tablename__ = "mentions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    text = Column(String(1000), nullable=False)
    platform = Column(String(50), nullable=False, index=True)
    url = Column(String(500), unique=True, nullable=False, index=True)
    sentiment = Column(String(20), nullable=False, index=True)
    sentiment_score = Column(Float)
    topics = Column(String(200), nullable=True)
    keyword_search_id = Column(Integer, ForeignKey("keyword_search.id"), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    inserted_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    keyword_search = relationship("KeywordSearch", back_populates="mentions")

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    type = Column(String(50), nullable=False)
    message = Column(String(500), nullable=False)
    severity = Column(String(20), nullable=False)
    mention_count = Column(Integer)
    alert_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    resolved = Column(Boolean, default=False)

class KeywordSearch(Base):
    __tablename__ = "keyword_search"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    keyword = Column(String(100), nullable=False)
    platform = Column(String(50), nullable=False)
    sentiment = Column(String(20), nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    mentions = relationship("Mention", back_populates="keyword_search")

class Topic(Base):
    __tablename__ = "topics"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    mention_count = Column(Integer, default=0)
    last_mentioned = Column(DateTime)
    sentiment_avg = Column(Float)