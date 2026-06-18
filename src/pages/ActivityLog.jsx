import { useState } from 'react';
import { ScrollText, Upload, Megaphone, School, Settings as Cog, Activity } from 'lucide-react';
import { useData } from '../data/store.jsx';
import { Empty } from '../components/ui.jsx';
import { dateTimeStr, timeAgo } from '../utils/format.js';

const TYPE_META = {
  import: { icon: Upload, color: 'linear-gradient(135deg,#0F766E,#14B8A6)', label: 'Import' },
  broadcast: { icon: Megaphone, color: 'linear-gradient(135deg,#D97706,#F59E0B)', label: 'Broadcast' },
  school: { icon: School, color: 'linear-gradient(135deg,#1A3A6B,#2563EB)', label: 'School' },
  status: { icon: Activity, color: 'linear-gradient(135deg,#7C3AED,#8B5CF6)', label: 'Status' },
  config: { icon: Cog, color: 'linear-gradient(135deg,#475569,#94A3B8)', label: 'Config' },
};

export default function ActivityLog() {
  const { activity } = useData();
  const [filter, setFilter] = useState('all');
  const types = ['all', ...Object.keys(TYPE_META)];
  const list = activity.filter((a) => filter === 'all' || a.type === filter);

  return (
    <div className="page">
      <div className="mb"><h1 className="page-title">Activity Log</h1><p className="page-sub">A full audit trail of every action taken in the owner console.</p></div>

      <div className="card mb"><div className="card-pad flex gap-sm wrap">
        {types.map((t) => <button key={t} className={`btn btn-sm ${filter === t ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(t)} style={{ textTransform: 'capitalize' }}>{t === 'all' ? 'All' : TYPE_META[t].label}</button>)}
      </div></div>

      <div className="card">
        {list.length === 0 ? <Empty icon={ScrollText} title="No activity" sub="Nothing logged for this filter yet." /> : (
          <div className="card-pad">
            {list.map((a, i) => {
              const m = TYPE_META[a.type] || TYPE_META.config;
              return (
                <div key={a.id} className="flex gap items-center" style={{ padding: '14px 0', borderBottom: i < list.length - 1 ? '1px solid var(--border-soft)' : 'none' }}>
                  <div className="stat-icon" style={{ width: 40, height: 40, borderRadius: 12, background: m.color }}><m.icon size={18} /></div>
                  <div className="flex-1"><div><b>{a.action}</b> {a.target}</div><div className="cell-sub">{a.actor} · {dateTimeStr(a.at)}</div></div>
                  <span className="cell-sub">{timeAgo(a.at)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
