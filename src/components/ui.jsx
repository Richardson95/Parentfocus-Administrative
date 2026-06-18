import { Inbox } from 'lucide-react';
import { STATUS_META } from '../utils/format.js';

export function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.inactive;
  return (
    <span className={`badge ${m.cls}`}>
      <span className="dot-status" style={{ background: m.dot }} />
      {m.label}
    </span>
  );
}

export function Badge({ children, variant = 'muted' }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

export function Empty({ icon: Icon = Inbox, title, sub, action }) {
  return (
    <div className="empty">
      <div className="empty-icon"><Icon size={28} /></div>
      <h3 style={{ color: 'var(--text)', fontSize: 16 }}>{title}</h3>
      {sub && <p style={{ marginTop: 4 }}>{sub}</p>}
      {action && <div className="mt">{action}</div>}
    </div>
  );
}

export function Avatar({ name, size = 36, color }) {
  const init = (name || '?').replace(/(Mr|Mrs|Miss|Ms|Dr|Mallam|Alhaji|Prof)\.?\s*/gi, '')
    .trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.36, background: color }}>
      {init}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, trend, trendDir = 'up', color = 'var(--blue)' }) {
  return (
    <div className="stat">
      <div className="flex items-center justify-between">
        <div className="stat-icon" style={{ background: color }}><Icon size={22} /></div>
        {trend && (
          <span className={`stat-trend ${trendDir}`}>{trend}</span>
        )}
      </div>
      <div>
        <div className="stat-val">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange }) {
  return (
    <label className="switch">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="track" />
    </label>
  );
}
