import React from 'react';
import { 
  CreditCard, 
  AlertTriangle, 
  Scale, 
  Percent, 
  UserCheck, 
  Users 
} from 'lucide-react';

export default function KPICards({ kpis }) {
  if (!kpis) return null;

  const formatCurrency = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
    return `₹${val.toFixed(0)}`;
  };

  const cards = [
    {
      id: 'kpi-1',
      title: 'Total Volume',
      value: formatCurrency(kpis.total_amount),
      subtext: `${kpis.total_txns.toLocaleString()} txns`,
      icon: CreditCard,
      accent: 'text-[#1ed760]'
    },
    {
      id: 'kpi-2',
      title: 'Failed Rate',
      value: `${kpis.failed_rate}%`,
      subtext: `Pending: ${kpis.pending_rate}%`,
      icon: AlertTriangle,
      accent: 'text-rose-400'
    },
    {
      id: 'kpi-3',
      title: 'Chargebacks',
      value: kpis.total_cb_count.toLocaleString(),
      subtext: formatCurrency(kpis.total_cb_amount),
      icon: Scale,
      accent: 'text-amber-400'
    },
    {
      id: 'kpi-4',
      title: 'Dispute Ratio',
      value: `${kpis.overall_cb_ratio}%`,
      subtext: `Target: < 2.5%`,
      icon: Percent,
      accent: 'text-purple-400'
    },
    {
      id: 'kpi-5',
      title: 'KYC Verified',
      value: `${kpis.kyc_verified_pct}%`,
      subtext: `Rejected: ${kpis.kyc_rejected_pct}%`,
      icon: UserCheck,
      accent: 'text-[#1ed760]'
    },
    {
      id: 'kpi-6',
      title: 'Repeat Disputes',
      value: kpis.repeated_dispute_users_count,
      subtext: `Fraud Ring Users`,
      icon: Users,
      accent: 'text-rose-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            className="spotify-card p-3 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 truncate">
                {card.title}
              </span>
              <IconComponent className={`w-3.5 h-3.5 ${card.accent}`} />
            </div>

            <div className="flex items-baseline justify-between gap-1">
              <span className="text-lg font-black text-white tracking-tight">
                {card.value}
              </span>
            </div>

            <div className="text-[10px] text-slate-400 font-mono mt-1 pt-1 border-t border-[#222222] truncate">
              {card.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}
