import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Mail, Phone, Globe, Calendar, Pencil, Trash2, Plus,
  GraduationCap, Users, Home, CheckCircle2, Crown, ShieldCheck, Upload,
  Download, Search, MoreVertical, Power, PauseCircle, PlayCircle, BookOpen,
  Smartphone, Building2,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useData } from '../data/store.jsx';
import { useToast } from '../components/Toast.jsx';
import Modal from '../components/Modal.jsx';
import ImportModal from '../components/ImportModal.jsx';
import { StatusBadge, Empty, Avatar, Toggle } from '../components/ui.jsx';
import { PLAN_TIERS, APP_MODULES } from '../data/seed.js';
import { dateStr, naira } from '../utils/format.js';

const TABS = ['Overview', 'Authorities', 'Teachers', 'Students', 'App Modules', 'Settings'];

export default function SchoolDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getSchool, setSchoolStatus } = useData();
  const school = getSchool(id);
  const [tab, setTab] = useState('Overview');

  if (!school) {
    return (
      <div className="page">
        <Empty icon={Building2} title="School not found" sub="It may have been removed." action={<Link to="/schools" className="btn btn-primary">Back to schools</Link>} />
      </div>
    );
  }

  return (
    <div className="page">
      <Link to="/schools" className="btn btn-sm btn-ghost mb"><ArrowLeft size={15} /> All schools</Link>

      {/* Banner header */}
      <div className="card mb" style={{ overflow: 'hidden' }}>
        <div style={{ height: 96, background: school.bannerColor }} />
        <div className="card-pad" style={{ paddingTop: 0 }}>
          <div className="flex justify-between wrap gap" style={{ marginTop: -34 }}>
            <div className="flex gap items-end wrap">
              <div className="school-logo" style={{ position: 'static', width: 68, height: 68, fontSize: 22 }}>{school.code}</div>
              <div>
                <div className="flex items-center gap-sm wrap">
                  <h1 style={{ fontSize: 22, fontWeight: 800 }}>{school.name}</h1>
                  <StatusBadge status={school.status} />
                </div>
                <p className="text-muted flex items-center gap-sm" style={{ marginTop: 2 }}>
                  <MapPin size={14} /> {school.address || `${school.city}, ${school.state}`} · {school.type}
                </p>
              </div>
            </div>
            <div className="flex gap-sm wrap" style={{ alignSelf: 'flex-end' }}>
              {school.status === 'suspended' ? (
                <button className="btn btn-ghost" onClick={() => setSchoolStatus(id, 'active')}><PlayCircle size={16} /> Reactivate</button>
              ) : (
                <button className="btn btn-ghost" onClick={() => setSchoolStatus(id, 'suspended')}><PauseCircle size={16} /> Suspend</button>
              )}
              {school.status === 'trial' && <button className="btn btn-gold" onClick={() => setSchoolStatus(id, 'active')}><Power size={16} /> Activate plan</button>}
            </div>
          </div>
        </div>
      </div>

      <div className="card mb"><div className="tabs" style={{ padding: '0 8px' }}>
        {TABS.map((t) => <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>)}
      </div></div>

      {tab === 'Overview' && <Overview school={school} />}
      {tab === 'Authorities' && <Authorities school={school} />}
      {tab === 'Teachers' && <Teachers school={school} />}
      {tab === 'Students' && <Students school={school} />}
      {tab === 'App Modules' && <AppModules school={school} />}
      {tab === 'Settings' && <SettingsTab school={school} onDeleted={() => navigate('/schools')} />}
    </div>
  );
}

