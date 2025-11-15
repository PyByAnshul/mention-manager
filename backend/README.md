# Brand Monitoring API

A FastAPI backend for tracking brand mentions across social media and news sites with real-time sentiment analysis and spike detection.

## Features

- **Multi-Platform Monitoring**: Track mentions from Twitter, Reddit, and News sources
- **Sentiment Analysis**: Automatic sentiment scoring using TextBlob with keyword boosting
- **Spike Detection**: Real-time alerts for unusual activity patterns
- **REST API**: Complete API for frontend dashboard integration
- **Demo Data**: Generate realistic test data for presentations
- **Live Data Fetching**: Connect to real APIs (Reddit, News API, Twitter)

## Quick Start

### 1. Installation

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your API keys (optional for demo)
```

### 3. Run the Server

```bash
python main.py
```

The API will be available at `http://localhost:8000`

### 4. API Documentation

Visit `http://localhost:8000/docs` for interactive API documentation.

## API Endpoints

### Mentions
- `GET /mentions` - Get brand mentions with filtering
- `POST /mentions` - Create new mention
- `GET /mentions/stats` - Get dashboard statistics

### Sentiment Analysis
- `POST /analyze-sentiment` - Analyze text sentiment

### Alerts
- `GET /alerts` - Get spike alerts
- `POST /alerts/check` - Check for new spikes
- `PATCH /alerts/{id}/resolve` - Mark alert as resolved

### Data Management
- `POST /fetch-live-data` - Fetch from external APIs
- `POST /generate-demo-data` - Generate test data
- `GET /topics` - Get trending topics

## Configuration

### Database
Default: SQLite (`brand_monitoring.db`)
For production, use PostgreSQL:
```
DATABASE_URL=postgresql://user:pass@localhost/brand_monitoring
```

### API Keys (Optional)
- **Reddit**: Create app at https://www.reddit.com/prefs/apps
- **News API**: Get key at https://newsapi.org
- **Twitter**: Apply at https://developer.twitter.com

## Usage Examples

### Generate Demo Data
```bash
curl -X POST "http://localhost:8000/generate-demo-data?brand_name=YourBrand&count=100"
```

### Get Recent Mentions
```bash
curl "http://localhost:8000/mentions?limit=10&sentiment=negative"
```

### Check for Spikes
```bash
curl -X POST "http://localhost:8000/alerts/check"
```

### Analyze Sentiment
```bash
curl -X POST "http://localhost:8000/analyze-sentiment" \
  -H "Content-Type: application/json" \
  -d '"I love this product!"'
```

## Database Schema

### mentions
- `id`: Primary key
- `text`: Mention content (max 1000 chars)
- `platform`: Source (Twitter/Reddit/News)
- `url`: Unique source URL
- `sentiment`: positive/negative/neutral
- `sentiment_score`: -1.0 to +1.0
- `topics`: Comma-separated keywords
- `created_at`: When posted
- `inserted_at`: When scraped

### alerts
- `id`: Primary key
- `type`: spike/negative_surge/high_volume
- `message`: Human-readable description
- `severity`: info/warning/critical
- `mention_count`: Trigger count
- `metadata`: JSON context
- `created_at`: Alert timestamp
- `resolved`: Boolean flag

## Development

### Project Structure
```
backend/
├── main.py              # FastAPI app and routes
├── database.py          # Database connection
├── models.py            # SQLAlchemy ORM models
├── schemas.py           # Pydantic validation models
├── services/
│   ├── sentiment_analyzer.py  # TextBlob + keyword boosting
│   ├── spike_detector.py      # Alert generation logic
│   ├── data_sources.py        # External API clients
│   └── mock_data.py           # Demo data generator
├── requirements.txt     # Dependencies
├── .env.example        # Environment template
└── README.md           # This file
```

### Adding New Data Sources
1. Create new class in `services/data_sources.py`
2. Implement `fetch_mentions()` method
3. Add to `DataSourceManager.fetch_all_mentions()`

### Customizing Alerts
Modify thresholds in `services/spike_detector.py`:
- `spike_threshold`: Volume increase ratio (default: 2.0 = 200%)
- `negative_surge_threshold`: Negative sentiment ratio (default: 0.7 = 70%)
- `high_volume_threshold`: Mentions per hour (default: 100)

## Production Deployment

1. Use PostgreSQL database
2. Set up proper environment variables
3. Configure reverse proxy (nginx)
4. Set up SSL certificates
5. Use process manager (systemd/supervisor)
6. Configure logging and monitoring

## License

MIT License - see LICENSE file for details.