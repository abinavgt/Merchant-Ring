import React from 'react';
import { Filter, Search, Tag, UserCheck, Shield, XCircle } from 'lucide-react';

export default function SlicersBar({
  filters,
  setFilters,
  categories = [],
  onReset
}) {
  const hasActiveFilters = 
    filters.category !== 'ALL' || 
    filters.kycStatus !== 'ALL' || 
    filters.riskSegment !== 'ALL' ||
    filters.search !== '';

  return (
    <div className="bg-[#0e0e0e] border border-[#1f1f1f] rounded-2xl px-4 py-2.5 mb-5">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Label */}
        <div className="flex items-center gap-2 text-[#1ed760] font-bold uppercase tracking-wider text-[11px]">
          <Filter className="w-3.5 h-3.5" />
          <span>Dynamic Slicers</span>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center flex-wrap gap-2 flex-1 max-w-4xl">
          
          {/* Merchant Category Slicer */}
          <div className="flex items-center gap-1.5 bg-[#181818] border border-[#282828] rounded-full px-3 py-1 focus-within:border-[#1ed760]">
            <Tag className="w-3.5 h-3.5 text-[#1ed760]" />
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="bg-transparent text-slate-200 outline-none cursor-pointer text-xs pr-1"
            >
              <option value="ALL" className="bg-[#181818]">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-[#181818]">{cat}</option>
              ))}
            </select>
          </div>

          {/* KYC Status Slicer */}
          <div className="flex items-center gap-1.5 bg-[#181818] border border-[#282828] rounded-full px-3 py-1 focus-within:border-[#1ed760]">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={filters.kycStatus}
              onChange={(e) => setFilters({ ...filters, kycStatus: e.target.value })}
              className="bg-transparent text-slate-200 outline-none cursor-pointer text-xs pr-1"
            >
              <option value="ALL" className="bg-[#181818]">All KYC Statuses</option>
              <option value="Verified" className="bg-[#181818]">Verified</option>
              <option value="Pending" className="bg-[#181818]">Pending</option>
              <option value="Rejected" className="bg-[#181818]">Rejected</option>
            </select>
          </div>

          {/* Risk Segment Slicer */}
          <div className="flex items-center gap-1.5 bg-[#181818] border border-[#282828] rounded-full px-3 py-1 focus-within:border-[#1ed760]">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={filters.riskSegment}
              onChange={(e) => setFilters({ ...filters, riskSegment: e.target.value })}
              className="bg-transparent text-slate-200 outline-none cursor-pointer text-xs pr-1"
            >
              <option value="ALL" className="bg-[#181818]">All Risk Segments</option>
              <option value="High" className="bg-[#181818]">High Risk</option>
              <option value="Medium" className="bg-[#181818]">Medium Risk</option>
              <option value="Low" className="bg-[#181818]">Low Risk</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-1.5 bg-[#181818] border border-[#282828] rounded-full px-3 py-1 flex-1 min-w-[150px] focus-within:border-[#1ed760]">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Merchant, User ID..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="bg-transparent text-slate-200 placeholder-slate-500 outline-none w-full text-xs"
            />
          </div>

          {/* Clear Active Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-semibold px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full transition-all"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

        </div>

      </div>
    </div>
  );
}
