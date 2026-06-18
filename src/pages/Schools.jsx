import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus, Search, School as SchoolIcon, MapPin, GraduationCap, Users,
  LayoutGrid, List, ChevronRight,
} from 'lucide-react';
import { useData } from '../data/store.jsx';
import { useToast } from '../components/Toast.jsx';
import Modal from '../components/Modal.jsx';
import { StatusBadge, Empty, Avatar } from '../components/ui.jsx';
import { PLAN_TIERS } from '../data/seed.js';
import { dateStr } from '../utils/format.js';

const STATUS_FILTERS = ['all', 'active', 'trial', 'suspended'];

export default function Schools() {
  const { schools, addSchool } = useData();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [q, setQ] = useState(params.get('q') || '');
  const [status, setStatus] = useState('all');
  const [view, setView] = useState('grid');
  const [showAdd, setShowAdd] = useState(false);

  const filtered = useMemo(() => {
    return schools.filter((s) => {
      const matchQ = !q || `${s.name} ${s.shortName} ${s.city} ${s.state} ${s.code}`.toLowerCase().includes(q.toLowerCase());
      const matchS = status === 'all' || s.status === status;
      return matchQ && matchS;
    });
  }, [schools, q, status]);

  return (
    <div className="page">
      <div className="flex items-center justify-between wrap gap mb">
        <div>
          <h1 className="page-title">Schools</h1>
          <p className="page-sub">{schools.length} schools on the platform · {schools.filter(s => s.status === 'active').length} active</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={17} /> Onboard School</button>
      </div>

      <div className="card mb">
        <div className="card-pad flex items-center gap wrap">
          <div className="topbar-search flex-1" style={{ display: 'flex', minWidth: 200 }}>
            <Search size={16} className="text-muted" />
            <input placeholder="Search by name, city, code…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="flex gap-sm wrap">
            {STATUS_FILTERS.map((f) => (
              <button key={f} className={`btn btn-sm ${status === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setStatus(f)} style={{ textTransform: 'capitalize' }}>{f}</button>
            ))}
          </div>
          <div className="flex gap-sm">
            <button className={`icon-btn ${view === 'grid' ? '' : ''}`} onClick={() => setView('grid')} style={{ background: view === 'grid' ? 'var(--bg-alt)' : '', color: view === 'grid' ? 'var(--blue)' : '' }}><LayoutGrid size={18} /></button>
            <button className="icon-btn" onClick={() => setView('list')} style={{ background: view === 'list' ? 'var(--bg-alt)' : '', color: view === 'list' ? 'var(--blue)' : '' }}><List size={18} /></button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card"><Empty icon={SchoolIcon} title="No schools found" sub="Try adjusting your search or filters." action={<button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={16} /> Onboard a school</button>} /></div>
      ) : view === 'grid' ? (
        <div className="grid grid-auto">
          {filtered.map((s) => (
            <div key={s.id} className="school-card" onClick={() => navigate(`/schools/${s.id}`)} style={{ cursor: 'pointer' }}>
              <div className="school-banner" style={{ background: s.bannerColor }}>
                <div className="school-logo">{s.code}</div>
              </div>
              <div style={{ padding: '36px 18px 18px' }}>
                <div className="flex items-center justify-between gap-sm">
                  <h3 className="truncate" style={{ fontSize: 16, fontWeight: 800 }}>{s.shortName}</h3>
                  <StatusBadge status={s.status} />
                </div>
                <p className="cell-sub flex items-center gap-sm" style={{ marginTop: 4 }}><MapPin size={13} /> {s.city}, {s.state}</p>
                <div className="flex gap-lg" style={{ marginTop: 14 }}>
                  <div className="flex items-center gap-sm"><GraduationCap size={16} className="text-muted" /><b>{(s.counts?.students || 0).toLocaleString()}</b><span className="cell-sub">students</span></div>
                  <div className="flex items-center gap-sm"><Users size={16} className="text-muted" /><b>{s.counts?.teachers || 0}</b><span className="cell-sub">staff</span></div>
                </div>
                <div className="divider" />
                <div className="flex items-center justify-between">
                  <span className={`badge badge-${PLAN_TIERS[s.plan]?.color}`}>{PLAN_TIERS[s.plan]?.label}</span>
                  <span className="btn btn-sm btn-ghost">Open <ChevronRight size={14} /></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>School</th><th>Location</th><th>Plan</th><th>Students</th><th>Staff</th><th>Onboarded</th><th>Status</th></tr></thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="row-click" onClick={() => navigate(`/schools/${s.id}`)}>
                    <td><div className="flex items-center gap-sm"><Avatar name={s.code} color={s.bannerColor} /><div><div className="cell-main">{s.shortName}</div><div className="cell-sub">{s.type}</div></div></div></td>
                    <td>{s.city}, {s.state}</td>
                    <td><span className={`badge badge-${PLAN_TIERS[s.plan]?.color}`}>{PLAN_TIERS[s.plan]?.label}</span></td>
                    <td className="fw-800">{(s.counts?.students || 0).toLocaleString()}</td>
                    <td>{s.counts?.teachers || 0}</td>
                    <td className="cell-sub">{dateStr(s.onboardedAt)}</td>
                    <td><StatusBadge status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAdd && (
        <AddSchoolModal
          onClose={() => setShowAdd(false)}
          onSave={(data) => {
            const id = addSchool(data);
            toast.success(`${data.name} onboarded successfully`);
            setShowAdd(false);
            navigate(`/schools/${id}`);
          }}
        />
      )}
    </div>
  );
}

function AddSchoolModal({ onClose, onSave }) {
  const [f, setF] = useState({
    name: '', shortName: '', code: '', type: 'Secondary', plan: 'starter',
    city: '', state: '', country: 'Nigeria', email: '', phone: '', principalName: '',
  });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const valid = f.name.trim() && f.city.trim() && f.email.trim();

  return (
    <Modal
      title="Onboard a new school"
      onClose={onClose}
      large
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!valid}
            onClick={() => onSave({ ...f, shortName: f.shortName || f.name })}>
            <Plus size={16} /> Create school
          </button>
        </>
      }
    >
      <div className="form-row">
        <div className="field"><label>School name *</label><input className="input" value={f.name} onChange={set('name')} placeholder="e.g. Bright Future College" /></div>
        <div className="field"><label>Short / display name</label><input className="input" value={f.shortName} onChange={set('shortName')} placeholder="e.g. Bright Future" /></div>
      </div>
      <div className="form-row">
        <div className="field"><label>Code</label><input className="input" value={f.code} onChange={set('code')} placeholder="e.g. BFC" maxLength={5} /></div>
        <div className="field"><label>School type</label>
          <select className="select" value={f.type} onChange={set('type')}>
            {['Nursery', 'Primary', 'Secondary', 'Primary & Secondary', 'Tertiary'].map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="field"><label>City / Area *</label><input className="input" value={f.city} onChange={set('city')} placeholder="e.g. Ikeja" /></div>
        <div className="field"><label>State</label><input className="input" value={f.state} onChange={set('state')} placeholder="e.g. Lagos" /></div>
      </div>
      <div className="form-row">
        <div className="field"><label>Contact email *</label><input className="input" type="email" value={f.email} onChange={set('email')} placeholder="admin@school.edu.ng" /></div>
        <div className="field"><label>Phone</label><input className="input" value={f.phone} onChange={set('phone')} placeholder="+234 ..." /></div>
      </div>
      <div className="form-row">
        <div className="field"><label>Principal / Head name</label><input className="input" value={f.principalName} onChange={set('principalName')} placeholder="e.g. Mrs. Jane Doe" /></div>
        <div className="field"><label>Subscription plan</label>
          <select className="select" value={f.plan} onChange={set('plan')}>
            {Object.entries(PLAN_TIERS).map(([k, t]) => <option key={k} value={k}>{t.label} — up to {t.maxStudents.toLocaleString()} students</option>)}
          </select>
        </div>
      </div>
      <p className="hint">The school is created on a <b>Trial</b> status with default app modules enabled. You can import students and configure modules from the school page.</p>
    </Modal>
  );
}
