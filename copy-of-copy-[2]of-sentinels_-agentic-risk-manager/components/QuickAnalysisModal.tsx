import React from 'react';
import { X, Sparkles, Loader2, ShieldAlert } from 'lucide-react';

interface QuickAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  symbol: string;
  analysis: string;
  isLoading: boolean;
}

const QuickAnalysisModal: React.FC<QuickAnalysisModalProps> = ({ isOpen, onClose, title, symbol, analysis, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-gray-800 border border-gray-600 rounded-xl shadow-2xl max-w-md w-full relative overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="bg-gray-900 px-6 py-4 flex justify-between items-center border-b border-gray-700">
           <div className="flex items-center gap-2">
              {title.includes('Risk') ? (
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
              ) : (
                  <Sparkles className="w-5 h-5 text-emerald-400" />
              )}
              <h3 className="text-lg font-bold text-white">{title}: {symbol}</h3>
           </div>
           <button onClick={onClose} className="text-gray-400 hover:text-white">
             <X className="w-5 h-5" />
           </button>
        </div>

        {/* Content */}
        <div className="p-6">
           {isLoading ? (
             <div className="flex flex-col items-center justify-center py-8 gap-3 text-gray-400">
               <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
               <span className="text-sm font-mono animate-pulse">Scanning live news & data...</span>
             </div>
           ) : (
             <div className="text-gray-200 leading-relaxed text-sm whitespace-pre-line">
               {analysis}
             </div>
           )}
        </div>

        {/* Footer */}
        <div className="bg-gray-900/50 px-6 py-3 border-t border-gray-700 text-right">
          <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-xs font-bold transition-colors">
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickAnalysisModal;