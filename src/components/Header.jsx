import React from 'react';
import { 
  ShieldAlert, 
  Sparkles, 
  RefreshCw,
  Database,
  FileCode2,
  ExternalLink
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  setIsAiOpen, 
  setIsDriveOpen, 
  setIsNotebookOpen,
  onResetFilters 
}) {
  return (
    <header className="bg-[#0a0a0a] border-b border-[#1f1f1f] px-4 lg:px-8 py-3 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Brand Name: Merchant Ring */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#1ed760] flex items-center justify-center shadow-lg shadow-[#1ed760]/20">
            <ShieldAlert className="w-5 h-5 text-black" />
          </div>

          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-white flex items-center gap-2">
              Merchant Ring
            </h1>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          
          {/* AI Q&A Agent Trigger Button */}
          <button
            onClick={() => setIsAiOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-black bg-[#1ed760] hover:bg-[#1fdf64] rounded-full shadow-md transition-all transform hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-black fill-black" />
            <span>AI Agent</span>
          </button>

          {/* Drive & Dataset Link */}
          <button
            onClick={() => setIsDriveOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-[#181818] hover:bg-[#282828] border border-[#282828] rounded-full transition-all"
          >
            <Database className="w-3.5 h-3.5 text-[#1ed760]" />
            <span className="hidden sm:inline">Drive CSV</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>

          {/* ML Notebook Pop-up Modal Button */}
          <button
            onClick={() => setIsNotebookOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#181818] hover:bg-[#282828] border border-[#1ed760]/50 hover:border-[#1ed760] rounded-full transition-all shadow-sm"
          >
            <FileCode2 className="w-3.5 h-3.5 text-[#1ed760]" />
            <span className="hidden sm:inline">ML Notebook</span>
          </button>

          {/* Reset Filters */}
          <button
            onClick={onResetFilters}
            className="p-2 text-slate-400 hover:text-white bg-[#181818] hover:bg-[#282828] border border-[#282828] rounded-full transition-all"
            title="Reset All Slicers"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
}
