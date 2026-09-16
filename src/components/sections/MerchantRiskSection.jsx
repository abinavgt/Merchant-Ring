import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend, Cell 
} from 'recharts';
import { Store, AlertTriangle, ShieldCheck, Clock, Layers, Flame } from 'lucide-react';

const CATEGORY_SPECTRUM = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f59e0b', '#1ed760', '#38bdf8', '#06b6d4'];
const TICKET_SPECTRUM = ['#38bdf8', '#8b5cf6', '#d946ef', '#f43f5e', '#f59e0b'];

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: '#181818', borderColor: '#333333', borderRadius: '12px', fontSize: '11px', color: '#ffffff' },
  itemStyle: { color: '#ffffff', fontSize: '11px' },
  labelStyle: { color: '#ffffff', fontWeight: 'bold', fontSize: '11px' }
};

export default function MerchantRiskSection({ data }) {
  if (!data) return null;

  const catCb = data.joins?.category_vs_chargeback || [];
  const topMchCb = data.joins?.top_merchants_by_cb || [];
  const topMchRatio = data.joins?.top_merchants_by_ratio || [];
  const utrVsFailure = data.joins?.utr_vs_failure || [];
  const hourlyFailure = data.joins?.hourly_failure || [];
  const ticketVsCb = data.joins?.ticket_size_vs_cb || [];

  return (
    <div className="space-y-5">

      {/* Row 1: Merchant Category Chargebacks & Ticket Size Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Merchant Category Chargeback Rate */}
        <div className="spotify-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1.5">
              <Store className="w-4 h-4 text-[#38bdf8]" />
              Merchant Category ↔ Chargeback Rate & Amount
            </h3>
            <p className="text-xs text-slate-400 mt-1">MCC category risk performance breakdown</p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catCb.slice(0, 8)} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <XAxis dataKey="merchant_category" stroke="#64748b" fontSize={10} tickLine={false} interval={0} angle={-25} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={TOOLTIP_STYLE.contentStyle}
                  itemStyle={TOOLTIP_STYLE.itemStyle}
                  labelStyle={TOOLTIP_STYLE.labelStyle}
                  formatter={(val, name) => [name === 'cb_amount' ? `₹${val.toLocaleString()}` : `${val}%`, name === 'cb_amount' ? 'Disputed Amount' : 'CB Rate %']}
                />
                <Bar dataKey="cb_rate" name="Chargeback Rate %" radius={[4, 4, 0, 0]}>
                  {catCb.slice(0, 8).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_SPECTRUM[index % CATEGORY_SPECTRUM.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Declared Ticket Size ↔ Merchant Chargeback Rate */}
        <div className="spotify-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1.5">
              <Layers className="w-4 h-4 text-[#a855f7]" />
              Declared Ticket Size ↔ Merchant Chargeback Rate
            </h3>
            <p className="text-xs text-slate-400 mt-1">Impact of average ticket size bracket on dispute rates</p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ticketVsCb} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="ticket_bin" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} unit="%" />
                <Tooltip 
                  contentStyle={TOOLTIP_STYLE.contentStyle} 
                  itemStyle={TOOLTIP_STYLE.itemStyle}
                  labelStyle={TOOLTIP_STYLE.labelStyle}
                />
                <Bar dataKey="avg_cb_rate" name="Avg CB Rate %" radius={[4, 4, 0, 0]}>
                  {ticketVsCb.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={TICKET_SPECTRUM[index % TICKET_SPECTRUM.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 2: Top High-Risk Merchants Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Top Merchants by Chargeback Count */}
        <div className="spotify-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1.5">
              <Flame className="w-4 h-4 text-rose-400" />
              Top 10 Merchants by Chargeback Count
            </h3>
            <p className="text-xs text-slate-400 mt-1">Highest volume dispute target merchants</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#181818] text-slate-400 font-semibold border-b border-[#282828] uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3">Merchant ID</th>
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3 text-right">CB Count</th>
                  <th className="py-2 px-3 text-right">Disputed Vol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222] font-mono">
                {topMchCb.map((m, i) => (
                  <tr key={i} className="hover:bg-[#181818] transition-all">
                    <td className="py-2 px-3 font-semibold text-[#38bdf8]">{m.merchant_id}</td>
                    <td className="py-2 px-3 font-sans text-white font-medium">{m.merchant_name}</td>
                    <td className="py-2 px-3 text-right text-rose-400 font-bold">{m.cb_count}</td>
                    <td className="py-2 px-3 text-right text-[#1ed760] font-semibold">₹{m.cb_amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Merchants by Chargeback-to-Txn Ratio */}
        <div className="spotify-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Top Merchants by Chargeback-to-Txn Ratio
            </h3>
            <p className="text-xs text-slate-400 mt-1">Merchants with disproportionately high dispute rates</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#181818] text-slate-400 font-semibold border-b border-[#282828] uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3">Merchant ID</th>
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3 text-right">Txns</th>
                  <th className="py-2 px-3 text-right">CB Ratio %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222] font-mono">
                {topMchRatio.map((m, i) => (
                  <tr key={i} className="hover:bg-[#181818] transition-all">
                    <td className="py-2 px-3 font-semibold text-purple-300">{m.merchant_id}</td>
                    <td className="py-2 px-3 font-sans text-white font-medium">{m.merchant_name}</td>
                    <td className="py-2 px-3 text-right text-slate-400">{m.total_txns}</td>
                    <td className="py-2 px-3 text-right font-bold text-rose-400 bg-rose-500/10 rounded">{m.cb_ratio}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Row 3: UTR Validity & Hourly Failure Line */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* UTR Validity vs Failures / Chargebacks */}
        <div className="spotify-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              UTR Validity ↔ Failures & Disputes
            </h3>
            <p className="text-xs text-slate-400 mt-1">Missing or malformed UTR numbers vs failure rates</p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utrVsFailure} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="utr_status" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={TOOLTIP_STYLE.contentStyle} 
                  itemStyle={TOOLTIP_STYLE.itemStyle}
                  labelStyle={TOOLTIP_STYLE.labelStyle}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="failure_rate" name="Failure Rate %" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cb_rate" name="Chargeback Rate %" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transaction Hour (0-23h) ↔ Failure Rate */}
        <div className="spotify-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1.5">
              <Clock className="w-4 h-4 text-[#38bdf8]" />
              Transaction Hour (0-23h) ↔ Failure Rate %
            </h3>
            <p className="text-xs text-slate-400 mt-1">Hourly technical dropouts and failure spikes</p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyFailure} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={(h) => `${h}h`} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} unit="%" />
                <Tooltip 
                  contentStyle={TOOLTIP_STYLE.contentStyle} 
                  itemStyle={TOOLTIP_STYLE.itemStyle}
                  labelStyle={TOOLTIP_STYLE.labelStyle}
                />
                <Line type="monotone" dataKey="failure_rate" name="Failure Rate %" stroke="#38bdf8" strokeWidth={3} dot={{ r: 3, fill: '#38bdf8' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
