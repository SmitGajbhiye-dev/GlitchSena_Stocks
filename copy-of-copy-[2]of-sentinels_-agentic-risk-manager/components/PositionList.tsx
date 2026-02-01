import React, { useState } from 'react';
import { Position, PositionType } from '../types';
import { TrendingUp, TrendingDown, Link2, HelpCircle } from 'lucide-react';
import QuickAnalysisModal from './QuickAnalysisModal';
import { generateRiskAnalysis } from '../services/geminiService';

interface PositionListProps {
  positions: Position[];
}

const PositionList: React.FC<PositionListProps> = ({ positions }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [analysisText, setAnalysisText] = useState('');
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  const handleRiskAnalysis = async (symbol: string) => {
    setSelectedSymbol(symbol);
    setModalTitle('Risk Assessment');
    setAnalysisText('');
    setModalOpen(true);
    setIsLoadingAnalysis(true);

    const result = await generateRiskAnalysis(symbol);
    setAnalysisText(result);
    setIsLoadingAnalysis(false);
  };

  return (
    <>
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-100">Portfolio Holdings (NSE/BSE)</h3>
          <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded">Live Data</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-gray-900 text-gray-400 uppercase font-medium text-xs">
              <tr>
                <th className="px-6 py-3 whitespace-nowrap">Asset</th>
                <th className="px-6 py-3 whitespace-nowrap">Type</th>
                <th className="px-6 py-3 text-right whitespace-nowrap">Price (₹)</th>
                <th className="px-6 py-3 text-right whitespace-nowrap">PnL (₹)</th>
                <th className="px-6 py-3 text-right whitespace-nowrap">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {positions.map((pos) => {
                const isProfit = pos.unrealizedPnL >= 0;
                const pnlPct = ((pos.currentPrice - pos.entryPrice) / pos.entryPrice) * 100 * (pos.type === PositionType.LONG ? 1 : -1);
                
                return (
                  <tr key={pos.id} className="hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-200 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
                          {pos.symbol.substring(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-1">
                            {pos.symbol}
                            {pos.sourceUrl && (
                              <a href={pos.sourceUrl} target="_blank" rel="noopener noreferrer" title="View Source">
                                <Link2 className="w-3 h-3 text-gray-500 hover:text-emerald-400" />
                              </a>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{pos.quantity} Shares</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                          pos.type === PositionType.LONG 
                          ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' 
                          : 'bg-rose-900/30 text-rose-400 border-rose-800'
                      }`}>
                        {pos.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="text-gray-200">₹{pos.currentPrice.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                      <div className="text-xs text-gray-500">Avg: ₹{pos.entryPrice.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className={`font-bold flex items-center justify-end gap-1 ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isProfit ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>}
                        ₹{Math.abs(pos.unrealizedPnL).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                      </div>
                      <div className={`text-xs ${isProfit ? 'text-emerald-500/70' : 'text-rose-500/70'}`}>
                        {pnlPct > 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div 
                        onClick={() => handleRiskAnalysis(pos.symbol)}
                        className="flex items-center justify-end gap-2 cursor-pointer group/risk"
                        title="Click to view Risk Analysis"
                      >
                        <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                pos.riskScore > 75 ? 'bg-rose-500' : 
                                pos.riskScore > 50 ? 'bg-amber-500' : 'bg-blue-500'
                              }`} 
                              style={{ width: `${pos.riskScore}%` }}
                            ></div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`font-mono text-xs ${pos.riskScore > 75 ? 'text-rose-400' : 'text-gray-400'} group-hover/risk:underline`}>
                            {Math.round(pos.riskScore)}
                          </span>
                          <HelpCircle className="w-3 h-3 text-gray-600 opacity-0 group-hover/risk:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <QuickAnalysisModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={modalTitle}
        symbol={selectedSymbol}
        analysis={analysisText}
        isLoading={isLoadingAnalysis}
      />
    </>
  );
};

export default PositionList;