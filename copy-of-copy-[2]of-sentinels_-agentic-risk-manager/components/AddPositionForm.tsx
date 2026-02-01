import React, { useState } from 'react';
import { PlusCircle, Search, Loader2, Zap } from 'lucide-react';
import { searchStockSymbol } from '../services/geminiService';

interface AddPositionFormProps {
  onAdd: (symbol: string, quantity: number, price: number) => void;
}

const AddPositionForm: React.FC<AddPositionFormProps> = ({ onAdd }) => {
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [isPriceLive, setIsPriceLive] = useState(false);
  
  // Search State
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{ symbol: string, name: string, currentPrice?: number }[]>([]);

  const handleSearch = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!symbol) return;
    
    setIsSearching(true);
    setSearchResults([]);
    setIsPriceLive(false);
    
    const results = await searchStockSymbol(symbol);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSelectSymbol = (result: { symbol: string, name: string, currentPrice?: number }) => {
    setSymbol(result.symbol);
    if (result.currentPrice) {
      setPrice(result.currentPrice.toString());
      setIsPriceLive(true);
    } else {
      setIsPriceLive(false);
    }
    setSearchResults([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbol && quantity && price) {
      onAdd(symbol.toUpperCase(), Number(quantity), Number(price));
      setSymbol('');
      setQuantity('');
      setPrice('');
      setSearchResults([]);
      setIsPriceLive(false);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6 shadow-lg relative z-10">
      <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
        <PlusCircle className="w-4 h-4 text-emerald-400" /> Add Indian Stock
      </h3>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full relative">
          <label className="block text-xs text-gray-500 mb-1">Symbol / Company Name</label>
          <div className="relative">
            <input 
              type="text" 
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-l px-3 py-2 text-white focus:border-emerald-500 outline-none uppercase placeholder-gray-700 pr-10 rounded-r-none"
              placeholder="e.g. TATA MOTORS"
              required
              autoComplete="off"
            />
            <button
              onClick={handleSearch}
              type="button"
              className="absolute right-0 top-0 h-full bg-gray-700 hover:bg-gray-600 border border-l-0 border-gray-600 rounded-r px-3 flex items-center justify-center transition-colors"
              title="Search Symbol & Price"
              disabled={isSearching}
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
              ) : (
                <Search className="w-4 h-4 text-gray-300" />
              )}
            </button>
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-600 rounded mt-1 shadow-xl max-h-60 overflow-y-auto z-50">
              {searchResults.map((res, idx) => (
                <div 
                  key={idx}
                  className="px-4 py-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-0 transition-colors group flex justify-between items-center"
                  onClick={() => handleSelectSymbol(res)}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-400 text-sm">{res.symbol}</span>
                      <span className="text-xs text-gray-400 truncate max-w-[120px] sm:max-w-xs border-l border-gray-600 pl-2">{res.name}</span>
                    </div>
                  </div>
                  
                  {res.currentPrice && (
                    <div className="text-right pl-4">
                      <div className="text-white font-mono font-bold text-sm">₹{res.currentPrice.toLocaleString('en-IN')}</div>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                         <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                         </span>
                         <span className="text-[9px] text-emerald-400 font-bold tracking-wider uppercase">LIVE</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="w-full md:w-32">
          <label className="block text-xs text-gray-500 mb-1 flex justify-between">
            Quantity
          </label>
          <input 
            type="number" 
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-emerald-500 outline-none placeholder-gray-700"
            placeholder="Qty"
            min="1"
            required
          />
        </div>
        <div className="w-full md:w-32">
          <label className="block text-xs text-gray-500 mb-1 flex justify-between">
            <span>Price (₹)</span>
            {isPriceLive && <span className="text-emerald-400 flex items-center gap-0.5 text-[10px]"><Zap className="w-2.5 h-2.5 fill-current" /> LIVE</span>}
          </label>
          <input 
            type="number" 
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
              setIsPriceLive(false); // Reset live status if user edits manually
            }}
            className={`w-full bg-gray-900 border ${isPriceLive ? 'border-emerald-500/50' : 'border-gray-600'} rounded px-3 py-2 text-white focus:border-emerald-500 outline-none placeholder-gray-700 transition-colors`}
            placeholder="₹"
            step="0.01"
            required
          />
        </div>
        <button 
          type="submit"
          className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-6 rounded transition-colors"
        >
          ADD
        </button>
      </form>
    </div>
  );
};

export default AddPositionForm;