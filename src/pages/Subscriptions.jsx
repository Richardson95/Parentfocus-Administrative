import { useNavigate } from 'react-router-dom';
import { Wallet, TrendingUp, CreditCard, Building2 } from 'lucide-react';
import { useData } from '../data/store.jsx';
import { StatCard, StatusBadge, Avatar } from '../components/ui.jsx';
import { PLAN_TIERS } from '../data/seed.js';
import { naira, dateStr, compact } from '../utils/format.js';

export default function Subscriptions() {
  const { schools } = useData();
  const navigate = useNavigate();

  const active = schools.filter((s) => s.status === 'active');
  const mrr = active.reduce((a, s) => a + (PLAN_TIERS[s.plan]?.price || 0), 0);
  const arr = mrr * 12;
  const trials = schools.filter((s) => s.status === 'trial').length;

  return (
    <div className="page">
      <div className="mb"><h1 className="page-title">Subscriptions & Billing</h1><p className="page-sub">Revenue and plan management across all schools.</p></div>

      <div className="grid grid-stats mb">
        <StatCard icon={Wallet} label="Monthly recurring revenue" value={naira(mrr)} trend="+15%" color="linear-gradient(135deg,#059669,#10B981)" />
        <StatCard icon={TrendingUp} label="Annualised revenue" value={naira(arr)} color="linear-gradient(135deg,#1A3A6B,#2563EB)" />
        <StatCard icon={CreditCard} label="Paying schools" value={active.length} color="linear-gradient(135deg,#7C3AED,#8B5CF6)" />
        <StatCard icon={Building2} label="Schools on trial" value={trials} trend="convert" trendDir="up" color="linear-gradient(135deg,#D97706,#F59E0B)" />
      </div>

      <div className="grid grid-3 mb">
        {Object.entries(PLAN_TIERS).map(([key, t]) => {
          const count = schools.filter((s) => s.plan === key).length;
          const revenue = schools.filter((s) => s.plan === key && s.status === 'active').reduce((a) => a + t.price, 0);
          return (
            <div key={key} className="card">
              <div className="card-pad">
                <div className="flex items-center justify-between"><span className={`badge badge-${t.color}`}>{t.label}</span><b className="cell-sub">{count} schools</b></div>
                <div className="stat-val" style={{ fontSize: 26, margintop: 10, marginTop: 12 }}>{naira(t.price)}<span className="cell-sub" style={{ fontSize: 13 }}> /mo</span></div>
                <p className="cell-sub">Up to {t.maxStudents.toLocaleString()} students</p>
                <div className="divider" />
                <div className="flex items-center justify-between text-sm"><span className="text-muted">Plan revenue</span><b>{naira(revenue)}</b></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-head"><h3>Per-School Billing</h3></div>
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>School</th><th>Plan</th><th>Monthly</th><th>Students</th><th>Contract ends</th><th>Status</th></tr></thead>
            <tbody>
              {schools.map((s) => {
                const t = PLAN_TIERS[s.plan];
                return (
                  <tr key={s.id} className="row-click" onClick={() => navigate(`/schools/${s.id}`)}>
                    <td><div className="flex items-center gap-sm"><Avatar name={s.code} color={s.bannerColor} /><div><div className="cell-main">{s.shortName}</div><div className="cell-sub">{s.city}</div></div></div></td>
                    <td><span className={`badge badge-${t?.color}`}>{t?.label}</span></td>
                    <td className="fw-800">{s.status === 'active' ? naira(t?.price) : <span className="text-muted">—</span>}</td>
                    <td>{compact(s.counts?.students || 0)}</td>
                    <td className="cell-sub">{dateStr(s.contractEnds)}</td>
                    <td><StatusBadge status={s.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
