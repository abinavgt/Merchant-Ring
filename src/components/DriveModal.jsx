import React, { useState } from 'react';
import { Database, ExternalLink, X, Copy, Check, ShieldCheck } from 'lucide-react';

export default function DriveModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [driveUrl, setDriveUrl] = useState('https://drive.google.com/file/d/1pETidFS3FPGsYZ954KTSwgMypW1NsH6U/view?usp=sharing');

  if (!isOpen) return null;

  const copyLink = () => {
    navigator.clipboard.writeText(driveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Google Drive Dataset Access</h3>
              <p className="text-xs text-slate-400">FinTech & BFSI - UPI Fraud Ring & Merchant Analytics Dataset</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800/60 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">
            Public Google Drive Link:
          </label>
          <input
            type="text"
            value={driveUrl}
            onChange={(e) => setDriveUrl(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-indigo-300 outline-none font-mono focus:border-indigo-500"
          />
        </div>

        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center gap-2.5 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>FinTech & BFSI - UPI Fraud Ring & Merchant Analytics Dataset</span>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            onClick={copyLink}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Link'}</span>
          </button>
          <a
            href={driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-indigo-500/20"
          >
            <span>Open in Google Drive</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </div>
  );
}
