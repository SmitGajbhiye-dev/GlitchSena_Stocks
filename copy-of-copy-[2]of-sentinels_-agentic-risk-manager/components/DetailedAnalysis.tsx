import React from 'react';
import { Position, AgentRecommendation } from '../types';
import { FileText, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DetailedAnalysisProps {
  positions: Position[];
  recommendations: AgentRecommendation[];
  onExecute: (rec: AgentRecommendation) => void;
}

const DetailedAnalysis: React.FC<DetailedAnalysisProps> = ({ positions, recommendations, onExecute }) => {
  
  const getRecForPosition = (symbol: string) => recommendations.find(r => r.symbol === symbol);

  if (positions.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4 mt-20">
              <FileText className="w-16 h-16 opacity-20" />
              <p>No positions to analyze. Add stocks in the Dashboard first.</p>
          </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
        <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <FileText className="w-6 h-6 text-purple-400" />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-white">Detailed AI Reports</h2>
            <p className="text-gray-400 text-sm">Deep dive analysis into portfolio holdings based on sector performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {positions.map(pos => {
          const rec = getRecForPosition(pos.symbol);
          const isProfit = pos.unrealizedPnL >= 0;

          return (
            <div key={pos.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex flex-col md:flex-row gap-6 hover:border-gray-600 transition-colors">
               
               {/* Left: Stock Snapshot */}
               <div className="md:w-1/4 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-700 pb-4 md:pb-0 md:pr-6">
                  <div className="flex items-baseline justify-between mb-2">
                     <h3 className="text-xl font-bold text-white">{pos.symbol}</h3>
                     <span className={`px-2 py-0.5 text-xs font-bold rounded ${pos.type === 'LONG' ? 'bg-emerald-900 text-emerald-400' : 'bg-rose-900 text-rose-400'}`}>{pos.type}</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-200 mb-1">₹{pos.currentPrice.toLocaleString()}</div>
                  <div className={`flex items-center gap-1 font-mono text-sm ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {isProfit ? '+' : ''}₹{Math.abs(pos.unrealizedPnL).toLocaleString()}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-700/50">
                     <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Risk Score</span>
                        <span>{Math.round(pos.riskScore)}/100</span>
                     </div>
                     <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full ${pos.riskScore > 60 ? 'bg-rose-500' : 'bg-blue-500'}`} style={{width: `${pos.riskScore}%`}}></div>
                     </div>
                  </div>
               </div>

               {/* Right: AI Analysis */}
               <div className="md:w-3/4 flex flex-col">
                  <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-emerald-500" /> Sentinel Strategy
                  </h4>
                  
                  {rec ? (
                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50 flex-1">
                       <div className="flex justify-between items-start mb-3">
                          <span className={`text-lg font-bold ${
                              rec.action === 'EXIT' ? 'text-rose-400' : 
                              rec.action === 'HOLD' ? 'text-gray-200' : 
                              'text-emerald-400'
                          }`}>{rec.action}</span>
                          <span className="text-xs text-gray-500 border border-gray-700 rounded px-2 py-1">Confidence: {rec.confidence}%</span>
                       </div>
                       <p className="text-gray-300 text-sm leading-relaxed mb-4">
                           {rec.reasoning}
                       </p>
                       <button 
                         onClick={() => onExecute(rec)}
                         className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded transition-colors inline-flex items-center gap-2"
                       >
                           ACCEPT RECOMMENDATION
                       </button>
                    </div>
                  ) : (
                    <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700/30 border-dashed flex-1 flex flex-col items-center justify-center text-gray-500 gap-2">
                        <Minus className="w-8 h-8 opacity-50" />
                        <p className="text-sm">No active recommendation pending. Run AI Analysis from Dashboard.</p>
                    </div>
                  )}
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DetailedAnalysis;