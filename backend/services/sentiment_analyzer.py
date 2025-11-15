from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import re
from typing import Tuple

class SentimentAnalyzer:
    def __init__(self):
        self.vader = SentimentIntensityAnalyzer()
    
    def analyze(self, text: str) -> Tuple[str, float]:
        """
        Analyze sentiment using VADER + TextBlob ensemble
        Returns: (sentiment_label, sentiment_score)
        """
        cleaned_text = self._clean_text(text)
        
        # VADER analysis (better for social media)
        vader_scores = self.vader.polarity_scores(cleaned_text)
        vader_compound = vader_scores['compound']
        
        # TextBlob analysis
        blob = TextBlob(cleaned_text)
        textblob_polarity = blob.sentiment.polarity
        
        # Ensemble: weighted average (VADER 70%, TextBlob 30%)
        final_score = (vader_compound * 0.7) + (textblob_polarity * 0.3)
        final_score = max(-1.0, min(1.0, final_score))
        
        # Convert to label
        if final_score >= 0.05:
            sentiment = "positive"
        elif final_score <= -0.05:
            sentiment = "negative"
        else:
            sentiment = "neutral"
        
        return sentiment, round(final_score, 3)
    
    def analyze_sentiment(self, text: str) -> dict:
        """Backward compatibility method"""
        sentiment, score = self.analyze(text)
        return {"sentiment": sentiment, "score": score}
    
    def _clean_text(self, text: str) -> str:
        """Remove URLs, mentions, and extra whitespace"""
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        text = re.sub(r'@\w+|#\w+', '', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text