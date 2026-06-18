import { useState } from 'react';
import { Megaphone, Send, Users, Clock } from 'lucide-react';
import { useData } from '../data/store.jsx';
import { useToast } from '../components/Toast.jsx';
import { Empty } from '../components/ui.jsx';
import { dateTimeStr, compact } from '../utils/format.js';
import { PLAN_TIERS } from '../data/seed.js';

const AUDIENCES = ['All Schools', 'Active only', 'Trial only', 'Premium & Flagship', 'Starter & Growth'];

export default function Broadcasts() {
  const { broadcasts, sendBroadcast, schools } = useData();
  const toast = useToast();
  const [f, setF] = useState({ title: '', audience: 'All Schools', body: '' });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const estimateReach = (audience) => {
    let list = schools;
    if (audience === 'Active only') list = schools.filter((s) => s.status === 'active');
    else if (audience === 'Trial only') list = schools.filter((s) => s.status === 'trial');
    else if (audience === 'Premium & Flagship') list = schools.filter((s) => ['premium', 'flagship'].includes(s.plan));
    else if (audience === 'Starter & Growth') list = schools.filter((s) => ['starter', 'growth'].includes(s.plan));
    return list.reduce((a, s) => a + (s.counts?.parents || 0), 0);
  };

  const send = () => {
    if (!f.title.trim() || !f.body.trim()) return;
    sendBroadcast({ ...f, reach: estimateReach(f.audience) });
    toast.success(`Broadcast sent to ${compact(estimateReach(f.audience))} parents`);
    setF({ title: '', audience: 'All Schools', body: '' });
  };

  return (
    <div className="page">
      <div className="mb"><h1 className="page-title">Broadcasts</h1><p className="page-sub">Send announcements and push notifications to parents across schools.</p></div>

      <div className="grid grid-2">
        <div className="card" style={{ alignSelf: 'flex-start' }}>
          <div className="card-head"><h3>Compose Broadcast</h3><Megaphone size={18} className="text-muted" /></div>
          <div className="card-pad">
            <div className="field"><label>Title *</label><input className="input" value={f.title} onChange={set('title')} placeholder="e.g. Mid-term break notice" /></div>
            <div className="field"><label>Audience</label>
              <select className="select" value={f.audience} onChange={set('audience')}>{AUDIENCES.map((a) => <option key={a}>{a}</option>)}</select>
              <p className="hint flex items-center gap-sm"><Users size={13} /> Estimated reach: <b>{compact(estimateReach(f.audience))}</b> parents</p>
            </div>
            <div className="field"><label>Message *</label><textarea className="textarea" value={f.body} onChange={set('body')} placeholder="Write your announcement…" /></div>
            <button className="btn btn-gold btn-block" disabled={!f.title.trim() || !f.body.trim()} onClick={send} style={{ padding: 12 }}><Send size={16} /> Send broadcast</button>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3>Sent Broadcasts</h3><span className="cell-sub">{broadcasts.length} total</span></div>
          {broadcasts.length === 0 ? <Empty icon={Megaphone} title="No broadcasts yet" sub="Your sent announcements will appear here." /> : (
            <div className="card-pad flex flex-col gap">
              {broadcasts.map((b) => (
                <div key={b.id} className="card" style={{ boxShadow: 'none', border: '1px solid var(--border-soft)' }}>
                  <div className="card-pad">
                    <div className="flex items-center justify-between gap wrap mb"><b>{b.title}</b><span className="badge badge-info">{b.audience}</span></div>
                    <p className="text-sm text-muted">{b.body}</p>
                    <div className="flex gap-lg wrap" style={{ marginTop: 10 }}>
                      <span className="cell-sub flex items-center gap-sm"><Clock size={13} /> {dateTimeStr(b.sentAt)}</span>
                      <span className="cell-sub flex items-center gap-sm"><Users size={13} /> {compact(b.reach)} reached</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
