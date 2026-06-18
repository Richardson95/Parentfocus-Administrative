export const naira = (n) =>
  '₦' + Number(n || 0).toLocaleString('en-NG');

export const compact = (n) => {
  const v = Number(n || 0);
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (v >= 1000) return (v / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(v);
};

export const dateStr = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const dateTimeStr = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export const timeAgo = (iso) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export const initials = (name = '') =>
  name.replace(/(Mr|Mrs|Miss|Ms|Dr|Mallam|Alhaji|Prof)\.?\s*/gi, '')
    .trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

export const STATUS_META = {
  active:    { label: 'Active',    cls: 'badge-success', dot: '#059669' },
  trial:     { label: 'Trial',     cls: 'badge-info',    dot: '#2563EB' },
  suspended: { label: 'Suspended', cls: 'badge-error',   dot: '#DC2626' },
  inactive:  { label: 'Inactive',  cls: 'badge-muted',   dot: '#94A3B8' },
};
