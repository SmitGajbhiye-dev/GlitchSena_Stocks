import React from 'react';
import { AgentRecommendation, AgentAction } from '../types';
import { CheckCircle, XCircle, AlertTriangle, ArrowRight } from 'lucide-react';

interface ActionCenterProps {
  recommendations: AgentRecommendation[];
  onExecute: (rec: AgentRecommendation) => void;
  onDismiss: (recId: string) => void;
}

const ActionCenter: React.FC<ActionCenterProps> = ({ recommendations, onExecute, onDismiss }) => {
  if (recommendations.length === 0) return null;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg mb-6 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-4">
        <div className="relative">
          <div className="absolute -inset-1 rounded-full bg-emerald-500 blur opacity-25 animate-pulse"></div>
          <AlertTriangle className="relative w-6 h-6 text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-white">Pending Strategic Recommendations</h3>
        <span className="ml-auto text-xs text-gray-500 font-mono">AI CONFIDENCE INTERVALS ACTIVE</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec) => (
          <div key={rec.id} className="bg-gray-900 border border-gray-600 rounded p-4 flex flex-col justify-between relative overflow-hidden group">
            {/* Action Badge Background Watermark */}
             <div className="absolute -right-4 -top-4 text-gray-800 font-black text-6xl opacity-10 select-none">
               {rec.action.substring(0, 3)}
             </div>

            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-lg text-white">{rec.symbol}</span>
                <span className={`px-2 py-1 text-xs font-bold rounded flex items-center gap-1 ${
                  rec.action === AgentAction.EXIT ? 'bg-rose-900 text-rose-400 border border-rose-700' :
                  rec.action === AgentAction.REDUCE ? 'bg-amber-900 text-amber-400 border border-amber-700' :
                  rec.action === AgentAction.REALLOCATE || rec.action === AgentAction.BUY_DIP ? 'bg-blue-900 text-blue-400 border border-blue-700' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {rec.action} 
                  <span className="opacity-70 text-[10px]">({rec.confidence}%)</span>
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-3 italic">"{rec.reasoning}"</p>
              {rec.suggestedQuantity > 0 && (
                 <div className="text-xs text-gray-500 font-mono mb-4">
                    Target Volume: {rec.suggestedQuantity} shares
                 </div>
              )}
            </div>

            <div className="flex gap-2 mt-auto">
               <button 
                 onClick={() => onExecute(rec)}
                 className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded text-xs font-bold flex items-center justify-center gap-2 transition-all"
               >
                 <CheckCircle className="w-3 h-3" /> EXECUTE
               </button>
               <button 
                 onClick={() => onDismiss(rec.id)}
                 className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 rounded text-xs font-bold flex items-center justify-center gap-2 transition-all"
               >
                 <XCircle className="w-3 h-3" /> DISMISS
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActionCenter;