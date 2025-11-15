# Brand Monitor - API Documentation

A real-time brand sentiment monitoring dashboard with comprehensive API support for managing social media mentions, tracking trends, and analyzing sentiment distribution.

## Features

- Real-time sentiment analysis across multiple platforms (Reddit, News)
- Interactive trend visualization with navigation to detailed mentions
- Comprehensive search and filtering capabilities
- CSV export functionality for selected mentions
- RESTful API for programmatic access
- Mock data generation for development and testing

---

## API Endpoints

### Base URL
\`\`\`
http://localhost:3000/api
\`\`\`

### Authentication
Currently, no authentication is required for demo mode.

---

## Endpoints Reference

### 1. Health Check
**GET** `/health`

Check if the API is available.

**Response:**
\`\`\`json
{
  "status": "ok"
}
\`\`\`

---

### 2. Get Mentions
**GET** `/mentions`

Fetch mentions with optional filtering and pagination.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `sentiment` | string | - | Filter by sentiment: `positive`, `negative`, or `neutral` |
| `platform` | string | - | Filter by platform: `Reddit` or `News` |
| `limit` | number | 20 | Number of results per page |
| `offset` | number | 0 | Pagination offset |

**Example:**
\`\`\`bash
curl "http://localhost:3000/api/mentions?sentiment=positive&platform=Reddit&limit=10"
\`\`\`

**Response:**
\`\`\`json
[
  {
    "id": 1,
    "text": "Amazing new features released today!",
    "platform": "Reddit",
    "sentiment": "positive",
    "score": 0.85,
    "url": "https://example.com/mention/1",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
\`\`\`

---

### 3. Search Mentions
**GET** `/mentions/search`

Advanced search with multiple filter options, sorting, and date range support.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` | string | - | Text search query |
| `sentiment` | string | - | Filter by sentiment |
| `platform` | string | - | Filter by platform |
| `startDate` | ISO 8601 | - | Filter mentions from this date |
| `endDate` | ISO 8601 | - | Filter mentions until this date |
| `sortBy` | string | `created_at` | Sort field: `created_at`, `sentiment`, `platform`, or `score` |
| `sortOrder` | string | `desc` | Sort order: `asc` or `desc` |
| `limit` | number | 50 | Number of results per page |
| `offset` | number | 0 | Pagination offset |

**Example:**
\`\`\`bash
curl "http://localhost:3000/api/mentions/search?q=product&sentiment=negative&sortBy=score&sortOrder=desc&limit=20"
\`\`\`

**Response:**
\`\`\`json
{
  "data": [
    {
      "id": 2,
      "text": "Product quality has declined",
      "platform": "Reddit",
      "sentiment": "negative",
      "score": -0.72,
      "url": "https://example.com/mention/2",
      "created_at": "2024-01-14T15:20:00Z"
    }
  ],
  "pagination": {
    "total": 42,
    "limit": 20,
    "offset": 0,
    "pages": 3
  }
}
\`\`\`

---

### 4. Add Mention
**POST** `/mentions/add`

Add a new mention to the system.

**Request Body:**
\`\`\`json
{
  "text": "Love this product!",
  "platform": "Reddit",
  "sentiment": "positive",
  "score": 0.9,
  "url": "https://reddit.com/r/example/comments/123456"
}
\`\`\`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | string | Yes | Mention text content |
| `platform` | string | Yes | One of: `Reddit` or `News` |
| `sentiment` | string | Yes | One of: `positive`, `negative`, or `neutral` |
| `score` | number | No | Sentiment score (-1 to 1), randomly generated if omitted |
| `url` | string | No | Original mention URL |

**Example:**
\`\`\`bash
curl -X POST "http://localhost:3000/api/mentions/add" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Excellent customer service!",
    "platform": "Reddit",
    "sentiment": "positive"
  }'
\`\`\`

**Response (201 Created):**
\`\`\`json
{
  "id": 51,
  "text": "Excellent customer service!",
  "platform": "Reddit",
  "sentiment": "positive",
  "score": 0.34,
  "url": "https://example.com/mention/1705323000000",
  "created_at": "2024-01-15T11:30:00.000Z"
}
\`\`\`

**Error Response (400 Bad Request):**
\`\`\`json
{
  "error": "Invalid platform. Must be: Reddit or News"
}
\`\`\`

---

### 5. Get Statistics
**GET** `/stats`

Retrieve overall statistics and sentiment breakdown.

**Response:**
\`\`\`json
{
  "total_mentions": 150,
  "positive_count": 87,
  "negative_count": 34,
  "neutral_count": 29,
  "positive_percentage": 58,
  "negative_percentage": 23,
  "neutral_percentage": 19,
  "recent_alerts": [
    {
      "id": 1,
      "message": "230% spike in mentions detected",
      "created_at": "2024-01-15T10:15:00Z"
    }
  ]
}
\`\`\`

---

### 6. Get Trends
**GET** `/trends`

Get 7-day trend data for mention volume and sentiment distribution.

**Response:**
\`\`\`json
[
  {
    "date": "2024-01-08",
    "count": 142,
    "positive": 82,
    "negative": 35,
    "neutral": 25
  },
  {
    "date": "2024-01-09",
    "count": 156,
    "positive": 91,
    "negative": 38,
    "neutral": 27
  }
]
\`\`\`

---

### 7. Generate Mock Data
**POST** `/generate-mock`

Generate fresh mock data for development and testing.

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Generated 50 new mentions"
}
\`\`\`

---

## Data Models

### Mention
\`\`\`typescript
{
  id: number;              // Unique identifier
  text: string;           // Mention content
  platform: 'Reddit' | 'News';
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;          // -1 to 1 sentiment score
  url: string;            // Original source URL
  created_at: string;     // ISO 8601 timestamp
}
\`\`\`

### Stats
\`\`\`typescript
{
  total_mentions: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  positive_percentage: number;
  negative_percentage: number;
  neutral_percentage: number;
  recent_alerts: Alert[];
}
\`\`\`

### Alert
\`\`\`typescript
{
  id: number;
  message: string;
  created_at: string;     // ISO 8601 timestamp
}
\`\`\`

---

## Frontend Integration

### Navigation from Charts to Mentions Table

The dashboard includes interactive charts that navigate to the mentions table with pre-applied filters:

**Trend Chart Navigation:**
- Click any bar in the trend chart to filter mentions by that date
- URL: `/mentions?filterDate=YYYY-MM-DD`

**Sentiment Chart Navigation:**
- Click any sentiment row to filter mentions by that sentiment
- URL: `/mentions?sentiment=positive|negative|neutral`

---

## Usage Examples

### JavaScript/TypeScript Client

\`\`\`typescript
import { searchMentions, addMention, fetchStats } from '@/lib/api';

// Search mentions
const results = await searchMentions({
  q: 'product quality',
  sentiment: 'negative',
  limit: 20,
  sortBy: 'score',
  sortOrder: 'desc'
});

// Add new mention
const newMention = await addMention({
  text: 'Great experience with the service',
  platform: 'Reddit',
  sentiment: 'positive',
  score: 0.95
});

// Get statistics
const stats = await fetchStats();
console.log(`Positive: ${stats.positive_percentage}%`);
\`\`\`

### cURL Examples

**Search for negative mentions about pricing:**
\`\`\`bash
curl "http://localhost:3000/api/mentions/search?q=pricing&sentiment=negative"
\`\`\`

**Add a mention:**
\`\`\`bash
curl -X POST "http://localhost:3000/api/mentions/add" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Best purchase ever!",
    "platform": "Reddit",
    "sentiment": "positive"
  }'
\`\`\`

**Get stats:**
\`\`\`bash
curl "http://localhost:3000/api/stats"
\`\`\`

---

## Features & Capabilities

### Filtering & Sorting
- Full-text search across mention content
- Filter by sentiment (positive, negative, neutral)
- Filter by platform (Reddit, News)
- Date range filtering (startDate, endDate)
- Multiple sort options (created_at, sentiment, platform, score)
- Ascending/descending sort order

### Data Export
- Export selected rows as CSV
- Export all filtered results as CSV
- Filename includes current date: `mentions-YYYY-MM-DD.csv`

### Real-time Updates
- Dashboard auto-refreshes statistics every 30 seconds
- Charts update dynamically when data changes
- Sentiment percentages update in real-time

### Pagination
- Default 20 items per page
- Customizable limit and offset
- Total count and page count in response

---

## Error Handling

All endpoints return appropriate HTTP status codes:

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created (for POST requests) |
| 400 | Bad Request (invalid parameters) |
| 404 | Not Found |
| 500 | Internal Server Error |

**Error Response Format:**
\`\`\`json
{
  "error": "Description of what went wrong"
}
\`\`\`

---

## Development

### Mock Data
The API uses mock data stored in `/lib/mock-data.ts` for development.

**To generate new mock data:**
\`\`\`bash
POST /api/generate-mock
\`\`\`

### Environment Variables
- `NEXT_PUBLIC_API_URL` - API base URL (default: `/api`)

---

## Support

For issues or questions about the API, refer to the codebase documentation or check the implementation in:
- `/app/api/*` - API route handlers
- `/lib/api.ts` - Client API functions
- `/lib/mock-data.ts` - Mock data generator

---

## Version
v1.0.0 - Brand Monitor Sentiment Analysis API
