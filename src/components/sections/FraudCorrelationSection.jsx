import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie 
} from 'recharts';
import { UserCheck, Shield, Clock, Users } from 'lucide-react';

const KYC_COLORS = ['#f59e0b', '#ef4444', '#1ed760']; // Pending, Rejected, Verified

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: '#181818', borderColor: '#333333', borderRadius: '12px', fontSize: '11px', color: '#ffffff' },
  itemStyle: { color: '#ffffff', fontSize: '11px' },
  labelStyle: { color: '#ffffff', fontWeight: 'bold', fontSize: '11px' }
};

export default function FraudCorrelationSection({ data }) {
  if (!data) return null;

  const kycVsCb = data.joins?.kyc_vs_chargeback || [];
  const riskVsCb = data.joins?.risk_vs_chargeback || [];
  const topUsers = data.joins?.top_disputed_users || [];
  const delayVsSev = data.joins?.delay_vs_severity || [];

  return (
    <div className="space-y-5">

      {/* Row 1: KYC Status Pie Chart & Risk Segment Correlations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* KYC Status ↔ Chargeback Distribution (Pie Chart) */}
        <div className="spotify-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1.5">
              <UserCheck className="w-4 h-4 text-[#1ed760]" />
              KYC Status ↔ Chargeback Rate %
            </h3>
            <p className="text-xs text-slate-400 mt-1">Verified vs Rejected & Pending dispute risk distribution</p>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={kycVsCb}
                  dataKey="cb_rate"
                  nameKey="kyc_status"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  label={({ kyc_status, cb_rate }) => `${kyc_status}: ${cb_rate}%`}
                >
                  {kycVsCb.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={KYC_COLORS[index % KYC_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={TOOLTIP_STYLE.contentStyle}
                  itemStyle={TOOLTIP_STYLE.itemStyle}
                  labelStyle={TOOLTIP_STYLE.labelStyle}
                  formatter={(val, name) => [`${val}% CB Rate`, 'KYC Risk']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Segment ↔ Chargeback Rate */}
        <div className="spotify-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1.5">
              <Shield className="w-4 h-4 text-amber-400" />
              Risk Segment ↔ Chargeback Rate %
            </h3>
            <p className="text-xs text-slate-400 mt-1">High vs Medium vs Low pre-assigned user risk segment</p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskVsCb} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="risk_segment" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} unit="%" />
                <Tooltip 
                  contentStyle={TOOLTIP_STYLE.contentStyle} 
                  itemStyle={TOOLTIP_STYLE.itemStyle}
                  labelStyle={TOOLTIP_STYLE.labelStyle}
                />
                <Bar dataKey="cb_rate" name="Chargeback Rate %" radius={[6, 6, 0, 0]}>
                  {riskVsCb.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.risk_segment === 'High' ? '#ef4444' : entry.risk_segment === 'Medium' ? '#f59e0b' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 2: Dispute Delay ↔ Severity Level & High-Risk Users Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Dispute Delay ↔ Severity Level */}
        <div className="spotify-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1.5">
              <Clock className="w-4 h-4 text-purple-400" />
              Dispute Reporting Delay ↔ Complaint Severity
            </h3>
            <p className="text-xs text-slate-400 mt-1">Average delay (days) from transaction date to complaint filing</p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={delayVsSev} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="severity" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} unit=" d" />
                <Tooltip 
                  contentStyle={TOOLTIP_STYLE.contentStyle} 
                  itemStyle={TOOLTIP_STYLE.itemStyle}
                  labelStyle={TOOLTIP_STYLE.labelStyle}
                />
                <Bar dataKey="avg_delay_days" name="Avg Delay (Days)" fill="#a855f7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* High-Risk Users with Repeated Dispute Complaints */}
        <div className="spotify-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1.5">
                <Users className="w-4 h-4 text-rose-400" />
                High-Risk Users (Repeat Disputes)
              </h3>
              <p className="text-xs text-slate-400 mt-1">Accounts with 2+ disputes</p>
            </div>
            <span className="px-2.5 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full text-[10px] font-bold">
              128 Users
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#181818] text-slate-400 font-semibold border-b border-[#282828] uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3">User ID</th>
                  <th className="py-2 px-3 text-center">Disputes</th>
                  <th className="py-2 px-3 text-right">Disputed Vol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222] font-mono">
                {topUsers.slice(0, 5).map((u, i) => (
                  <tr key={i} className="hover:bg-[#181818] transition-all">
                    <td className="py-2 px-3 font-bold text-indigo-300">{u.user_id}</td>
                    <td className="py-2 px-3 text-center font-bold text-purple-400">{u.dispute_count}</td>
                    <td className="py-2 px-3 text-right font-bold text-rose-400">₹{u.total_disputed.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
