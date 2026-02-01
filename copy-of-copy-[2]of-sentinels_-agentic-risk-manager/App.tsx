import React, { useState, useEffect, useCallback } from 'react';
import { 
  Portfolio, 
  Position, 
  AgentRecommendation, 
  AgentLogEntry, 
  AgentAction, 
  PositionType
} from './types';
import { INITIAL_CASH, INITIAL_POSITIONS } from './constants';
import { analyzePortfolio, fetchLivePrices } from './services/geminiService';
import PositionList from './components/PositionList';
import AgentLog from './components/AgentLog';
import ActionCenter from './components/ActionCenter';
import PortfolioCharts from './components/PortfolioCharts';
import AddPositionForm from './components/AddPositionForm';
import ChatBot from './components/ChatBot';
import Sidebar from './components/Sidebar';
import DetailedAnalysis from './components/DetailedAnalysis';
import AuthPage from './components/AuthPage';
import { Activity, ShieldCheck, BrainCircuit, RefreshCw, IndianRupee, Menu } from 'lucide-react';
import { auth } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const App: React.FC = () => {
  // --- Auth State ---
  const [user, setUser] = useState<{ name: string, email: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
          email: currentUser.email || ''
        });
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- View State ---
  const [currentView, setCurrentView] = useState<'dashboard' | 'analysis'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Initialize sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
  }, []);

  // --- Data State ---
  const [cash, setCash] = useState(INITIAL_CASH);
  const [positions, setPositions] = useState<Position[]>(INITIAL_POSITIONS);
  const [recommendations, setRecommendations] = useState<AgentRecommendation[]>([]);
  const [logs, setLogs] = useState<AgentLogEntry[]>([]);
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);

  // --- Derived State ---
  const totalPositionsValue = positions.reduce((acc, pos) => acc + (pos.currentPrice * pos.quantity), 0);
  const totalPortfolioValue = cash + totalPositionsValue;
  const totalPnL = positions.reduce((acc, pos) => acc + pos.unrealizedPnL, 0);
  const weightedRisk = positions.length > 0 
    ? positions.reduce((acc, pos) => acc + (pos.riskScore * (pos.currentPrice * pos.quantity)), 0) / totalPositionsValue 
    : 0;

  const portfolio: Portfolio = {
    cash,
    positions,
    totalValue: totalPortfolioValue,
    dailyPnL: totalPnL, 
    totalPnL: totalPnL,
    riskScore: weightedRisk
  };

  // --- Handlers ---
  const addLog = (message: string, type: 'INFO' | 'WARNING' | 'ACTION' | 'THOUGHT' = 'INFO') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36),
      timestamp: Date.now(),
      message,
      type
    }].slice(-50)); // Keep last 50
  };

  // Handled by AuthPage internally via Firebase, but this is used if we wanted to pass up manually
  const handleLoginSuccess = (loggedInUser: { name: string; email: string }) => {
    // setUser managed by onAuthStateChanged
    addLog(`User session started: ${loggedInUser.email}`, "INFO");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setPositions(INITIAL_POSITIONS); // Optional: Reset state on logout
      setLogs([]);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleAddPosition = (symbol: string, quantity: number, price: number) => {
    const newPos: Position = {
      id: `pos_${Date.now()}`,
      symbol,
      name: symbol, // Could fetch full name later
      entryPrice: price,
      currentPrice: price, // Initial assumption
      quantity,
      type: PositionType.LONG,
      allocationPct: 0,
      unrealizedPnL: 0,
      riskScore: 50, // Default mid-risk
      lastUpdated: Date.now()
    };
    setPositions(prev => [...prev, newPos]);
    addLog(`Added position: ${symbol}, Qty: ${quantity} @ ₹${price}`, "ACTION");
  };

  // --- Effects ---

  const handleRefreshPrices = async () => {
    if (positions.length === 0) return;
    setIsUpdatingPrices(true);
    addLog("Connecting to market data (NSE/BSE)...", "THOUGHT");
    
    const priceUpdates = await fetchLivePrices(positions);
    
    if (Object.keys(priceUpdates).length > 0) {
      setPositions(prev => prev.map(p => {
         const update = priceUpdates[p.symbol];
         if (update) {
            const pnl = (update.price - p.entryPrice) * p.quantity;
            // Simple risk heuristic based on PnL volatility for demo
            const riskAdjust = pnl < 0 ? 5 : -2;
            
            return {
              ...p,
              currentPrice: update.price,
              unrealizedPnL: pnl,
              riskScore: Math.min(100, Math.max(10, p.riskScore + riskAdjust)),
              lastUpdated: Date.now(),
              sourceUrl: update.source
            };
         }
         return p;
      }));
      addLog("Prices updated from live market sources.", "INFO");
    } else {
      addLog("Could not fetch new prices. Retrying...", "WARNING");
    }
    setIsUpdatingPrices(false);
  };

  // Agent Analysis
  const runAgentAnalysis = useCallback(async () => {
    if (isAgentThinking || positions.length === 0) return;
    
    setIsAgentThinking(true);
    addLog("Agent evaluating portfolio performance...", "THOUGHT");

    // Small artificial delay for effect
    await new Promise(r => setTimeout(r, 1000));

    const newRecs = await analyzePortfolio(portfolio, []);
    
    if (newRecs.length > 0) {
      setRecommendations(newRecs);
      addLog(`Agent generated ${newRecs.length} recommendations.`, "ACTION");
    } else {
      addLog("Analysis Complete. Strategy remains effective.", "THOUGHT");
    }

    setIsAgentThinking(false);
  }, [portfolio, isAgentThinking, positions.length]);


  // --- Actions ---

  const handleExecute = (rec: AgentRecommendation) => {
    const posIndex = positions.findIndex(p => p.symbol === rec.symbol);
    if (posIndex === -1 && rec.action !== AgentAction.REALLOCATE) return;

    const pos = positions[posIndex];
    let newPositions = [...positions];
    let newCash = cash;
    let logMsg = "";

    if (rec.action === AgentAction.EXIT && pos) {
      newCash += pos.currentPrice * pos.quantity;
      newPositions.splice(posIndex, 1);
      logMsg = `EXECUTED: Exited ${pos.symbol} at ₹${pos.currentPrice.toFixed(2)}.`;
    } else if (rec.action === AgentAction.REDUCE && pos) {
      const qtyToSell = rec.suggestedQuantity || Math.floor(pos.quantity * 0.5);
      const actualQty = Math.min(qtyToSell, pos.quantity);
      newCash += pos.currentPrice * actualQty;
      newPositions[posIndex] = { ...pos, quantity: pos.quantity - actualQty };
      logMsg = `EXECUTED: Reduced ${pos.symbol} by ${actualQty} shares.`;
    } else if ((rec.action === AgentAction.REALLOCATE || rec.action === AgentAction.BUY_DIP) && pos) {
      const qtyToBuy = rec.suggestedQuantity || 10; 
      const cost = qtyToBuy * pos.currentPrice;
      if (cash >= cost) {
        newCash -= cost;
        newPositions[posIndex] = { ...pos, quantity: pos.quantity + qtyToBuy };
        logMsg = `EXECUTED: Added ${qtyToBuy} shares to ${pos.symbol}.`;
      }
    } 

    setCash(newCash);
    setPositions(newPositions);
    setRecommendations(prev => prev.filter(r => r.id !== rec.id));
    addLog(logMsg, "ACTION");
  };

  const handleDismiss = (recId: string) => {
    setRecommendations(prev => prev.filter(r => r.id !== recId));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <ShieldCheck className="w-10 h-10 text-emerald-500 animate-pulse" />
          <p className="text-gray-500 text-sm font-mono">INITIALIZING SENTINEL...</p>
        </div>
      </div>
    );
  }

  // --- Render Auth Page if not logged in ---
  if (!user) {
    return <AuthPage onLogin={handleLoginSuccess} />;
  }

  // --- Main App Render ---
  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100 font-sans overflow-hidden">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300">
        
        {/* Header - Combined for Mobile & Desktop logic */}
        <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-300 hover:text-white p-1 rounded hover:bg-gray-800">
               <Menu className="w-6 h-6" />
             </button>
             
             {/* Brand - Visible mainly on mobile or if sidebar is closed on desktop */}
             <div className={`flex items-center gap-2 md:hidden ${!isSidebarOpen ? 'md:flex' : ''}`}>
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="font-bold">SENTINEL</span>
             </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
               {/* Desktop Actions */}
               <div className="hidden md:flex items-center gap-3">
                  <button 
                    onClick={() => runAgentAnalysis()}
                    disabled={isAgentThinking || positions.length === 0}
                    className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-3 py-2 rounded text-xs font-medium flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <BrainCircuit className={`w-3.5 h-3.5 ${isAgentThinking ? 'animate-spin' : ''}`} />
                    {isAgentThinking ? 'ANALYZING...' : 'AI ANALYSIS'}
                  </button>

                  <button 
                    onClick={handleRefreshPrices}
                    disabled={isUpdatingPrices || positions.length === 0}
                    className={`px-3 py-2 rounded text-xs font-bold flex items-center gap-2 transition-all ${
                      isUpdatingPrices 
                      ? 'bg-blue-900/50 text-blue-400 border border-blue-800' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isUpdatingPrices ? 'animate-spin' : ''}`} />
                    {isUpdatingPrices ? 'UPDATING...' : 'REFRESH'}
                  </button>
               </div>

               {/* Mobile Actions */}
               <div className="flex md:hidden items-center gap-2">
                  <button 
                    onClick={() => runAgentAnalysis()}
                    disabled={isAgentThinking || positions.length === 0}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-gray-300 border border-gray-700 disabled:opacity-50 transition-colors"
                    title="Run AI Analysis"
                  >
                    <BrainCircuit className={`w-4 h-4 ${isAgentThinking ? 'animate-spin' : ''}`} />
                  </button>
                  <button 
                    onClick={handleRefreshPrices}
                    disabled={isUpdatingPrices}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-emerald-400 border border-gray-700 transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${isUpdatingPrices ? 'animate-spin' : ''}`} />
                  </button>
               </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-950 relative">
          <div className="max-w-[1400px] mx-auto pb-8">
            
            {currentView === 'dashboard' ? (
              <div className="flex flex-col gap-6">
                 {/* Top KPIs */}
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                   <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-sm relative overflow-hidden">
                     <div className="relative z-10">
                       <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Equity (INR)</p>
                       <h2 className="text-2xl font-bold text-white mt-1">₹{totalPortfolioValue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
                     </div>
                     <IndianRupee className="absolute right-2 bottom-2 w-16 h-16 text-gray-700/20" />
                   </div>

                   <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-sm relative overflow-hidden">
                      <div className="relative z-10">
                       <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total PnL</p>
                       <h2 className={`text-2xl font-bold mt-1 ${totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                         {totalPnL >= 0 ? '+' : ''}₹{Math.abs(totalPnL).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                       </h2>
                     </div>
                     <Activity className={`absolute right-2 bottom-2 w-16 h-16 opacity-20 ${totalPnL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`} />
                   </div>

                   <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-sm relative overflow-hidden">
                      <div className="relative z-10">
                       <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Risk Exposure</p>
                       <div className="flex items-end gap-2">
                         <h2 className={`text-2xl font-bold mt-1 ${weightedRisk > 60 ? 'text-rose-400' : weightedRisk > 30 ? 'text-amber-400' : 'text-blue-400'}`}>
                           {Math.round(weightedRisk)}/100
                         </h2>
                       </div>
                     </div>
                     <div className="absolute bottom-0 left-0 h-1 bg-gray-700 w-full">
                       <div className={`h-full ${weightedRisk > 60 ? 'bg-rose-500' : weightedRisk > 30 ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${weightedRisk}%` }}></div>
                     </div>
                   </div>
                 </div>

                 {/* Add Position Form */}
                 <AddPositionForm onAdd={handleAddPosition} />

                 {/* Action Center was here, moved to bottom */}

                 {/* Charts */}
                 {positions.length > 0 && <PortfolioCharts positions={positions} />}

                 {/* Position List */}
                 <PositionList positions={positions} />
                 
                 {positions.length === 0 && (
                   <div className="text-center p-10 bg-gray-900/50 rounded-lg border border-gray-800 border-dashed">
                      <p className="text-gray-500">No active positions. Add Indian stocks above to begin agent monitoring.</p>
                   </div>
                 )}
              </div>
            ) : (
              /* Detailed Analysis View */
              <DetailedAnalysis 
                positions={positions} 
                recommendations={recommendations}
                onExecute={handleExecute}
              />
            )}

            {/* Agent Log (Inline at bottom of content) */}
            <AgentLog logs={logs} isThinking={isAgentThinking || isUpdatingPrices} />
            
            {/* Action Center moved below Agent Log */}
            {currentView === 'dashboard' && (
              <div className="mt-6">
                <ActionCenter 
                  recommendations={recommendations} 
                  onExecute={handleExecute} 
                  onDismiss={handleDismiss} 
                />
              </div>
            )}
            
          </div>
        </main>
      </div>

      {/* Floating Chat Bot */}
      <ChatBot />
    </div>
  );
};

export default App;