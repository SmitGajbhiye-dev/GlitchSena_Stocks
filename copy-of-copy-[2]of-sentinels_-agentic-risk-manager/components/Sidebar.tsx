import React from 'react';
import { LayoutDashboard, FileText, ShieldCheck, X, LogOut, User } from 'lucide-react';

interface SidebarProps {
  currentView: 'dashboard' | 'analysis';
  onChangeView: (view: 'dashboard' | 'analysis') => void;
  isOpen: boolean;
  onClose: () => void;
  user?: { name: string; email: string } | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, onClose, user, onLogout }) => {
  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 h-full bg-gray-900 border-r border-gray-800 z-50 transition-all duration-300 ease-in-out
        md:static md:h-screen md:shrink-0 overflow-hidden
        ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 md:w-0 md:translate-x-0 md:border-r-0'}
      `}>
        <div className="w-64 h-full flex flex-col">
          {/* Header/Logo Area */}
          <div className="p-6 border-b border-gray-800 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/50">
                 <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">SENTINEL</h1>
                <span className="text-xs text-emerald-500 font-bold tracking-widest">INDIA</span>
              </div>
            </div>
            <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-2 flex-1">
            <button
              onClick={() => { onChangeView('dashboard'); if(window.innerWidth < 768) onClose(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                currentView === 'dashboard' 
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>

            <button
              onClick={() => { onChangeView('analysis'); if(window.innerWidth < 768) onClose(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                currentView === 'analysis' 
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <FileText className="w-5 h-5" />
              Detailed Analysis
            </button>
          </nav>
          
          {/* Footer / User Profile */}
          <div className="p-4 shrink-0 border-t border-gray-800">
              {user && (
                <div className="flex items-center gap-3 mb-4 px-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
              )}
              
              <div className="bg-gray-800/50 rounded p-3 text-xs text-gray-500 border border-gray-700/50 whitespace-nowrap mb-2">
                  <p>Gemini Model: Pro-3 & Flash</p>
                  <p className="mt-1">Status: <span className="text-emerald-500">Online</span></p>
              </div>

              <button 
                onClick={onLogout}
                className="w-full flex items-center gap-2 text-gray-400 hover:text-rose-400 hover:bg-rose-950/30 px-3 py-2 rounded transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;