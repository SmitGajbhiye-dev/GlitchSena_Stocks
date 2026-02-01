export enum PositionType {
  LONG = 'LONG',
  SHORT = 'SHORT'
}

export enum AgentAction {
  HOLD = 'HOLD',
  REDUCE = 'REDUCE',
  EXIT = 'EXIT',
  REALLOCATE = 'REALLOCATE',
  BUY_DIP = 'BUY_DIP' // Opportunistic
}

export interface Position {
  id: string;
  symbol: string;
  name: string; // Full name if available, otherwise same as symbol
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  type: PositionType;
  allocationPct: number; // % of portfolio
  unrealizedPnL: number;
  riskScore: number; // 0-100
  lastUpdated: number;
  sourceUrl?: string; // For Google Search Grounding compliance
}

export interface Portfolio {
  cash: number;
  positions: Position[];
  totalValue: number;
  dailyPnL: number;
  totalPnL: number;
  riskScore: number; // Weighted average
}

export interface MarketEvent {
  id: string;
  timestamp: number;
  headline: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  impactLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  affectedSector?: string;
}

export interface AgentRecommendation {
  positionId: string;
  symbol: string;
  action: AgentAction;
  confidence: number; // 0-100
  reasoning: string;
  suggestedQuantity?: number; // How much to sell/buy
  id: string;
  timestamp: number;
}

export interface AgentLogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: 'INFO' | 'WARNING' | 'ACTION' | 'THOUGHT';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}