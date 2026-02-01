# Sentinels: Agentic Risk Manager

**Team:** Glitch Sena  
**Problem Statement:** Continuous Decision-Making for Risk-Aware Trading

---

## 🎯 Overview

Sentinels is an AI-powered portfolio management and risk assessment platform that enables continuous, intelligent decision-making for traders and investors. Built with cutting-edge AI agents and real-time market analysis, Sentinels helps you manage risk, identify opportunities, and optimize your trading strategies with confidence.

Our agentic system continuously monitors your portfolio, analyzes market conditions, and provides real-time recommendations to help you make better trading decisions while maintaining strict risk controls.

---

## 🚀 Live Deployment

**Access the application here:** [https://copy-of-copy-2-of-sentinels-agentic-risk-manager-36618703075.us-west1.run.app/](https://copy-of-copy-2-of-sentinels-agentic-risk-manager-36618703075.us-west1.run.app/)

---

## ✨ Key Features

### 📊 Portfolio Management
- **Real-time Portfolio Tracking:** Monitor your positions with live price updates and P&L calculations
- **Position Management:** Add, update, and manage both long and short positions
- **Cash Management:** Track available capital and allocation percentages

### 🤖 AI-Powered Agent System
- **Continuous Risk Assessment:** Real-time risk scoring and portfolio health monitoring
- **Intelligent Recommendations:** AI agent provides actionable trading decisions (HOLD, REDUCE, EXIT, REALLOCATE, BUY_DIP)
- **Market-Aware Decision Making:** Integrates Google Gemini AI for intelligent analysis
- **Agent Logging:** Full audit trail of agent decisions and reasoning

### 💬 Interactive Chat Interface
- **AI ChatBot:** Natural language interaction for market insights and portfolio analysis
- **Quick Analysis Modal:** Get instant technical and fundamental analysis of any asset
- **Detailed Analysis Reports:** In-depth market analysis powered by Google Gemini

### 📈 Advanced Analytics
- **Portfolio Charts:** Visualize allocation, performance, and risk distribution
- **Market Simulator:** Test trading strategies in a simulated environment
- **Risk Dashboard:** Comprehensive risk metrics and portfolio health indicators

### 🎯 Action Center
- **One-Click Execution:** Act on agent recommendations instantly
- **Trade Management:** Execute positions based on AI insights
- **Position Rebalancing:** Automated portfolio rebalancing capabilities

### 🔐 Secure & Scalable
- **Firebase Integration:** Secure authentication and data persistence
- **Real-time Sync:** Live updates across all devices
- **Cloud Deployment:** Scalable cloud-native architecture

---

## 🏗️ Architecture

### Tech Stack
- **Frontend:** React 19 + TypeScript
- **Styling:** Tailwind CSS (implied by modern component structure)
- **Build Tool:** Vite
- **AI/ML:** Google Gemini AI (`@google/genai`)
- **Backend Services:** Firebase
- **Charting:** Recharts
- **UI Components:** Lucide React Icons

### Project Structure

```
├── components/              # React components
│   ├── ActionCenter.tsx     # Trading action execution interface
│   ├── AddPositionForm.tsx  # Position creation form
│   ├── AgentLog.tsx         # Agent decision history and audit trail
│   ├── AuthPage.tsx         # Authentication interface
│   ├── ChatBot.tsx          # AI-powered chat interface
│   ├── DetailedAnalysis.tsx # In-depth market analysis
│   ├── PortfolioCharts.tsx  # Portfolio visualization
│   ├── PositionList.tsx     # Position inventory display
│   ├── QuickAnalysisModal.tsx # Quick asset analysis
│   └── Sidebar.tsx          # Navigation sidebar
├── services/                # Business logic and integrations
│   ├── firebase.ts          # Firebase initialization and config
│   ├── geminiService.ts     # Google Gemini AI integration
│   └── marketSimulator.ts   # Trading simulator engine
├── App.tsx                  # Root application component
├── index.tsx                # Application entry point
├── types.ts                 # TypeScript type definitions
├── constants.ts             # Application constants
├── vite.config.ts           # Vite configuration
└── package.json             # Project dependencies
```

---

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project credentials
- Google Gemini API key

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sentinels-agentic-risk-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env.local` file with the following:
   ```
   VITE_FIREBASE_API_KEY=<your-firebase-api-key>
   VITE_FIREBASE_AUTH_DOMAIN=<your-firebase-auth-domain>
   VITE_FIREBASE_PROJECT_ID=<your-firebase-project-id>
   VITE_FIREBASE_STORAGE_BUCKET=<your-firebase-storage-bucket>
   VITE_FIREBASE_MESSAGING_SENDER_ID=<your-firebase-messaging-sender-id>
   VITE_FIREBASE_APP_ID=<your-firebase-app-id>
   VITE_GEMINI_API_KEY=<your-google-gemini-api-key>
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

5. **Build for production**
   ```bash
   npm run build
   ```

---

## 🎮 Usage

### Getting Started
1. **Sign In:** Create an account or log in with Firebase authentication
2. **Add Positions:** Use the AddPositionForm to add your trading positions
3. **Monitor Portfolio:** View real-time portfolio metrics and risk scores
4. **Review Recommendations:** Check the AgentLog for AI-generated trading recommendations
5. **Execute Actions:** Use ActionCenter to implement agent recommendations

### Core Workflows

#### Portfolio Monitoring
- Dashboard displays real-time portfolio value, P&L, and risk metrics
- Each position shows entry price, current price, allocation %, and risk score
- Color-coded risk indicators (green/yellow/red)

#### AI Agent Interaction
- Agent continuously analyzes portfolio and market conditions
- Generates recommendations: HOLD, REDUCE, EXIT, REALLOCATE, BUY_DIP
- Each recommendation includes reasoning and risk assessment
- Review full decision history in AgentLog

#### Market Analysis
- Use ChatBot for natural language market queries
- Quick Analysis Modal for fast asset insights
- Detailed Analysis for comprehensive market reports
- Market Simulator for strategy backtesting

---

## 📊 Data Models

### Position
```typescript
interface Position {
  id: string;                    // Unique position identifier
  symbol: string;                // Trading symbol (e.g., "AAPL")
  name: string;                  // Full company/asset name
  entryPrice: number;             // Entry price
  currentPrice: number;           // Current market price
  quantity: number;               // Position size
  type: PositionType;             // LONG or SHORT
  allocationPct: number;          // % of portfolio
  unrealizedPnL: number;          // Unrealized profit/loss
  riskScore: number;              // Risk score (0-100)
  lastUpdated: number;            // Last update timestamp
  sourceUrl?: string;             // Data source for compliance
}
```

### AgentRecommendation
```typescript
interface AgentRecommendation {
  positionId: string;             // Target position
  symbol: string;                 // Asset symbol
  action: AgentAction;            // Recommended action
  confidence: number;             // Confidence level (0-100)
  reasoning: string;              // Explanation of recommendation
  targetPrice?: number;           // Target price if applicable
  timeline: string;               // Suggested timeframe
}
```

### Agent Actions
- **HOLD:** Maintain current position
- **REDUCE:** Decrease position size
- **EXIT:** Close the position
- **REALLOCATE:** Move capital to another position
- **BUY_DIP:** Take advantage of price dip opportunity

---

## 🤖 AI Agent System

The Sentinels agent system is built on continuous decision-making principles:

1. **Real-time Monitoring:** Continuously tracks portfolio and market conditions
2. **Risk Assessment:** Calculates multi-factor risk scores for each position
3. **Market Analysis:** Uses Google Gemini AI for intelligent market insights
4. **Decision Generation:** Produces actionable recommendations with reasoning
5. **Audit Trail:** Maintains complete history of all agent decisions

### How the Agent Works
- Analyzes current positions against market conditions
- Evaluates risk-to-reward ratios
- Considers market sentiment and technical indicators
- Generates recommendations aligned with risk tolerance
- Provides detailed reasoning for each decision

---

## 🔒 Security & Privacy

- **Firebase Authentication:** Secure user authentication and session management
- **Data Encryption:** All sensitive data encrypted in transit and at rest
- **API Compliance:** Google Search Grounding for data source compliance
- **No Data Sharing:** Your trading data is private and not shared with third parties

---

## 📈 Future Roadmap

- [ ] Advanced backtesting engine with multiple strategy templates
- [ ] Sentiment analysis integration from news and social media
- [ ] Machine learning model for predictive risk scoring
- [ ] Webhook integrations for automated trading execution
- [ ] Mobile app for iOS and Android
- [ ] Real-time market data feeds (Bloomberg, Reuters)
- [ ] Advanced order types and execution strategies
- [ ] Multi-currency and crypto asset support

---

