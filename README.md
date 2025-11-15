# Brand Monitoring System

## 🎯 What Problem Does This Solve?

Brands today face challenges in:
- **Missing important conversations** about their brand across multiple platforms
- **Reacting too late** to negative sentiment or PR crises
- **Manual monitoring** that's time-consuming and incomplete
- **Lack of insights** into customer sentiment trends

## 💡 How This System Helps

This application automatically:
1. **Monitors multiple platforms** (social media, news sites, forums)
2. **Analyzes sentiment** of each mention (positive, negative, neutral)
3. **Detects spikes** in mentions and alerts you immediately
4. **Provides insights** through interactive dashboards and trends
5. **Tracks keywords** you care about most

## 🔄 How It Works

### Data Collection
- **Automated scraping** from Reddit, Twitter, news sites
- **Keyword-based search** for your brand terms
- **Real-time processing** of new mentions

### Sentiment Analysis
- **AI-powered analysis** using VADER sentiment analyzer
- **Scoring system** from -1 (very negative) to +1 (very positive)
- **Automatic categorization** into positive, negative, neutral

### Alert System
- **Spike detection** when mentions increase suddenly
- **Sentiment alerts** for negative trend detection
- **Real-time notifications** for immediate response

### Dashboard & Insights
- **Visual trends** showing mention volume over time
- **Sentiment breakdown** with percentages
- **Platform analysis** to see where conversations happen
- **Historical data** for long-term trend analysis

## 🚀 Quick Start with Docker

### Prerequisites
- Docker installed on your system

### Run the Application
```bash
# Clone and navigate to project
cd assigment

# Build and run with Docker
docker build -t brand-monitoring .
docker run -p 3000:3000 -p 8000:8000 brand-monitoring
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🛠️ Development Setup

### System Requirements
- **Node.js**: 20.9.0 or higher
- **Python**: 3.11 or higher
- **Docker**: Latest version (for containerized deployment)
- **Memory**: 4GB+ recommended

### Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Architecture

### Backend (FastAPI + SQLAlchemy)
```
backend/
├── main.py              # API endpoints & startup
├── models.py            # Database models (Mention, Alert, etc.)
├── schemas.py           # Pydantic validation schemas
├── database.py          # Database connection & setup
└── services/
    ├── sentiment_analyzer.py  # VADER sentiment analysis
    ├── data_sources.py       # Reddit/RSS scraping
    ├── spike_detector.py     # Alert system logic
    └── scheduler.py          # Background task runner
```

### Frontend (Next.js + React)
```
frontend/
├── app/
│   ├── page.tsx           # Dashboard home
│   ├── mentions/page.tsx  # Mentions list
│   ├── keywords/page.tsx  # Keyword management
│   └── add-mention/page.tsx # Manual mention entry
├── components/
│   ├── metric-cards.tsx   # Dashboard KPI cards
│   ├── trends-chart.tsx   # Time series charts
│   ├── mentions-table.tsx # Data table with filters
│   └── alerts-banner.tsx  # Alert notifications
└── lib/
    ├── api.ts             # API client functions
    └── utils.ts           # Helper utilities
```

## ✨ Key Features

### 📊 **Real-time Monitoring**
- Track mentions across Reddit, Twitter, news sites
- Automatic data collection every few minutes
- Duplicate detection to avoid noise

### 🧠 **Smart Sentiment Analysis**
- AI-powered sentiment scoring
- Categorizes mentions as positive, negative, or neutral
- Confidence scores for each analysis

### 🚨 **Intelligent Alerts**
- Spike detection when mentions increase suddenly
- Negative sentiment trend alerts
- Customizable alert thresholds

### 📈 **Interactive Dashboard**
- Real-time metrics and KPIs
- 7-day trend visualization
- Platform breakdown charts
- Sentiment distribution graphs

### 🔍 **Advanced Search & Filtering**
- Filter by platform, sentiment, date range
- Search within mention text
- Sort by relevance or date

### ⚙️ **Keyword Management**
- Add/remove tracking keywords
- Platform-specific keyword monitoring
- Automatic mention fetching for new keywords

## 🌐 API Endpoints

### Mentions
- `GET /mentions` - Get paginated brand mentions with filters
- `POST /mentions` - Create new mention (auto-analyzes sentiment)
- `GET /mentions/search` - Advanced search with multiple filters

### Analytics
- `GET /stats` - Dashboard statistics (totals, percentages)
- `GET /trends` - 7-day trend data for charts
- `GET /mentions/stats` - Detailed mention statistics

### Keywords & Alerts
- `GET /keywords` - Get tracked keywords
- `POST /keywords` - Add new keyword (triggers background fetch)
- `DELETE /keywords/{id}` - Remove keyword
- `GET /alerts` - Get system alerts
- `POST /alerts/check` - Manually trigger spike detection

### Utilities
- `POST /analyze-sentiment` - Analyze sentiment of any text
- `GET /health` - System health check

## 🔒 Configuration

### Environment Variables
Create `.env` file in backend directory:
```bash
# Database
DATABASE_URL=sqlite:///./mentions.db

# Optional: External API keys (for enhanced data sources)
# REDDIT_CLIENT_ID=your_reddit_client_id
# REDDIT_CLIENT_SECRET=your_reddit_client_secret
# TWITTER_BEARER_TOKEN=your_twitter_bearer_token
```

### Default Settings
- **Database**: SQLite (no setup required)
- **Sentiment Analysis**: VADER (built-in, no API keys needed)
- **Data Sources**: Reddit (via snscrape), RSS feeds
- **Update Frequency**: Every 5 minutes
- **Alert Threshold**: 50% increase in mentions

## 📚 How to Use

1. **Start the application** using Docker or development setup
2. **Open the dashboard** at http://localhost:3000
3. **Add keywords** you want to track (your brand name, products, etc.)
4. **Wait for data collection** (first results appear within minutes)
5. **Monitor the dashboard** for real-time insights
6. **Set up alerts** to get notified of important changes

## 🔍 Troubleshooting

### Common Issues
- **No mentions appearing**: Check if keywords are too specific
- **Build fails**: Ensure Docker has enough memory (4GB+)
- **Slow performance**: Reduce keyword count or increase update intervals

### Logs
- Backend logs: Check Docker container logs
- Database: Located at `backend/mentions.db`
- Frontend: Browser developer console