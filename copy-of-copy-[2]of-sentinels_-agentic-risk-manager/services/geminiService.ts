import { GoogleGenAI, Type } from "@google/genai";
import { Portfolio, MarketEvent, AgentRecommendation, AgentAction, Position } from '../types';

const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const sendChatMessage = async (history: { role: string, parts: { text: string }[] }[], message: string): Promise<string> => {
  if (!apiKey) return "I'm sorry, I cannot connect to the server right now (Missing API Key).";

  const modelId = "gemini-3-pro-preview"; // Using Pro for better reasoning in chat

  try {
    const chat = ai.chats.create({
      model: modelId,
      history: history,
      config: {
        systemInstruction: `You are 'Sentinel Assistant', the AI guide for the Sentinels Risk Manager platform. 
        
        Your Goal: Help users navigate this app and answer questions about the Indian Stock Market.
        
        App Features you can explain:
        1. **Add Positions**: Users can add NSE/BSE stocks with quantity and price.
        2. **Real-time Monitoring**: The app fetches live prices and calculates PnL.
        3. **AI Analysis**: A "Gemini 3 Flash" agent compares user stocks against peers (Revenue, Margins, etc.) using Google Search to recommend HOLD, REDUCE, or EXIT.
        4. **Action Center**: Users can execute AI recommendations with one click.

        Tone: Professional, helpful, concise, and financially literate.
        Context: The user is likely an investor looking to manage risk.
        `,
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I processed that, but I don't have a text response.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm having trouble connecting to my knowledge base right now. Please try again.";
  }
};

export const fetchLivePrices = async (positions: Position[]): Promise<{ [symbol: string]: { price: number, source?: string } }> => {
  if (!apiKey || positions.length === 0) return {};

  const modelId = "gemini-3-flash-preview";
  const symbols = positions.map(p => p.symbol).join(", ");
  
  const prompt = `
    Find the most recent live market price (in INR) on NSE or BSE India for these stocks: ${symbols}.
    If the market is closed, retrieve the latest closing price.
    
    IMPORTANT OUTPUT FORMAT:
    Please output the data as a list where each line is strictly:
    SYMBOL|PRICE
    
    Example:
    RELIANCE|2450.50
    TCS|3500.00
    
    Do not add markdown formatting like bolding. Just the raw text lines.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType cannot be JSON when using search in this context reliably for parsing grounding
      }
    });

    const text = response.text || "";
    const lines = text.split('\n');
    const updates: { [symbol: string]: { price: number, source?: string } } = {};
    
    // Extract Source URLs for compliance
    let sourceUrl = "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks && groundingChunks.length > 0) {
       // Pick the first relevant web source
       const webChunk = groundingChunks.find(c => c.web?.uri);
       if (webChunk) sourceUrl = webChunk.web?.uri || "";
    }

    // Parse the text "SYMBOL|PRICE"
    lines.forEach(line => {
      if (line.includes('|')) {
        const [sym, priceStr] = line.split('|');
        const cleanPrice = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
        if (sym && !isNaN(cleanPrice)) {
            updates[sym.trim().toUpperCase()] = { 
              price: cleanPrice,
              source: sourceUrl
            };
        }
      }
    });

    return updates;

  } catch (error) {
    console.error("Gemini Price Fetch Failed:", error);
    return {};
  }
};

export const searchStockSymbol = async (query: string): Promise<{ symbol: string, name: string, currentPrice?: number }[]> => {
  if (!apiKey || !query) return [];

  const modelId = "gemini-3-flash-preview";
  const prompt = `
    Search for the correct NSE or BSE stock symbol for the Indian company or query: "${query}".
    Use the Google Search tool to find the *latest* current market price in INR for the top matches.
    
    Return the top 3 results in the specified JSON format. 
    Ensure 'currentPrice' is populated with the real-time or latest closing price found via search.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              symbol: { type: Type.STRING, description: "The NSE symbol (preferred) or BSE symbol (e.g., RELIANCE, TCS)" },
              name: { type: Type.STRING, description: "The full company name" },
              currentPrice: { type: Type.NUMBER, description: "The current live price in INR found via Google Search" }
            },
            required: ["symbol", "name"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text) as { symbol: string, name: string, currentPrice?: number }[];
  } catch (error) {
    console.error("Symbol Search Failed:", error);
    return [];
  }
};

export const generateQuickScan = async (symbol: string, currentPrice: number): Promise<string> => {
  if (!apiKey) return "API Key missing.";

  const modelId = "gemini-3-flash-preview";
  const prompt = `
    Provide a "Quick Pulse" analysis for the Indian stock ${symbol} trading at ₹${currentPrice}.
    Use Google Search to find the very latest news (last 24-48 hours).
    
    Output Format: 
    Strictly a 2-3 sentence summary. Mention the immediate sentiment (Bullish/Bearish) and one key recent event/reason.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });
    return response.text || "No data available.";
  } catch (error) {
    console.error("Quick Scan Failed", error);
    return "Analysis currently unavailable.";
  }
};

export const generateRiskAnalysis = async (symbol: string): Promise<string> => {
  if (!apiKey) return "API Key missing.";

  const modelId = "gemini-3-flash-preview";
  const prompt = `
    Perform a targeted Risk Assessment for the Indian stock ${symbol}.
    Use Google Search to identify 3 key risk factors affecting the stock currently (e.g., Regulatory issues, Global market headwinds, Sector slowdown, Earnings miss, High Valuation).
    
    Output Format:
    - Return a concise, bulleted list of the 3 main reasons why this stock carries risk right now.
    - Start with a short sentence summarizing the overall risk sentiment (Low, Medium, or High).
    - Be succinct.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });
    return response.text || "Risk analysis unavailable.";
  } catch (error) {
    console.error("Risk Analysis Failed", error);
    return "Could not generate risk report at this time.";
  }
};

