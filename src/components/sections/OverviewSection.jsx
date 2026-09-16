import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell 
} from 'recharts';
import { TrendingUp, CheckCircle2, ShieldAlert, BarChart3 } from 'lucide-react';

const REASON_COLORS = ['#f43f5e', '#f59e0b', '#a855f7', '#38bdf8', '#1ed760'];
const TARGET_MONTHS = ['jan', 'feb', 'mar', 'jun', 'nov'];

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: '#181818', borderColor: '#333333', borderRadius: '12px', fontSize: '11px', color: '#ffffff' },
  itemStyle: { color: '#ffffff', fontSize: '11px' },
  labelStyle: { color: '#ffffff', fontWeight: 'bold', fontSize: '11px' }
};

export default function OverviewSection({ data }) {
  if (!data) return null;

  const [timeGranularity, setTimeGranularity] = useState('daily');

  const dailyTrend = data.trends?.daily || [];
  const rawMonthlyTrend = data.trends?.monthly || [];
  const reasons = data.trends?.reasons || [];

  const filteredMonthlyTrend = rawMonthlyTrend.filter((item) => {
    const mStr = (item.month_str || '').toLowerCase();
    return TARGET_MONTHS.some((tm) => mStr.includes(tm));
  });

  const activeTrendData = timeGranularity === 'daily' ? dailyTrend : filteredMonthlyTrend;
  const xKey = timeGranularity === 'daily' ? 'formatted_date' : 'month_str';

  const tickInterval = timeGranularity === 'daily' 
    ? Math.max(1, Math.ceil(dailyTrend.length / 8))
    : 0;

  return (
    <div className="space-y-5">
      
      {/* Figure 1: Transaction Volume & Amount Trend */}
      <div className="spotify-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-1.5">
              <TrendingUp className="w-4 h-4 text-[#38bdf8]" />
              Transaction Volume & Amount Trend
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {timeGranularity === 'daily' ? 'Date-wise transaction count and value' : 'Monthly trend overview (Jan, Feb, Mar, Jun, Nov)'}
            </p>
          </div>

          {/* Time Granularity Toggle Switch */}
          <div className="flex items-center gap-2">
            <div className="bg-[#181818] border border-[#282828] p-1 rounded-full flex items-center gap-1 text-xs">
              <button
                onClick={() => setTimeGranularity('daily')}
                className={`px-3 py-1 rounded-full font-bold text-[11px] transition-all ${
                  timeGranularity === 'daily'
                    ? 'bg-[#ffffff] text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Date-wise
              </button>
              <button
                onClick={() => setTimeGranularity('monthly')}
                className={`px-3 py-1 rounded-full font-bold text-[11px] transition-all ${
                  timeGranularity === 'monthly'
                    ? 'bg-[#ffffff] text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activeTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1ed760" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#1ed760" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey={xKey} 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                interval={tickInterval} 
              />
              <YAxis yAxisId="left" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} />
              <Tooltip 
                contentStyle={TOOLTIP_STYLE.contentStyle} 
                itemStyle={TOOLTIP_STYLE.itemStyle}
                labelStyle={TOOLTIP_STYLE.labelStyle}
                formatter={(val, name) => [name === 'txn_amount' ? `₹${val.toLocaleString()}` : val.toLocaleString(), name === 'txn_amount' ? 'Total Amount' : 'Txn Volume']}
              />
              <Area yAxisId="left" type="monotone" dataKey="txn_count" stroke="#38bdf8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCount)" name="Txn Count" />
              <Area yAxisId="right" type="monotone" dataKey="txn_amount" stroke="#1ed760" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAmount)" name="Txn Amount" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Figure 2 & Figure 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Figure 2: Successful vs Failed Transactions */}
        <div className="spotify-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#1ed760]" />
              Successful vs Failed Transactions
            </h3>
            <p className="text-xs text-slate-400 mt-1">Green (Success) vs Red (Failed) daily logs</p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey={xKey} stroke="#64748b" fontSize={10} tickLine={false} interval={tickInterval} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={TOOLTIP_STYLE.contentStyle} 
                  itemStyle={TOOLTIP_STYLE.itemStyle}
                  labelStyle={TOOLTIP_STYLE.labelStyle}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="success_count" name="Success" fill="#1ed760" stackId="a" radius={[0, 0, 4, 4]} />
                <Bar dataKey="failed_count" name="Failed" fill="#ef4444" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Figure 3: Mapped Chargeback Category Breakdown */}
        <div className="spotify-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1.5">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              Chargeback Reason Category Mapping
            </h3>
            <p className="text-xs text-slate-400 mt-1">Mapped 5 core complaint categories</p>
          </div>

          <div className="h-60 w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reasons} layout="vertical" margin={{ top: 5, right: 15, left: -10, bottom: 5 }}>
                <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis type="category" dataKey="category" stroke="#64748b" fontSize={10} tickLine={false} width={155} tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={TOOLTIP_STYLE.contentStyle} 
                  itemStyle={TOOLTIP_STYLE.itemStyle}
                  labelStyle={TOOLTIP_STYLE.labelStyle}
                  formatter={(val) => [`${val} complaints`, 'Dispute Count']}
                />
                <Bar dataKey="count" name="Disputes" radius={[0, 6, 6, 0]}>
                  {reasons.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={REASON_COLORS[index % REASON_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Empirical Data Key Insight Callout */}
      <div className="p-4 rounded-2xl bg-[#141414] border border-[#282828] flex items-center gap-3">
        <div className="p-2.5 rounded-full bg-[#1ed760]/10 border border-[#1ed760]/30 text-[#1ed760] flex-shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white font-bold uppercase tracking-wider text-[11px] block mb-0.5">High-Value Data Insight:</strong> 
          <span>
            Dispute analysis identifies <strong className="text-[#1ed760]">983 chargebacks (62.4%)</strong> originating from Unauthorized Fraud and Service Non-Delivery. High-risk merchants exhibit a <strong className="text-rose-400">33.3% chargeback ratio</strong>, while 128 repeat dispute users drive <strong className="text-amber-300">₹2.4M</strong> in disputed volume.
          </span>
        </div>
      </div>

    </div>
  );
}
