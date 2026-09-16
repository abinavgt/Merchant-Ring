import React, { useState, useMemo } from 'react';
import rawDataset from './data/fintech_processed_data.json';
import Header from './components/Header';
import SlicersBar from './components/SlicersBar';
import KPICards from './components/KPICards';
import OverviewSection from './components/sections/OverviewSection';
import MerchantRiskSection from './components/sections/MerchantRiskSection';
import FraudCorrelationSection from './components/sections/FraudCorrelationSection';
import AIAgentPanel from './components/AIAgentPanel';
import DriveModal from './components/DriveModal';
import NotebookModal from './components/NotebookModal';
import { LayoutDashboard, Store, ShieldAlert, Sparkles, FileCode2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isDriveOpen, setIsDriveOpen] = useState(false);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);

  // Global Slicers State
  const [filters, setFilters] = useState({
    category: 'ALL',
    kycStatus: 'ALL',
    riskSegment: 'ALL',
    search: ''
  });

  const onResetFilters = () => {
    setFilters({
      category: 'ALL',
      kycStatus: 'ALL',
      riskSegment: 'ALL',
      search: ''
    });
  };

  // Extract Categories list for slicer dropdown
  const categories = useMemo(() => {
    const cats = rawDataset?.joins?.category_vs_chargeback?.map(c => c.merchant_category) || [];
    return Array.from(new Set(cats)).sort();
  }, []);

  // Dynamic Dataset Filtering & Metric Recalculation engine!
  const filteredDataset = useMemo(() => {
    const rawTxns = rawDataset.raw_sample || [];
    const hasFilter = 
      filters.category !== 'ALL' || 
      filters.kycStatus !== 'ALL' || 
      filters.riskSegment !== 'ALL' || 
      filters.search.trim() !== '';

    if (!hasFilter) {
      return rawDataset;
    }

    const q = filters.search.toLowerCase().trim();

    // Filter raw transactions
    const filteredTxns = rawTxns.filter((t) => {
      if (filters.category !== 'ALL' && t.merchant_category !== filters.category) return false;
      if (filters.kycStatus !== 'ALL' && t.kyc_status !== filters.kycStatus) return false;
      if (filters.riskSegment !== 'ALL' && t.risk_segment !== filters.riskSegment) return false;
      if (q) {
        const matchMch = t.merchant_name?.toLowerCase().includes(q) || t.merchant_id?.toLowerCase().includes(q);
        const matchUsr = t.user_id?.toLowerCase().includes(q);
        if (!matchMch && !matchUsr) return false;
      }
      return true;
    });

    const totalTxns = filteredTxns.length;
    if (totalTxns === 0) {
      return rawDataset; // fallback if no match
    }

    const totalAmount = filteredTxns.reduce((sum, t) => sum + (t.amount || 0), 0);
    const avgTxnVal = totalAmount / totalTxns;

    const failedCount = filteredTxns.filter(t => t.status === 'Failed').length;
    const pendingCount = filteredTxns.filter(t => t.status === 'Pending').length;
    const successCount = filteredTxns.filter(t => t.status === 'Success').length;

    const failedRate = round((failedCount / totalTxns) * 100);
    const pendingRate = round((pendingCount / totalTxns) * 100);
    const successRate = round((successCount / totalTxns) * 100);

    const cbTxns = filteredTxns.filter(t => t.is_chargeback);
    const totalCbCount = cbTxns.length;
    const totalCbAmount = cbTxns.reduce((sum, t) => sum + (t.cb_amount || 0), 0);
    const overallCbRatio = round((totalCbCount / totalTxns) * 100);

    const kycVerified = filteredTxns.filter(t => t.kyc_status === 'Verified').length;
    const kycRejected = filteredTxns.filter(t => t.kyc_status === 'Rejected').length;
    const kycPending = filteredTxns.filter(t => t.kyc_status === 'Pending').length;

    const kycVerifiedPct = round((kycVerified / totalTxns) * 100);
    const kycRejectedPct = round((kycRejected / totalTxns) * 100);
    const kycPendingPct = round((kycPending / totalTxns) * 100);

    // Group repeat dispute users
    const userDisputeMap = {};
    cbTxns.forEach(t => {
      userDisputeMap[t.user_id] = (userDisputeMap[t.user_id] || 0) + 1;
    });
    const repeatUsers = Object.values(userDisputeMap).filter(cnt => cnt > 1).length;

    // Build dynamic copy
    let copy = JSON.parse(JSON.stringify(rawDataset));
    copy.kpis = {
      total_txns: totalTxns,
      total_amount: totalAmount,
      avg_txn_val: avgTxnVal,
      failed_rate: failedRate,
      pending_rate: pendingRate,
      success_rate: successRate,
      total_cb_count: totalCbCount,
      total_cb_amount: totalCbAmount,
      overall_cb_ratio: overallCbRatio,
      kyc_verified_pct: kycVerifiedPct,
      kyc_rejected_pct: kycRejectedPct,
      kyc_pending_pct: kycPendingPct,
      repeated_dispute_users_count: repeatUsers
    };

    return copy;
  }, [filters]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'notebook', label: 'ML Notebook', icon: FileCode2 },
    { id: 'merchants', label: 'Merchant Risk', icon: Store },
    { id: 'correlations', label: 'Fraud Hub', icon: ShieldAlert }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setIsAiOpen={setIsAiOpen}
        setIsDriveOpen={setIsDriveOpen}
        setIsNotebookOpen={setIsNotebookOpen}
        onResetFilters={onResetFilters}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-4">
        
        {/* Top Controls & Spotify Pill Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          
          {/* Spotify Pill Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {tabs.map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'notebook') {
                      setIsNotebookOpen(true);
                    } else {
                      setActiveTab(tab.id);
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
                    isActive ? 'spotify-pill-tab-active' : 'spotify-pill-tab'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Dynamic Slicers Bar */}
        <SlicersBar
          filters={filters}
          setFilters={setFilters}
          categories={categories}
          onReset={onResetFilters}
        />

        {/* Compact KPI Cards Grid (Connected to Data Slicing) */}
        <KPICards kpis={filteredDataset.kpis} />

        {/* Dynamic Section Content */}
        <div className="transition-all duration-200">
          {activeTab === 'overview' && <OverviewSection data={filteredDataset} />}
          {activeTab === 'merchants' && <MerchantRiskSection data={filteredDataset} />}
          {activeTab === 'correlations' && <FraudCorrelationSection data={filteredDataset} />}
        </div>

      </main>

      {/* Floating AI Agent Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsAiOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 bg-[#1ed760] hover:bg-[#1fdf64] text-black font-extrabold text-xs rounded-full shadow-2xl transition-all duration-200 transform hover:scale-105 active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-black fill-black" />
          <span>Merchant Ring AI</span>
          <span className="w-2 h-2 rounded-full bg-black animate-ping"></span>
        </button>
      </div>

      {/* AI Q&A Agent Panel Drawer */}
      <AIAgentPanel
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        dataset={filteredDataset}
      />

      {/* Google Drive Link Modal */}
      <DriveModal
        isOpen={isDriveOpen}
        onClose={() => setIsDriveOpen(false)}
      />

      {/* Full-Screen Dark Original ML Notebook Modal */}
      <NotebookModal
        isOpen={isNotebookOpen}
        onClose={() => setIsNotebookOpen(false)}
      />

      {/* Dashboard Footer */}
      <footer className="bg-[#0a0a0a] border-t border-[#1f1f1f] mt-12 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-bold text-slate-400">Merchant Ring — Analytics & Fraud Engine</span>
          <span className="font-mono text-[11px] text-slate-500">20,000 UPI Transactions Standardized</span>
        </div>
      </footer>

    </div>
  );
}

function round(val) {
  return Math.round(val * 100) / 100;
}