export const analyzePortfolio = async (
  portfolio: Portfolio,
  recentEvents: MarketEvent[] // Kept for interface compatibility, though we rely on price action now
): Promise<AgentRecommendation[]> => {
  if (!apiKey) {
    console.error("No API Key provided for Gemini.");
    return [];
  }

  const modelId = "gemini-3-flash-preview";
  
  // Format data for the prompt
  const portfolioSummary = portfolio.positions.map(p => ({
    symbol: p.symbol,
    type: p.type,
    entry: `₹${p.entryPrice.toFixed(2)}`,
    current: `₹${p.currentPrice.toFixed(2)}`,
    pnl: `₹${p.unrealizedPnL.toFixed(2)}`,
    pctChange: `${((p.currentPrice - p.entryPrice)/p.entryPrice * 100).toFixed(2)}%`,
    qty: p.quantity,
    allocation: `${((p.currentPrice * p.quantity) / portfolio.totalValue * 100).toFixed(1)}%`
  }));

  const prompt = `
    Role: You are an expert Indian Stock Market Risk Analyst & Portfolio Strategist.

Context: 
- Portfolio Total Value: ₹${portfolio.totalValue.toFixed(2)}
- Cash Available: ₹${portfolio.cash.toFixed(2)}
- Positions: ${JSON.stringify(portfolioSummary)}

IMPORTANT COMPLIANCE INSTRUCTION: 
You are an AI Analyst, not a SEBI-registered Investment Advisor. Do not provide direct "Buy" or "Sell" signals. Instead, provide "Strategic Recommendations" based on risk exposure and fundamental data. Always include a disclaimer.

TASK:
Conduct a **Comparative Risk & Opportunity Analysis** for the provided positions using **Google Search** to benchmark against sector peers.

EVALUATION FRAMEWORK (Data to Fetch):
For each stock, retrieve and analyze:
1. **Peer Benchmarking**: Compare Revenue/Profit CAGR, Operating Margins, and Return Ratios (ROE/ROCE) against the top 2-3 competitors in the niche.
2. **Relative Valuation**: Is the current P/E or P/B justified compared to the Industry Average and Peer Average?
3. **Sector Tailwinds**: Is the company capturing market share, or losing it to the peers identified above?

STRATEGIC LOGIC (For Recommendation Output):
Analyze the data and categorize each stock into one of the following Strategic Actions:

1. **HOLD (Maintain Strategy)**: 
   - Fundamentals are intact, growth aligns with or exceeds peers, and valuations are reasonable.
   
2. **REDUCE (Risk Mitigation)**: 
   - The stock is fundamentally sound but currently overvalued compared to peers.
   - OR significant recent rallies have skewed portfolio weight (profit booking suggestion).
   
3. **EXIT (Capital Reallocation)**: 
   - The stock consistently lags peers in growth or margins.
   - Fundamentals are deteriorating (governance issues, rising debt, falling market share).
   - **MANDATORY**: If EXIT is chosen, you MUST identify a "Reinvestment Opportunity." This should be a specific peer or sector ETF that is currently outperforming the stock being exited.

Output Format: 
Provide a strictly valid JSON Array containing objects with these fields:
- "ticker": "Stock Symbol"
- "action": "HOLD" | "REDUCE" | "EXIT"
- "risk_score": (1-10, where 10 is high risk)
- "reasoning": "Explicit comparison data (e.g., 'ROE of 12% is significantly lower than peer HDFC Bank at 17%...')"
- "reinvestment_suggestion": (Null if HOLD/REDUCE. If EXIT, provide: "Consider analyzing [Better Peer Name] due to [Specific Advantage]")
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a disciplined Indian market financial agent. Use INR currency context. Base your decisions on real-time data found via Google Search.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              positionId: { type: Type.STRING, description: "The symbol (e.g., RELIANCE)" },
              action: { type: Type.STRING, enum: [
                AgentAction.HOLD, 
                AgentAction.REDUCE, 
                AgentAction.EXIT, 
                AgentAction.REALLOCATE,
                AgentAction.BUY_DIP
              ] },
              confidence: { type: Type.NUMBER, description: "Confidence score 0-100 based on data strength" },
              reasoning: { type: Type.STRING, description: "Specific rationale citing peer comparisons and fundamentals." },
              suggestedQuantity: { type: Type.NUMBER, description: "Amount of shares to buy/sell (0 if HOLD)" }
            },
            required: ["positionId", "action", "confidence", "reasoning"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const recommendations = JSON.parse(text) as any[];

    return recommendations.map(rec => {
        const matchedPos = portfolio.positions.find(p => p.symbol === rec.positionId);
        return {
            id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            positionId: matchedPos ? matchedPos.id : rec.positionId,
            symbol: rec.positionId,
            action: rec.action as AgentAction,
            confidence: rec.confidence,
            reasoning: rec.reasoning,
            suggestedQuantity: rec.suggestedQuantity || 0
        };
    });

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return [];
  }
};