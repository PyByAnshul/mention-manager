# Pagination API Documentation

## Overview
Added pagination support to both Keywords and Mentions endpoints to handle large datasets efficiently.

## Updated Endpoints

### 1. Get Keywords (Paginated)
**GET** `/api/keywords`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 20 | Number of results per page (max 100) |
| `offset` | number | 0 | Number of records to skip |

**Example:**
```bash
curl "http://localhost:3000/api/keywords?limit=20&offset=40"
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "keyword": "product quality",
      "platform": "all",
      "sentiment": "positive",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 40,
    "pages": 8
  }
}
```

### 2. Get Mentions (Paginated)
**GET** `/api/mentions`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `sentiment` | string | - | Filter by sentiment: `positive`, `negative`, or `neutral` |
| `limit` | number | 20 | Number of results per page (max 100) |
| `offset` | number | 0 | Number of records to skip |

**Example:**
```bash
curl "http://localhost:3000/api/mentions?sentiment=positive&limit=20&offset=0"
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "text": "Amazing new features released today!",
      "platform": "Reddit",
      "sentiment": "positive",
      "sentiment_score": 0.85,
      "url": "https://example.com/mention/1",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 500,
    "limit": 20,
    "offset": 0,
    "pages": 25
  }
}
```

## Pagination Object Structure

```typescript
interface Pagination {
  total: number;    // Total number of records
  limit: number;    // Records per page
  offset: number;   // Records skipped
  pages: number;    // Total number of pages
}
```

## Frontend Implementation

### Keywords Table Pagination
- Shows page numbers with Previous/Next buttons
- Displays "Showing X to Y of Z results"
- Automatically reloads data when page changes
- Maintains current page state

### Mentions Table Pagination
- Same pagination UI as keywords table
- Supports filtering with pagination
- Keyword search works with pagination

## Usage Examples

### JavaScript/TypeScript Client

```typescript
import { fetchKeywords, fetchMentions } from '@/lib/api';

// Get first page of keywords
const keywordsPage1 = await fetchKeywords({ limit: 20, offset: 0 });
console.log(`Total keywords: ${keywordsPage1.pagination.total}`);
console.log(`Current page: ${keywordsPage1.pagination.offset / keywordsPage1.pagination.limit + 1}`);

// Get second page of mentions
const mentionsPage2 = await fetchMentions({ limit: 20, offset: 20 });
console.log(`Page 2 mentions:`, mentionsPage2.data);

// Get filtered mentions with pagination
const filteredMentions = await fetchMentions({ 
  sentiment: 'positive', 
  limit: 10, 
  offset: 0 
});
```

### Page Navigation Logic

```typescript
// Calculate current page (0-based)
const currentPage = Math.floor(pagination.offset / pagination.limit);

// Navigate to specific page
const goToPage = (pageNumber: number) => {
  const offset = pageNumber * pagination.limit;
  loadData({ limit: pagination.limit, offset });
};

// Navigate to next page
const nextPage = () => {
  if (currentPage < pagination.pages - 1) {
    goToPage(currentPage + 1);
  }
};

// Navigate to previous page
const prevPage = () => {
  if (currentPage > 0) {
    goToPage(currentPage - 1);
  }
};
```

## Backend Requirements

The backend API should implement:

1. **Limit Validation**: Maximum limit of 100 records per request
2. **Offset Validation**: Ensure offset doesn't exceed total records
3. **Total Count**: Calculate total records for pagination metadata
4. **Consistent Ordering**: Use consistent sorting (e.g., by created_at DESC) for reliable pagination

### Example Backend Response Structure

```json
{
  "data": [...],
  "pagination": {
    "total": 1250,
    "limit": 20,
    "offset": 40,
    "pages": 63
  }
}
```

## Error Handling

- Invalid limit (> 100): Return 400 Bad Request
- Invalid offset (< 0): Return 400 Bad Request
- Offset exceeds total: Return empty data array with correct pagination metadata

## Performance Considerations

- Use database LIMIT and OFFSET for efficient querying
- Consider implementing cursor-based pagination for very large datasets
- Cache total count when possible to avoid expensive COUNT queries
- Index columns used for filtering and sorting