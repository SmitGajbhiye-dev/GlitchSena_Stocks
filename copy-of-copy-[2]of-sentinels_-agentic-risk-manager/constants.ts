import { Position } from './types';

// Initial Capital in INR
export const INITIAL_CASH = 0;

export const INITIAL_POSITIONS: Position[] = [];

export const MOCK_NEWS_HEADLINES = [
  { text: "Sensex crosses 75,000 mark for the first time led by banking rally.", sentiment: "BULLISH" },
  { text: "Nifty 50 slides below 22,000 amid weak global cues and FII selling.", sentiment: "BEARISH" },
  { text: "RBI Monetary Policy Committee maintains status quo on repo rate.", sentiment: "NEUTRAL" },
  { text: "Major IT companies report steady growth in Q3 earnings.", sentiment: "BULLISH" },
  { text: "Rupee hits all-time low against the US dollar impacting importers.", sentiment: "BEARISH" }
];