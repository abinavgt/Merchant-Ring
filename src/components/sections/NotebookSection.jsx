import React, { useState } from 'react';
import { ExternalLink, CheckCircle, Database, Copy, Check, Terminal } from 'lucide-react';

export default function NotebookSection({ setIsDriveOpen }) {
  const [copied, setCopied] = useState(false);
  const [driveUrl, setDriveUrl] = useState('https://drive.google.com/file/d/1pETidFS3FPGsYZ954KTSwgMypW1NsH6U/view?usp=sharing');

  const copyDriveLink = () => {
    navigator.clipboard.writeText(driveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleaningSteps = [
    { 
      step: '1. Transaction File Preprocessing', 
      detail: 'Deduplicated unique txn_id records, standardized user_id & merchant_id to uppercase string without spaces, parsed timestamps, cleaned currency symbols using regex (?i)rs\\.?|₹|inr, and mapped 12 status variants into Success, Failed, or Pending.' 
    },
    { 
      step: '2. KYC Records Master Cleanup', 
      detail: 'Standardized user_id, formatted full_name to Title Case, cleaned PAN format, validated 12-digit numeric Aadhaar IDs, parsed monthly income with "k" multipliers (e.g. 27.3k → 27,300), and mapped KYC status & risk segments.' 
    },
    { 
      step: '3. Merchant Master Normalization', 
      detail: 'Standardized merchant_id, formatted merchant_name, trimmed MCC codes, uppercase business_type & city names, parsed onboarding_date, and cleaned declared_avg_ticket_size.' 
    },
    { 
      step: '4. Chargebacks JSON Flattening', 
      detail: 'Flattened nested JSON complaints, standardized user_id & merchant_id, deduplicated txn_id, parsed timestamps (transaction, reported, bank response), converted disputed_amount, categorized complaints, and mapped severity levels.' 
    },
    { 
      step: '5. Multi-Table Master Data Join Matrix', 
      detail: 'Joined UPI Transactions, KYC Records, Merchant Master, and Chargeback Complaints into a unified analysis bundle for Merchant Ring KPI & correlation calculations.' 
    }
  ];

  const notebookSnippets = [
    {
      title: "1. Data Ingestion & Library Setup",
      executionTime: "0.18s",
      code: `import numpy as np
import pandas as pd
import json
import re
import warnings
warnings.filterwarnings('ignore')

# Load raw dataset files
transaction = pd.read_csv('Fintech/track1_upi_transactions.csv')
merchants = pd.read_csv('Fintech/track1_merchants_master.csv')
kyc = pd.read_csv('Fintech/track1_kyc_records.csv')

with open('Fintech/track1_chargebacks.json') as j:
    chargebacks = pd.DataFrame(json.load(j))`
    },
    {
      title: "2. Transaction Cleaning & Status Mapping",
      executionTime: "0.24s",
      code: `txn = transaction.copy()
txn['txn_id'] = txn['txn_id'].astype('string').str.strip().str.upper()
txn = txn.drop_duplicates(subset='txn_id', keep='first')

txn['user_id'] = txn['user_id'].astype('string').str.strip().str.upper().str.replace(r'\\s+', '', regex=True)
txn['merchant_id'] = txn['merchant_id'].astype('string').str.strip().str.upper().str.replace(r'\\s+', '', regex=True)

# Amount Regex Cleaning
txn['amount'] = (txn['amount'].astype(str)
                 .str.replace(r'(?i)rs\\.?|₹|inr', '', regex=True)
                 .str.replace(',', '', regex=False).str.strip())
txn['amount'] = pd.to_numeric(txn['amount'], errors='coerce')`
    },
    {
      title: "3. KYC Master Cleaning & Income Parsing",
      executionTime: "0.21s",
      code: `k = kyc.copy()
k['user_id'] = k['user_id'].astype('string').str.strip().str.upper()
k['full_name'] = k['full_name'].astype(str).str.strip().str.title()
k['pan'] = k['pan'].astype('string').str.strip().str.upper()

# Monthly Income Parsing (multiplier for 'k')
def parse_income(val):
    if pd.isna(val): return np.nan
    s = str(val).lower().replace('rs', '').replace('₹', '').replace(',', '').strip()
    if 'k' in s:
        return float(s.replace('k', '')) * 1000
    return pd.to_numeric(s, errors='coerce')

k['monthly_income'] = k['monthly_income'].apply(parse_income)
k['kyc_status'] = k['kyc_status'].astype('string').str.strip().str.upper()`
    },
    {
      title: "4. Chargebacks JSON Processing",
      executionTime: "0.19s",
      code: `js = chargebacks.copy()
js['user_id'] = js['user_id'].astype('string').str.strip().str.upper()
js['merchant_id'] = js['merchant_id'].astype('string').str.strip().str.upper()
js = js.drop_duplicates(subset='txn_id', keep='first')

js['disputed_amount'] = (js['disputed_amount'].astype('string')
                         .str.replace(r'(?i)rs\\.?|₹|inr', '', regex=True)
                         .str.replace(',', '', regex=False).str.strip())
js['disputed_amount'] = pd.to_numeric(js['disputed_amount'], errors='coerce')`
    }
  ];

  return (
    <div className="space-y-5">

      {/* Google Drive CSV Dataset Banner */}
      <div className="spotify-card p-6 border-[#1ed760]/30 bg-gradient-to-r from-[#0d1f14] via-[#121212] to-[#121212]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-[#1ed760]/10 border border-[#1ed760]/30 text-[#1ed760] rounded-xl">
                <Database className="w-5 h-5" />
              </span>
              <h2 className="text-base font-bold text-white">Public Google Drive CSV & Dataset Link</h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">
              Access the raw and preprocessed datasets directly on Google Drive. You can copy the public link or open it directly in a new browser tab.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <input
              type="text"
              value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
              className="bg-[#181818] border border-[#282828] rounded-full px-3.5 py-1.5 text-xs text-[#1ed760] outline-none w-full sm:w-80 font-mono"
            />
            <button
              onClick={copyDriveLink}
              className="px-4 py-2 bg-[#1ed760] hover:bg-[#1fdf64] text-black font-bold text-xs rounded-full flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
            <a
              href={driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#181818] hover:bg-[#282828] text-slate-200 border border-[#282828] font-semibold text-xs rounded-full flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Drive</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Preprocessing Steps Audit */}
      <div className="spotify-card p-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <CheckCircle className="w-4 h-4 text-[#1ed760]" />
          Data Preprocessing & Cleaning Rules Audit Trail (`data-cleaned.ipynb`)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {cleaningSteps.map((step, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-[#181818] border border-[#282828] space-y-1">
              <span className="text-xs font-bold text-[#1ed760] block">{step.step}</span>
              <p className="text-xs text-slate-400 leading-relaxed">{step.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Embedded Jupyter Notebook View */}
      <div className="spotify-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-400" />
            Interactive ML Notebook Execution View (`data-cleaned.ipynb`)
          </h3>
          <span className="text-[10px] font-mono px-2.5 py-0.5 bg-[#181818] text-[#1ed760] border border-[#282828] rounded-full font-bold">
            Python 3.10 Kernel (Cleaned)
          </span>
        </div>

        <div className="space-y-3">
          {notebookSnippets.map((cell, idx) => (
            <div key={idx} className="rounded-xl overflow-hidden border border-[#282828] bg-[#0a0a0a]">
              <div className="bg-[#141414] px-4 py-2 border-b border-[#282828] flex items-center justify-between text-xs font-mono text-slate-400">
                <span>In [{idx + 1}]: {cell.title}</span>
                <span className="text-[#1ed760] text-[10px] font-bold">Executed ({cell.executionTime})</span>
              </div>
              <pre className="p-4 text-xs font-mono text-indigo-200 overflow-x-auto leading-relaxed">
                <code>{cell.code}</code>
              </pre>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
