from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any

class MentionBase(BaseModel):
    text: str = Field(..., max_length=1000)
    platform: str = Field(..., max_length=50)
    url: str = Field(..., max_length=500)
    sentiment: str = Field(..., max_length=20)
    sentiment_score: Optional[float] = Field(None, ge=-1.0, le=1.0)
    topics: Optional[str] = Field(None, max_length=200)
    created_at: datetime

class MentionCreate(BaseModel):
    text: str = Field(..., max_length=1000)
    platform: str = Field(..., max_length=50)
    url: str = Field(..., max_length=500)
    sentiment: Optional[str] = Field(None, max_length=20)
    sentiment_score: Optional[float] = Field(None, ge=-1.0, le=1.0)
    topics: Optional[str] = Field(None, max_length=200)
    created_at: Optional[datetime] = None

class MentionResponse(MentionBase):
    id: int
    inserted_at: datetime
    
    class Config:
        from_attributes = True

class AlertBase(BaseModel):
    type: str = Field(..., max_length=50)
    message: str = Field(..., max_length=500)
    severity: str = Field(..., max_length=20)
    mention_count: Optional[int] = None
    alert_metadata: Optional[Dict[str, Any]] = None

class AlertCreate(AlertBase):
    pass

class AlertResponse(AlertBase):
    id: int
    created_at: datetime
    resolved: bool = False
    
    class Config:
        from_attributes = True

class TopicResponse(BaseModel):
    id: int
    name: str
    mention_count: int
    last_mentioned: Optional[datetime]
    sentiment_avg: Optional[float]
    
    class Config:
        from_attributes = True

class MentionFilters(BaseModel):
    platform: Optional[str] = None
    sentiment: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    limit: int = Field(default=100, le=1000)
    offset: int = Field(default=0, ge=0)

class KeywordSearchCreate(BaseModel):
    keyword: str = Field(..., max_length=100)
    platform: str = Field(..., max_length=50)
    sentiment: str = Field(..., max_length=20)

class KeywordSearchResponse(BaseModel):
    id: int
    keyword: str
    platform: str
    sentiment: str
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

class SentimentAnalysis(BaseModel):
    text: str
    sentiment: str
    score: float