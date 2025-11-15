// Mock data generator and storage
import type { Mention, TrendData, Alert } from './api';

const MOCK_PLATFORMS = ['Reddit', 'News'] as const;
const MOCK_SENTIMENTS = ['positive', 'negative', 'neutral'] as const;

const POSITIVE_SAMPLES = [
  "Absolutely loving the new features, amazing work!",
  "Best product in the market, highly recommend!",
  "Finally found exactly what I was looking for.",
  "Outstanding customer service and quality.",
  "This company truly cares about their users.",
];

const NEGATIVE_SAMPLES = [
  "Disappointed with the recent changes.",
  "Not worth the price anymore.",
  "Customer support was unhelpful.",
  "Quality has declined significantly.",
  "Better alternatives available.",
];

const NEUTRAL_SAMPLES = [
  "The company announced new features today.",
  "Market share remains stable this quarter.",
  "Planning to update their website soon.",
  "New partnerships coming in Q1.",
  "Expanding to new regions.",
];

function getRandomSample(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateMention(id: number): Mention {
  const sentiment = MOCK_SENTIMENTS[Math.floor(Math.random() * MOCK_SENTIMENTS.length)];
  const samples = sentiment === 'positive' ? POSITIVE_SAMPLES : sentiment === 'negative' ? NEGATIVE_SAMPLES : NEUTRAL_SAMPLES;
  
  const now = new Date();
  const hoursAgo = Math.floor(Math.random() * 168); // 7 days
  const created = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);

  return {
    id,
    text: getRandomSample(samples),
    platform: MOCK_PLATFORMS[Math.floor(Math.random() * MOCK_PLATFORMS.length)],
    url: `https://example.com/mention/${id}`,
    sentiment: sentiment,
    sentiment_score: Math.random() * 2 - 1, // -1 to 1
    created_at: created.toISOString(),
  };
}

function generateTrends(): TrendData[] {
  const trends: TrendData[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const count = Math.floor(Math.random() * 300) + 100;
    const positive = Math.floor(count * 0.58);
    const negative = Math.floor(count * 0.23);
    const neutral = count - positive - negative;

    trends.push({
      date: dateStr,
      count,
      positive,
      negative,
      neutral,
    });
  }

  return trends;
}

function generateAlerts(): Alert[] {
  return [
    {
      id: 1,
      message: "230% spike in mentions detected in the last hour",
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      message: "Negative sentiment increased by 45% compared to yesterday",
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
  ];
}

export interface MockDataState {
  mentions: Mention[];
  trends: TrendData[];
  alerts: Alert[];
}

let mockDataState: MockDataState = {
  mentions: Array.from({ length: 50 }, (_, i) => generateMention(i)),
  trends: generateTrends(),
  alerts: generateAlerts(),
};

export const mockData = mockDataState;

export function generateNewMockData(): MockDataState {
  mockDataState = {
    mentions: Array.from({ length: 50 }, (_, i) => generateMention(i)),
    trends: generateTrends(),
    alerts: generateAlerts(),
  };
  return mockDataState;
}
