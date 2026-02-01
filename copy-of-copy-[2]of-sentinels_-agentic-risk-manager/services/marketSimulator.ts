import { Position, MarketEvent } from '../types';
import { MOCK_NEWS_HEADLINES } from '../constants';

export const fluctuatePrice = (currentPrice: number, volatility: number): number => {
  const changePercent = (Math.random() - 0.5) * 2 * (volatility / 100);
  return currentPrice * (1 + changePercent);
};

export const generateMarketEvent = (lastTimestamp: number): MarketEvent | null => {
  // Only generate news occasionally (e.g., 20% chance per tick)
  if (Math.random() > 0.2) return null;

  const newsItem = MOCK_NEWS_HEADLINES[Math.floor(Math.random() * MOCK_NEWS_HEADLINES.length)];
  
  return {
    id: `news_${Date.now()}`,
    timestamp: Date.now(),
    headline: newsItem.text,
    sentiment: newsItem.sentiment as 'BULLISH' | 'BEARISH' | 'NEUTRAL',
    impactLevel: Math.random() > 0.7 ? 'HIGH' : 'MEDIUM',
  };
};

export const updatePositions = (positions: Position[], globalTrend: number): Position[] => {
  return positions.map(p => {
    // Determine individual stock volatility based on a base risk + randomness
    const volatility = (p.riskScore / 20) + 0.5; // High risk score = higher volatility
    
    // Apply global trend bias
    const trendBias = globalTrend * 0.001; 
    
    let newPrice = fluctuatePrice(p.currentPrice, volatility) + (p.currentPrice * trendBias);
    newPrice = Math.max(0.01, newPrice); // No negative prices

    // Calculate PnL
    let pnl = 0;
    if (p.type === 'LONG') {
      pnl = (newPrice - p.entryPrice) * p.quantity;
    } else {
      pnl = (p.entryPrice - newPrice) * p.quantity;
    }

    // Dynamic Risk Score adjustment based on movement
    let newRisk = p.riskScore;
    const pctChange = Math.abs((newPrice - p.entryPrice) / p.entryPrice);
    if (pctChange > 0.05) newRisk += 2; // Increased volatility increases perceived risk
    if (pctChange < 0.01) newRisk = Math.max(10, newRisk - 1); // Stability reduces risk
    
    return {
      ...p,
      currentPrice: newPrice,
      unrealizedPnL: pnl,
      riskScore: Math.min(100, Math.max(0, newRisk)),
      lastUpdated: Date.now()
    };
  });
};