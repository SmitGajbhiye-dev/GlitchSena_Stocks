import React, { useEffect, useRef } from 'react';
import { AgentLogEntry } from '../types';
import { Bot, AlertTriangle, Info, Terminal } from 'lucide-react';

interface AgentLogProps {
  logs: AgentLogEntry[];
  isThinking: boolean;
}

const AgentLog: React.FC<AgentLogProps> = ({ logs, isThinking }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isThinking]);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex flex-col font-mono text-sm shadow-lg mt-6">
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-700">
        <div className="p-1.5 bg-gray-700 rounded-md">
          <Bot className="w-4 h-4 text-emerald-400" />
        </div>
        <h2 className="text-gray-200 font-bold uppercase tracking-wider text-xs">Sentinel Core Log</h2>
        {isThinking && <span className="animate-pulse text-[10px] text-emerald-500 ml-auto font-bold">PROCESSING DATA...</span>}
      </div>

      <div className="overflow-y-auto scrollbar-hide space-y-2 h-64 md:h-auto md:max-h-80" ref={scrollRef}>
        {logs.length === 0 && <div className="text-gray-600 italic text-xs py-4 text-center">System Initialized. Awaiting market data...</div>}
        
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 animate-fade-in text-xs leading-relaxed group hover:bg-gray-700/30 p-1 rounded -mx-1 transition-colors">
             <div className="mt-0.5 shrink-0">
               {log.type === 'INFO' && <Info className="w-3.5 h-3.5 text-blue-400" />}
               {log.type === 'WARNING' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
               {log.type === 'ACTION' && <Terminal className="w-3.5 h-3.5 text-emerald-400" />}
               {log.type === 'THOUGHT' && <Bot className="w-3.5 h-3.5 text-purple-400" />}
             </div>
             <div className="flex-1 break-words">
               <span className="text-gray-500 text-[10px] mr-2 font-bold select-none">
                 {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}
               </span>
               <span className={`${
                 log.type === 'WARNING' ? 'text-amber-300' : 
                 log.type === 'ACTION' ? 'text-emerald-300' : 
                 log.type === 'THOUGHT' ? 'text-purple-300' : 'text-gray-300'
               }`}>
                 {log.message}
               </span>
             </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex gap-2 text-gray-500 animate-pulse text-xs p-1">
            <Bot className="w-3.5 h-3.5" />
            <span>Core thinking...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentLog;