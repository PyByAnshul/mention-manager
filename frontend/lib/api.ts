// API Client Layer - Centralized API communication
import { generateNewMockData, mockData } from './mock-data';

export interface Mention {
  id: number;
  text: string;
  platform: 'Reddit' | 'News';
  url: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentiment_score: number;
  created_at: string;
}

export interface Stats {
  total_mentions: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  positive_percentage: number;
  negative_percentage: number;
  neutral_percentage: number;
  recent_alerts: Alert[];
}

export interface TrendData {
  date: string;
  count: number;
  positive: number;
  negative: number;
  neutral: number;
}

export interface Alert {
  id: number;
  message: string;
  created_at: string;
}

// New interfaces for keywords
export interface Keyword {
  id: number;
  keyword: string;
  platform: string;
  sentiment: string;
  is_active: boolean;
  created_at: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

// Helper to check if API is available
export async function isAPIAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { 
      method: 'GET',
      cache: 'no-store'
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Fetch overall statistics from backend API
export async function fetchStats(): Promise<Stats> {
  const res = await fetch(`${API_BASE}/stats`, {
    method: 'GET',
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return await res.json();
}

// Fetch mentions with filters from backend API with pagination
export async function fetchMentions(params: {
  sentiment?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<{ data: Mention[]; pagination: { total: number; limit: number; offset: number; pages: number } }> {
  const queryParams = new URLSearchParams();
  if (params.sentiment) queryParams.append('sentiment', params.sentiment);
  queryParams.append('limit', (params.limit || 20).toString());
  queryParams.append('offset', (params.offset || 0).toString());

  const res = await fetch(`${API_BASE}/mentions?${queryParams}`, {
    method: 'GET',
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return await res.json();
}

// Fetch trend data from backend API
export async function fetchTrends(): Promise<TrendData[]> {
  const res = await fetch(`${API_BASE}/trends`, {
    method: 'GET',
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return await res.json();
}

// Generate new mock data via backend API
export async function generateMockData(): Promise<{ success: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/generate-mock`, {
      method: 'POST',
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error('[v0] generateMockData error:', error);
    return { success: false };
  }
}

// Fetch keywords from backend API with pagination
export async function fetchKeywords(params: {
  limit?: number;
  offset?: number;
} = {}): Promise<{ data: Keyword[]; pagination: { total: number; limit: number; offset: number; pages: number } }> {
  const queryParams = new URLSearchParams();
  queryParams.append('limit', (params.limit || 20).toString());
  queryParams.append('offset', (params.offset || 0).toString());

  const res = await fetch(`${API_BASE}/keywords?${queryParams}`, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return await res.json();
}

// Add a new keyword via backend API
export async function addKeyword(params: {
  keyword: string;
  platform: string;
  sentiment: string;
}): Promise<Keyword | null> {
  try {
    const res = await fetch(`${API_BASE}/keywords`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error('[v0] addKeyword error:', error);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error('[v0] addKeyword error:', error);
    return null;
  }
}

// Delete a keyword via backend API
export async function deleteKeyword(keywordId: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/keywords/${keywordId}`, {
      method: 'DELETE',
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('[v0] deleteKeyword error:', res.status);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[v0] deleteKeyword error:', error);
    return false;
  }
}

// Add a new mention via backend API
export async function addMention(params: {
  text: string;
  platform: 'Reddit' | 'News';
  sentiment: 'positive' | 'negative' | 'neutral';
  score?: number;
  url?: string;
}): Promise<Mention | null> {
  try {
    const res = await fetch(`${API_BASE}/mentions/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error('[v0] addMention error:', error);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error('[v0] addMention error:', error);
    return null;
  }
}

// Search mentions with various filters via backend API
export async function searchMentions(params: {
  q?: string;
  sentiment?: string;
  platform?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<{ data: Mention[]; pagination: any } | null> {
  try {
    const queryParams = new URLSearchParams();
    if (params.q) queryParams.append('q', params.q);
    if (params.sentiment) queryParams.append('sentiment', params.sentiment);
    if (params.platform) queryParams.append('platform', params.platform);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    queryParams.append('limit', (params.limit || 50).toString());
    queryParams.append('offset', (params.offset || 0).toString());
    queryParams.append('sortBy', params.sortBy || 'created_at');
    queryParams.append('sortOrder', params.sortOrder || 'desc');

    const res = await fetch(`${API_BASE}/mentions/search?${queryParams}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('[v0] searchMentions error:', res.status);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error('[v0] searchMentions error:', error);
    return null;
  }
}