/* ---------------- Overview ---------------- */
function Overview({ school }) {
  const stats = [
    { icon: GraduationCap, label: 'Students', value: (school.counts?.students || 0).toLocaleString(), color: 'linear-gradient(135deg,#7C3AED,#8B5CF6)' },
    { icon: BookOpen, label: 'Teachers', value: school.counts?.teachers || 0, color: 'linear-gradient(135deg,#1A3A6B,#2563EB)' },
    { icon: Home, label: 'Parents', value: (school.counts?.parents || 0).toLocaleString(), color: 'linear-gradient(135deg,#0F766E,#14B8A6)' },
    { icon: CheckCircle2, label: 'Attendance', value: `${school.attendanceRate || 0}%`, color: 'linear-gradient(135deg,#D97706,#F59E0B)' },
  ];
  const info = [
    { k: 'School code', v: school.code }, { k: 'Type', v: school.type },
    { k: 'Established', v: school.establishedYear || '—' }, { k: 'Motto', v: school.motto || '—' },
    { k: 'Email', v: school.email }, { k: 'Phone', v: school.phone },
    { k: 'Website', v: school.website || '—' }, { k: 'Country', v: school.country },
    { k: 'Onboarded', v: dateStr(school.onboardedAt) }, { k: 'Contract ends', v: dateStr(school.contractEnds) },
  ];
  const plan = PLAN_TIERS[school.plan];

  return (
    <div>
      <div className="grid grid-stats mb">
        {stats.map((s) => (
          <div key={s.label} className="stat">
            <div className="stat-icon" style={{ background: s.color }}><s.icon size={22} /></div>
            <div><div className="stat-val">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="grid grid-2 mb">
        <div className="card">
          <div className="card-head"><h3>School Information</h3></div>
          <div className="info-grid">
            {info.map((i) => (<div key={i.k} className="info-cell"><div className="k">{i.k}</div><div className="v truncate">{i.v}</div></div>))}
          </div>
        </div>

        <div className="flex flex-col gap-lg">
          <div className="card">
            <div className="card-head"><h3>Subscription</h3><span className={`badge badge-${plan?.color}`}>{plan?.label}</span></div>
            <div className="card-pad">
              <div className="flex items-center justify-between mb">
                <div><div className="stat-val" style={{ fontSize: 24 }}>{naira(plan?.price)}</div><div className="stat-label">per month</div></div>
                <div className="text-right"><div className="fw-800">{plan?.maxStudents.toLocaleString()}</div><div className="cell-sub">student cap</div></div>
              </div>
              <div className="divider" />
              <div className="flex items-center justify-between text-sm"><span className="text-muted">Capacity used</span><b>{Math.round((school.counts?.students || 0) / plan?.maxStudents * 100)}%</b></div>
              <div style={{ height: 8, background: 'var(--bg-alt)', borderRadius: 99, marginTop: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, (school.counts?.students || 0) / plan?.maxStudents * 100)}%`, background: 'linear-gradient(90deg,#2563EB,#7C3AED)' }} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><h3>Leadership</h3></div>
            <div className="card-pad flex flex-col gap">
              <LeaderRow icon={Crown} title="Principal / Head" person={school.principal} accent="var(--gold)" />
              <div className="divider" style={{ margin: 0 }} />
              <LeaderRow icon={ShieldCheck} title="Vice Principal" person={school.vicePrincipal} accent="var(--blue)" />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h3>Active App Modules</h3><span className="cell-sub">{Object.values(school.modules).filter(Boolean).length} of {APP_MODULES.length} enabled</span></div>
        <div className="card-pad flex gap-sm wrap">
          {APP_MODULES.map((m) => (
            <span key={m.key} className={`badge ${school.modules[m.key] ? 'badge-success' : 'badge-muted'}`}>
              {school.modules[m.key] ? <CheckCircle2 size={13} /> : null}{m.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function LeaderRow({ icon: Icon, title, person, accent }) {
  if (!person?.name) return <div className="flex items-center gap"><div className="stat-icon" style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--bg-alt)', color: accent }}><Icon size={18} /></div><div><div className="cell-sub">{title}</div><div className="text-muted">Not assigned</div></div></div>;
  return (
    <div className="flex items-center gap">
      <Avatar name={person.name} size={42} />
      <div className="flex-1">
        <div className="flex items-center gap-sm"><Icon size={14} color={accent} /><span className="cell-sub fw-700">{title}</span></div>
        <div className="cell-main">{person.name}</div>
        <div className="cell-sub">{person.email}{person.phone ? ` · ${person.phone}` : ''}</div>
      </div>
    </div>
  );
}

/* ---------------- Authorities ---------------- */
function Authorities({ school }) {
  const { addToCollection, updateInCollection, removeFromCollection } = useData();
  const toast = useToast();
  const [edit, setEdit] = useState(null); // {} = new, obj = edit, null = closed

  const save = (data) => {
    if (data.id) { updateInCollection(school.id, 'authorities', data.id, data); toast.success('Authority updated'); }
    else { addToCollection(school.id, 'authorities', data); toast.success('Authority added'); }
    setEdit(null);
  };

  return (
    <div className="card">
      <div className="card-head">
        <div><h3>School Authorities</h3><p>Principal, vice principals, bursar and other officials</p></div>
        <button className="btn btn-primary btn-sm" onClick={() => setEdit({})}><Plus size={15} /> Add authority</button>
      </div>
      {school.authorities.length === 0 ? (
        <Empty icon={Crown} title="No authorities yet" sub="Add the principal and other school officials." />
      ) : (
        <div className="card-pad grid grid-auto">
          {school.authorities.map((a) => (
            <div key={a.id} className="tile-link" style={{ alignItems: 'flex-start' }}>
              <Avatar name={a.name} size={44} color="linear-gradient(135deg,#1A3A6B,#2563EB)" />
              <div className="flex-1">
                <div className="cell-main">{a.name}</div>
                <span className="badge badge-info" style={{ marginTop: 2 }}>{a.role}</span>
                <div className="cell-sub" style={{ marginTop: 6 }}>{a.email}</div>
                <div className="cell-sub">{a.phone}</div>
              </div>
              <div className="flex flex-col gap-sm">
                <button className="icon-btn" onClick={() => setEdit(a)}><Pencil size={15} /></button>
                <button className="icon-btn" style={{ color: 'var(--error)' }} onClick={() => { removeFromCollection(school.id, 'authorities', a.id); toast.info('Authority removed'); }}><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {edit && <PersonModal title={edit.id ? 'Edit authority' : 'Add authority'} person={edit} roleField onClose={() => setEdit(null)} onSave={save} />}
    </div>
  );
}

/* ---------------- Teachers ---------------- */
function Teachers({ school }) {
  const { addToCollection, updateInCollection, removeFromCollection } = useData();
  const toast = useToast();
  const [edit, setEdit] = useState(null);
  const [q, setQ] = useState('');
  const list = school.teachers.filter((t) => !q || `${t.name} ${(t.subjects || []).join(' ')}`.toLowerCase().includes(q.toLowerCase()));

  const save = (data) => {
    const payload = { ...data, subjects: (data.subjectsStr || '').split(',').map((x) => x.trim()).filter(Boolean), classes: (data.classesStr || '').split(',').map((x) => x.trim()).filter(Boolean) };
    delete payload.subjectsStr; delete payload.classesStr;
    if (data.id) { updateInCollection(school.id, 'teachers', data.id, payload); toast.success('Teacher updated'); }
    else { addToCollection(school.id, 'teachers', { status: 'active', ...payload }); toast.success('Teacher added'); }
    setEdit(null);
  };

  return (
    <div className="card">
      <div className="card-head">
        <div><h3>Teaching Staff</h3><p>{school.teachers.length} teachers</p></div>
        <div className="flex gap-sm wrap">
          <div className="topbar-search" style={{ display: 'flex', padding: '7px 12px' }}><Search size={15} className="text-muted" /><input placeholder="Search teachers…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <button className="btn btn-primary btn-sm" onClick={() => setEdit({})}><Plus size={15} /> Add teacher</button>
        </div>
      </div>
      {list.length === 0 ? (
        <Empty icon={BookOpen} title="No teachers found" sub="Add teaching staff for this school." />
      ) : (
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Teacher</th><th>Subjects</th><th>Classes</th><th>Contact</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {list.map((t) => (
                <tr key={t.id}>
                  <td><div className="flex items-center gap-sm"><Avatar name={t.name} /><div className="cell-main">{t.name}</div></div></td>
                  <td>{(t.subjects || []).map((s) => <span key={s} className="badge badge-muted" style={{ marginRight: 4 }}>{s}</span>)}</td>
                  <td className="cell-sub">{(t.classes || []).join(', ') || '—'}</td>
                  <td className="cell-sub">{t.email}<br />{t.phone}</td>
                  <td><span className={`badge ${t.status === 'active' ? 'badge-success' : 'badge-warning'}`} style={{ textTransform: 'capitalize' }}>{t.status || 'active'}</span></td>
                  <td><div className="flex gap-sm">
                    <button className="icon-btn" onClick={() => setEdit({ ...t, subjectsStr: (t.subjects || []).join(', '), classesStr: (t.classes || []).join(', ') })}><Pencil size={15} /></button>
                    <button className="icon-btn" style={{ color: 'var(--error)' }} onClick={() => { removeFromCollection(school.id, 'teachers', t.id); toast.info('Teacher removed'); }}><Trash2 size={15} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {edit && <TeacherModal teacher={edit} onClose={() => setEdit(null)} onSave={save} />}
    </div>
  );
}

/* ---------------- Students ---------------- */
function Students({ school }) {
  const { addToCollection, removeFromCollection } = useData();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [cls, setCls] = useState('all');
  const [showImport, setShowImport] = useState(false);

  const list = school.students.filter((s) => {
    const mq = !q || `${s.name} ${s.admissionNo} ${s.parentName}`.toLowerCase().includes(q.toLowerCase());
    const mc = cls === 'all' || s.class === cls;
    return mq && mc;
  });

  const exportStudents = () => {
    const ws = XLSX.utils.json_to_sheet(school.students.map((s) => ({
      'Full Name': s.name, 'Class': s.class, 'Gender': s.gender, 'Admission No': s.admissionNo, 'Parent Name': s.parentName, 'Parent Phone': s.parentPhone,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, `${school.code}-students.xlsx`);
  };

  return (
    <div className="card">
      <div className="card-head">
        <div><h3>Students</h3><p>{school.students.length} loaded · {school.counts?.students || 0} enrolled total</p></div>
        <div className="flex gap-sm wrap">
          <button className="btn btn-ghost btn-sm" onClick={exportStudents} disabled={!school.students.length}><Download size={15} /> Export</button>
          <button className="btn btn-gold btn-sm" onClick={() => setShowImport(true)}><Upload size={15} /> Import CSV / Excel</button>
        </div>
      </div>

      <div className="card-pad flex gap-sm wrap" style={{ paddingBottom: 0 }}>
        <div className="topbar-search flex-1" style={{ display: 'flex', minWidth: 180 }}><Search size={15} className="text-muted" /><input placeholder="Search students…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select className="select" value={cls} onChange={(e) => setCls(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="all">All classes</option>
          {school.classes.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {list.length === 0 ? (
        <Empty icon={GraduationCap} title={school.students.length ? 'No matching students' : 'No students loaded yet'}
          sub={school.students.length ? 'Adjust your search or class filter.' : 'Import a CSV or Excel sheet to populate the student roster.'}
          action={!school.students.length && <button className="btn btn-gold" onClick={() => setShowImport(true)}><Upload size={16} /> Import students</button>} />
      ) : (
        <div className="table-wrap" style={{ marginTop: 12 }}>
          <table className="tbl">
            <thead><tr><th>Student</th><th>Class</th><th>Gender</th><th>Admission No.</th><th>Parent / Guardian</th><th></th></tr></thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id}>
                  <td><div className="flex items-center gap-sm"><Avatar name={s.name} color="linear-gradient(135deg,#7C3AED,#8B5CF6)" /><div className="cell-main">{s.name}</div></div></td>
                  <td><span className="badge badge-info">{s.class}</span></td>
                  <td>{s.gender || '—'}</td>
                  <td className="cell-sub">{s.admissionNo || '—'}</td>
                  <td><div className="cell-main" style={{ fontSize: 13 }}>{s.parentName || '—'}</div><div className="cell-sub">{s.parentPhone || ''}</div></td>
                  <td><button className="icon-btn" style={{ color: 'var(--error)' }} onClick={() => { removeFromCollection(school.id, 'students', s.id); toast.info('Student removed'); }}><Trash2 size={15} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showImport && (
        <ImportModal schoolName={school.shortName} onClose={() => setShowImport(false)}
          onImport={(rows) => { addToCollection(school.id, 'students', rows); setShowImport(false); }} />
      )}
    </div>
  );
}

/* ---------------- App Modules ---------------- */
function AppModules({ school }) {
  const { toggleModule } = useData();
  const toast = useToast();
  return (
    <div className="card">
      <div className="card-head">
        <div><h3>Mobile App Modules</h3><p>Control which features are visible in <b>{school.shortName}</b>'s parent app</p></div>
        <span className="badge badge-info"><Smartphone size={13} /> {Object.values(school.modules).filter(Boolean).length}/{APP_MODULES.length} on</span>
      </div>
      <div className="card-pad flex flex-col">
        {APP_MODULES.map((m, i) => (
          <div key={m.key} className="flex items-center justify-between gap" style={{ padding: '14px 0', borderBottom: i < APP_MODULES.length - 1 ? '1px solid var(--border-soft)' : 'none' }}>
            <div className="flex-1"><div className="cell-main">{m.label}</div><div className="cell-sub">{m.desc}</div></div>
            <Toggle checked={!!school.modules[m.key]} onChange={() => { toggleModule(school.id, m.key); toast.success(`${m.label} ${school.modules[m.key] ? 'disabled' : 'enabled'} for ${school.shortName}`); }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Settings ---------------- */
function SettingsTab({ school, onDeleted }) {
  const { updateSchool, deleteSchool, setSchoolStatus } = useData();
  const toast = useToast();
  const [f, setF] = useState({ ...school });
  const [confirmDel, setConfirmDel] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const setLeader = (role, k) => (e) => setF((p) => ({ ...p, [role]: { ...p[role], [k]: e.target.value } }));

  return (
    <div className="grid grid-2">
      <div className="card">
        <div className="card-head"><h3>Edit Profile</h3></div>
        <div className="card-pad">
          <div className="field"><label>School name</label><input className="input" value={f.name} onChange={set('name')} /></div>
          <div className="form-row">
            <div className="field"><label>Short name</label><input className="input" value={f.shortName} onChange={set('shortName')} /></div>
            <div className="field"><label>Motto</label><input className="input" value={f.motto || ''} onChange={set('motto')} /></div>
          </div>
          <div className="form-row">
            <div className="field"><label>Email</label><input className="input" value={f.email} onChange={set('email')} /></div>
            <div className="field"><label>Phone</label><input className="input" value={f.phone} onChange={set('phone')} /></div>
          </div>
          <div className="field"><label>Address</label><input className="input" value={f.address || ''} onChange={set('address')} /></div>
          <div className="form-row">
            <div className="field"><label>City</label><input className="input" value={f.city} onChange={set('city')} /></div>
            <div className="field"><label>State</label><input className="input" value={f.state} onChange={set('state')} /></div>
          </div>
          <div className="form-row">
            <div className="field"><label>Plan</label>
              <select className="select" value={f.plan} onChange={set('plan')}>
                {Object.entries(PLAN_TIERS).map(([k, t]) => <option key={k} value={k}>{t.label}</option>)}
              </select>
            </div>
            <div className="field"><label>Website</label><input className="input" value={f.website || ''} onChange={set('website')} /></div>
          </div>
          <div className="divider" />
          <p className="text-sm fw-800 mb">Leadership</p>
          <div className="form-row">
            <div className="field"><label>Principal name</label><input className="input" value={f.principal?.name || ''} onChange={setLeader('principal', 'name')} /></div>
            <div className="field"><label>Principal email</label><input className="input" value={f.principal?.email || ''} onChange={setLeader('principal', 'email')} /></div>
          </div>
          <div className="form-row">
            <div className="field"><label>Vice Principal name</label><input className="input" value={f.vicePrincipal?.name || ''} onChange={setLeader('vicePrincipal', 'name')} /></div>
            <div className="field"><label>Vice Principal email</label><input className="input" value={f.vicePrincipal?.email || ''} onChange={setLeader('vicePrincipal', 'email')} /></div>
          </div>
          <button className="btn btn-primary" onClick={() => { updateSchool(school.id, f); toast.success('School profile saved'); }}><CheckCircle2 size={16} /> Save changes</button>
        </div>
      </div>

      <div className="flex flex-col gap-lg">
        <div className="card">
          <div className="card-head"><h3>Status</h3></div>
          <div className="card-pad flex flex-col gap">
            {['active', 'trial', 'suspended', 'inactive'].map((st) => (
              <label key={st} className="flex items-center gap" style={{ cursor: 'pointer', padding: 10, borderRadius: 11, border: '1px solid var(--border-soft)', background: school.status === st ? 'var(--bg-alt)' : '' }}>
                <input type="radio" name="status" checked={school.status === st} onChange={() => { setSchoolStatus(school.id, st); toast.success(`Status set to ${st}`); }} />
                <div className="flex-1"><div className="cell-main" style={{ textTransform: 'capitalize' }}>{st}</div>
                  <div className="cell-sub">{st === 'active' ? 'Full access, billed monthly' : st === 'trial' ? 'Time-limited evaluation' : st === 'suspended' ? 'App access blocked' : 'Archived, not billed'}</div>
                </div>
                <StatusBadge status={st} />
              </label>
            ))}
          </div>
        </div>

        <div className="card" style={{ borderColor: 'var(--error-bg)' }}>
          <div className="card-head"><h3 style={{ color: 'var(--error)' }}>Danger Zone</h3></div>
          <div className="card-pad">
            <p className="text-sm text-muted mb">Permanently remove this school and all its data from the platform. This cannot be undone.</p>
            <button className="btn btn-danger" onClick={() => setConfirmDel(true)}><Trash2 size={16} /> Delete school</button>
          </div>
        </div>
      </div>

      {confirmDel && (
        <Modal title="Delete this school?" onClose={() => setConfirmDel(false)}
          footer={<><button className="btn btn-ghost" onClick={() => setConfirmDel(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => { deleteSchool(school.id); toast.success('School deleted'); onDeleted(); }}><Trash2 size={16} /> Yes, delete</button></>}>
          <p>You are about to permanently delete <b>{school.name}</b>, including all authorities, teachers and {school.students.length} student records. This action cannot be undone.</p>
        </Modal>
      )}
    </div>
  );
}

/* ---------------- Shared person/teacher modals ---------------- */
function PersonModal({ title, person, roleField, onClose, onSave }) {
  const [f, setF] = useState({ name: '', role: '', email: '', phone: '', ...person });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  return (
    <Modal title={title} onClose={onClose}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={!f.name.trim()} onClick={() => onSave(f)}>Save</button></>}>
      <div className="field"><label>Full name *</label><input className="input" value={f.name} onChange={set('name')} placeholder="e.g. Mrs. Jane Doe" /></div>
      {roleField && <div className="field"><label>Role / Position</label><input className="input" value={f.role} onChange={set('role')} placeholder="e.g. Principal, Bursar" /></div>}
      <div className="form-row">
        <div className="field"><label>Email</label><input className="input" value={f.email} onChange={set('email')} /></div>
        <div className="field"><label>Phone</label><input className="input" value={f.phone} onChange={set('phone')} /></div>
      </div>
    </Modal>
  );
}

function TeacherModal({ teacher, onClose, onSave }) {
  const [f, setF] = useState({ name: '', email: '', phone: '', status: 'active', subjectsStr: '', classesStr: '', ...teacher });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  return (
    <Modal title={teacher.id ? 'Edit teacher' : 'Add teacher'} onClose={onClose}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={!f.name.trim()} onClick={() => onSave(f)}>Save</button></>}>
      <div className="field"><label>Full name *</label><input className="input" value={f.name} onChange={set('name')} placeholder="e.g. Mr. John Smith" /></div>
      <div className="field"><label>Subjects <span className="text-muted">(comma separated)</span></label><input className="input" value={f.subjectsStr} onChange={set('subjectsStr')} placeholder="Mathematics, Physics" /></div>
      <div className="field"><label>Classes <span className="text-muted">(comma separated)</span></label><input className="input" value={f.classesStr} onChange={set('classesStr')} placeholder="SS 1A, SS 2B" /></div>
      <div className="form-row">
        <div className="field"><label>Email</label><input className="input" value={f.email} onChange={set('email')} /></div>
        <div className="field"><label>Phone</label><input className="input" value={f.phone} onChange={set('phone')} /></div>
      </div>
      <div className="field"><label>Status</label>
        <select className="select" value={f.status} onChange={set('status')}><option value="active">Active</option><option value="on-leave">On leave</option><option value="inactive">Inactive</option></select>
      </div>
    </Modal>
  );
}
