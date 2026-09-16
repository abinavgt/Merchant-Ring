import React, { useState, useMemo } from 'react';
import { 
  X, Database, Copy, Check, ExternalLink, 
  Maximize2, Minimize2, Search, FileCode,
  ChevronDown, ChevronRight, Folder, FolderOpen
} from 'lucide-react';
import notebookCellsData from '../data/data_cleaned_notebook.json';

export default function NotebookModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'CODE', 'MARKDOWN'
  const [collapsedSections, setCollapsedSections] = useState({});
  const [driveUrl, setDriveUrl] = useState(
    'https://drive.google.com/file/d/1pETidFS3FPGsYZ954KTSwgMypW1NsH6U/view?usp=sharing'
  );

  // Extract header level for markdown cells
  const getHeaderLevel = (cell) => {
    if (cell.cell_type !== 'markdown' || !cell.source) return 0;
    const lines = cell.source.split('\n');
    for (let line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) return 1;
      if (trimmed.startsWith('## ')) return 2;
      if (trimmed.startsWith('### ')) return 3;
      if (trimmed.startsWith('#### ')) return 4;
    }
    return 0;
  };

  // Determine hidden cells based on collapsed markdown section headers (Google Colab Folding Rule)
  const hiddenCellIds = useMemo(() => {
    const hiddenSet = new Set();
    const activeHeaders = []; // Stack of { id, level }

    for (let cell of notebookCellsData) {
      const level = getHeaderLevel(cell);

      if (level > 0) {
        // Pop higher or equal level headers from stack
        while (activeHeaders.length > 0 && activeHeaders[activeHeaders.length - 1].level >= level) {
          activeHeaders.pop();
        }

        // Check if current header cell is hidden by any parent header on the stack
        const isParentCollapsed = activeHeaders.some(h => collapsedSections[h.id]);
        if (isParentCollapsed) {
          hiddenSet.add(cell.id);
        }

        // Push current header onto stack
        activeHeaders.push({ id: cell.id, level });
      } else {
        // For non-header cells (code cells or regular text markdown), check if any active header is collapsed
        const isParentCollapsed = activeHeaders.some(h => collapsedSections[h.id]);
        if (isParentCollapsed) {
          hiddenSet.add(cell.id);
        }
      }
    }

    return hiddenSet;
  }, [collapsedSections]);

  // Compute number of hidden child cells for each section header
  const sectionChildCounts = useMemo(() => {
    const counts = {};
    const activeHeaders = [];

    for (let cell of notebookCellsData) {
      const level = getHeaderLevel(cell);
      if (level > 0) {
        while (activeHeaders.length > 0 && activeHeaders[activeHeaders.length - 1].level >= level) {
          activeHeaders.pop();
        }
        activeHeaders.push({ id: cell.id, level });
      } else {
        activeHeaders.forEach(h => {
          counts[h.id] = (counts[h.id] || 0) + 1;
        });
      }
    }
    return counts;
  }, []);

  const toggleSection = (cellId) => {
    setCollapsedSections(prev => ({
      ...prev,
      [cellId]: !prev[cellId]
    }));
  };

  const collapseAllSections = () => {
    const allHeaders = {};
    notebookCellsData.forEach(cell => {
      if (getHeaderLevel(cell) > 0) {
        allHeaders[cell.id] = true;
      }
    });
    setCollapsedSections(allHeaders);
  };

  const expandAllSections = () => {
    setCollapsedSections({});
  };

  const filteredCells = useMemo(() => {
    return notebookCellsData.filter(cell => {
      // Respect search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchSource = cell.source?.toLowerCase().includes(q);
        const matchOutput = cell.outputs?.some(o => 
          o.text?.toLowerCase().includes(q) || o.traceback?.toLowerCase().includes(q)
        );
        if (!matchSource && !matchOutput) return false;
      }

      // Respect cell type filter
      if (filterType === 'CODE' && cell.cell_type !== 'code') return false;
      if (filterType === 'MARKDOWN' && cell.cell_type !== 'markdown') return false;

      // Respect section collapse hiding (unless user is actively searching)
      if (!searchTerm.trim() && hiddenCellIds.has(cell.id)) {
        return false;
      }

      return true;
    });
  }, [searchTerm, filterType, hiddenCellIds]);

  if (!isOpen) return null;

  const copyDriveLink = () => {
    navigator.clipboard.writeText(driveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 md:p-6 overflow-hidden animate-in fade-in duration-200">
      
      {/* Jupyter Paper Modal Window Container */}
      <div 
        className={`w-full bg-white text-slate-900 border border-slate-300 rounded-2xl flex flex-col shadow-2xl overflow-hidden transition-all duration-300 ${
          isMaximized ? 'h-full max-w-full rounded-none' : 'max-w-6xl h-[94vh]'
        }`}
      >
        
        {/* Modal Sticky Header Bar */}
        <div className="px-5 py-3 bg-slate-900 text-white border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3 flex-shrink-0">
          
          {/* Header Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#1ed760] text-black font-extrabold flex items-center justify-center shadow-md flex-shrink-0">
              <FileCode className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="font-extrabold text-sm md:text-base text-white tracking-tight whitespace-nowrap">
                Merchant Ring ML Notebook
              </h2>
              <div>
                <span className="text-[10px] md:text-[11px] font-mono px-2.5 py-0.5 bg-[#1ed760]/20 text-[#1ed760] border border-[#1ed760]/40 rounded-full font-bold inline-block">
                  data-cleaned.ipynb
                </span>
              </div>
            </div>
          </div>

          {/* Search, Section Collapse & Action Controls (All on Same Horizontal Line) */}
          <div className="flex items-center gap-2 flex-nowrap overflow-x-auto py-1 shrink-0 scrollbar-none">
            
            {/* Search Input */}
            <div className="relative shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search code or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs text-white pl-8 pr-3 py-1.5 rounded-full outline-none focus:border-[#1ed760] w-36 md:w-44 transition-all"
              />
            </div>

            {/* Expand / Collapse All Section Controls */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-full p-0.5 text-[11px] font-semibold shrink-0">
              <button
                onClick={expandAllSections}
                className="px-2.5 py-1 text-slate-300 hover:text-white flex items-center gap-1 rounded-full transition-all"
                title="Expand all sections"
              >
                <FolderOpen className="w-3 h-3 text-[#1ed760]" />
                <span className="hidden sm:inline">Expand All</span>
              </button>
              <button
                onClick={collapseAllSections}
                className="px-2.5 py-1 text-slate-300 hover:text-white flex items-center gap-1 rounded-full transition-all border-l border-slate-700"
                title="Collapse all sections"
              >
                <Folder className="w-3 h-3 text-amber-400" />
                <span className="hidden sm:inline">Collapse All</span>
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-full p-0.5 text-[11px] font-semibold shrink-0">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  filterType === 'ALL' ? 'bg-[#1ed760] text-black font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('CODE')}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  filterType === 'CODE' ? 'bg-[#1ed760] text-black font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Code
              </button>
              <button
                onClick={() => setFilterType('MARKDOWN')}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  filterType === 'MARKDOWN' ? 'bg-[#1ed760] text-black font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Text
              </button>
            </div>

            {/* Drive Link */}
            <a
              href={driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-full transition-all shrink-0"
            >
              <Database className="w-3.5 h-3.5 text-[#1ed760]" />
              <span className="hidden sm:inline">Drive CSV</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            {/* Maximize Icon */}
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full transition-all shrink-0"
              title={isMaximized ? "Restore Window" : "Maximize Window"}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Equal-Padded Close X Button */}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full transition-all shrink-0"
              title="Close Notebook Modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Scrollable Notebook Document Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-3 custom-scrollbar bg-white text-slate-900 font-sans">
          
          {/* Render Notebook Cells */}
          {filteredCells.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm font-semibold">No notebook cells match your search filter.</p>
              <button 
                onClick={() => { setSearchTerm(''); setFilterType('ALL'); expandAllSections(); }}
                className="mt-2 text-xs text-[#1ed760] font-bold underline"
              >
                Reset Filters & Expand All
              </button>
            </div>
          ) : (
            filteredCells.map((cell) => {
              const headerLevel = getHeaderLevel(cell);
              const isCollapsed = !!collapsedSections[cell.id];
              const childCount = sectionChildCounts[cell.id] || 0;

              return (
                <ColabJupyterCell 
                  key={cell.id} 
                  cell={cell} 
                  headerLevel={headerLevel}
                  isCollapsed={isCollapsed}
                  childCount={childCount}
                  onToggle={() => toggleSection(cell.id)}
                />
              );
            })
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-2.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-mono flex-shrink-0">
          <span>data-cleaned.ipynb — {filteredCells.length} / {notebookCellsData.length} Cells Shown</span>
          <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Colab Collapsible Sections Active
          </span>
        </div>

      </div>

    </div>
  );
}

function ColabJupyterCell({ cell, headerLevel, isCollapsed, childCount, onToggle }) {
  if (cell.cell_type === 'markdown') {
    return (
      <div className="my-2 space-y-1">
        <div className="prose max-w-none text-slate-900 leading-relaxed">
          {cell.source.split('\n').map((line, idx) => {
            const trimmed = line.trim();
            const cleanLine = trimmed.replace(/\*/g, '').trim();

            if (headerLevel > 0 && idx === 0) {
              const headerText = trimmed.replace(/^#+\s*/, '').replace(/\*/g, '').trim();
              
              return (
                <div 
                  key={idx} 
                  onClick={onToggle}
                  className="flex items-center gap-2 cursor-pointer group py-2 border-b border-slate-200 select-none hover:bg-slate-50/80 rounded-lg px-2 transition-all"
                >
                  {/* Google Colab Style Triangle Arrow Button */}
                  <button 
                    className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 transition-all transform group-hover:scale-110 flex-shrink-0"
                    title={isCollapsed ? "Click triangle to expand section code" : "Click triangle to collapse section code"}
                  >
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-amber-600 fill-amber-600/20" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-emerald-600 fill-emerald-600/20" />
                    )}
                  </button>

                  {/* Header Title Text */}
                  {headerLevel === 1 && (
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex-1">
                      {headerText}
                    </h1>
                  )}
                  {headerLevel === 2 && (
                    <h2 className="text-lg md:text-xl font-extrabold text-slate-900 flex-1">
                      {headerText}
                    </h2>
                  )}
                  {headerLevel >= 3 && (
                    <h3 className="text-sm md:text-base font-bold text-slate-800 flex-1">
                      {headerText}
                    </h3>
                  )}

                  {/* Hidden Cells Counter Pill Badge when Collapsed */}
                  {isCollapsed && (
                    <span className="text-[10px] font-mono px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-full font-bold">
                      {childCount} cell{childCount === 1 ? '' : 's'} hidden (click triangle to view code)
                    </span>
                  )}
                </div>
              );
            }

            if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
              const listText = trimmed.replace(/^[\*\-]\s*/, '').replace(/\*/g, '').trim();
              return (
                <li key={idx} className="ml-6 list-disc text-slate-700 text-sm py-0.5">
                  {listText}
                </li>
              );
            }
            if (!cleanLine) return <div key={idx} className="h-1" />;
            
            return (
              <p key={idx} className="text-slate-800 text-sm font-medium pl-1">
                {cleanLine}
              </p>
            );
          })}
        </div>
      </div>
    );
  }

  // Code Cell with In [X]: left margin
  return (
    <div className="flex gap-2 md:gap-3 items-start my-2.5 font-mono text-xs animate-in fade-in duration-150">
      
      {/* In [X]: Label */}
      <div className="w-12 md:w-16 flex-shrink-0 text-right text-slate-500 font-mono text-xs pt-2 font-normal select-none">
        In [{cell.execution_count || cell.id}]:
      </div>

      {/* Code Box & Output Container */}
      <div className="flex-1 min-w-0 border border-slate-200/90 rounded-lg bg-slate-50/70 overflow-hidden shadow-sm">
        
        {/* Code Content Box */}
        <div className="p-3 bg-white font-mono text-xs leading-relaxed overflow-x-auto text-slate-800 select-text">
          {renderHighlightedCode(cell.source)}
        </div>

        {/* Outputs Section */}
        {cell.outputs && cell.outputs.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50/90 p-3 space-y-2 font-mono text-xs select-text">
            {cell.outputs.map((out, idx) => (
              <div key={idx} className="space-y-1">
                
                {out.type === 'stream' && (
                  <pre className="text-slate-700 whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
                    {out.text}
                  </pre>
                )}

                {out.type === 'data' && out.text && (
                  <pre className="text-slate-800 whitespace-pre-wrap font-mono text-[11px] leading-relaxed font-semibold">
                    {out.text}
                  </pre>
                )}

                {out.type === 'data' && out.image && (
                  <div className="p-2 bg-white rounded border border-slate-200 inline-block my-1">
                    <img 
                      src={`data:image/png;base64,${out.image}`} 
                      alt={`Plot Output Cell ${cell.id}`}
                      className="max-w-full h-auto rounded" 
                    />
                  </div>
                )}

                {out.type === 'error' && (
                  <pre className="text-red-600 bg-red-50 p-2.5 rounded border border-red-200 whitespace-pre-wrap font-mono text-[11px]">
                    <span className="font-bold">{out.ename}: {out.evalue}</span>
                    <div className="mt-1 opacity-90">{out.traceback}</div>
                  </pre>
                )}

              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}

function renderHighlightedCode(code) {
  if (!code) return null;
  const lines = code.split('\n');

  return lines.map((line, lIdx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('#')) {
      return (
        <div key={lIdx} className="text-slate-400 italic">
          {line}
        </div>
      );
    }

    const tokens = parsePythonTokens(line);
    return (
      <div key={lIdx} className="min-h-[18px]">
        {tokens.map((tok, tIdx) => (
          <span key={tIdx} className={tok.className}>
            {tok.text}
          </span>
        ))}
      </div>
    );
  });
}

function parsePythonTokens(line) {
  const keywords = new Set([
    'import', 'from', 'as', 'def', 'return', 'if', 'elif', 'else',
    'for', 'in', 'while', 'with', 'try', 'except', 'finally',
    'raise', 'class', 'lambda', 'global', 'nonlocal', 'pass',
    'break', 'continue', 'and', 'or', 'not', 'is', 'True', 'False', 'None'
  ]);

  const regex = /(#.*$)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|\b([a-zA-Z_]\w*)\b|(\d+(?:\.\d+)?)|([^\s\w'"]+|\s+)/g;
  const tokens = [];
  let match;

  while ((match = regex.exec(line)) !== null) {
    const [full, comment, str, word, num, other] = match;
    if (comment) {
      tokens.push({ text: comment, className: 'text-slate-400 italic font-mono' });
    } else if (str) {
      tokens.push({ text: str, className: 'text-[#008000] font-semibold font-mono' });
    } else if (word) {
      if (keywords.has(word)) {
        tokens.push({ text: word, className: 'text-[#800080] font-bold font-mono' });
      } else {
        tokens.push({ text: word, className: 'text-slate-900 font-mono' });
      }
    } else if (num) {
      tokens.push({ text: num, className: 'text-blue-700 font-mono' });
    } else {
      tokens.push({ text: other, className: 'text-slate-700 font-mono' });
    }
  }

  return tokens;
}
