import { useState } from 'react';
import { UserPlus, Shield, Trash2, Mail } from 'lucide-react';
import { useData } from '../data/store.jsx';
import { useToast } from '../components/Toast.jsx';
import Modal from '../components/Modal.jsx';
import { Avatar, Empty } from '../components/ui.jsx';
import { timeAgo } from '../utils/format.js';

const ROLE_PERMS = {
  'Super Admin': 'Full access — manage schools, billing, app control & team',
  'Admin': 'Manage schools, students and broadcasts',
  'Support': 'View schools and respond to support; no billing or destructive actions',
};

export default function Team() {
  const { owners, addOwner, removeOwner } = useData();
  const toast = useToast();
  const [invite, setInvite] = useState(false);

  return (
    <div className="page">
      <div className="flex items-center justify-between wrap gap mb">
        <div><h1 className="page-title">Team & Access</h1><p className="page-sub">Manage who can access the owner console and what they can do.</p></div>
        <button className="btn btn-primary" onClick={() => setInvite(true)}><UserPlus size={16} /> Invite member</button>
      </div>

      <div className="grid grid-3 mb">
        {Object.entries(ROLE_PERMS).map(([role, desc]) => (
          <div key={role} className="card"><div className="card-pad">
            <div className="flex items-center gap-sm mb"><Shield size={18} color="var(--blue)" /><b>{role}</b></div>
            <p className="text-sm text-muted">{desc}</p>
            <p className="cell-sub mt-sm">{owners.filter((o) => o.role === role).length} member(s)</p>
          </div></div>
        ))}
      </div>

      <div className="card">
        <div className="card-head"><h3>Members</h3><span className="cell-sub">{owners.length} total</span></div>
        {owners.length === 0 ? <Empty icon={UserPlus} title="No team members" /> : (
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>Member</th><th>Role</th><th>Status</th><th>Last active</th><th></th></tr></thead>
              <tbody>
                {owners.map((o) => (
                  <tr key={o.id}>
                    <td><div className="flex items-center gap-sm"><Avatar name={o.name} /><div><div className="cell-main">{o.name}</div><div className="cell-sub">{o.email}</div></div></div></td>
                    <td><span className="badge badge-info">{o.role}</span></td>
                    <td><span className="badge badge-success" style={{ textTransform: 'capitalize' }}>{o.status}</span></td>
                    <td className="cell-sub">{timeAgo(o.lastActive)}</td>
                    <td>{o.role !== 'Super Admin' && <button className="icon-btn" style={{ color: 'var(--error)' }} onClick={() => { removeOwner(o.id); toast.info('Member removed'); }}><Trash2 size={15} /></button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {invite && <InviteModal onClose={() => setInvite(false)} onSave={(o) => { addOwner(o); toast.success(`Invitation sent to ${o.email}`); setInvite(false); }} />}
    </div>
  );
}

function InviteModal({ onClose, onSave }) {
  const [f, setF] = useState({ name: '', email: '', role: 'Admin' });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  return (
    <Modal title="Invite team member" onClose={onClose}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={!f.email.trim()} onClick={() => onSave(f)}><Mail size={16} /> Send invite</button></>}>
      <div className="field"><label>Full name</label><input className="input" value={f.name} onChange={set('name')} placeholder="e.g. Jane Doe" /></div>
      <div className="field"><label>Email *</label><input className="input" type="email" value={f.email} onChange={set('email')} placeholder="name@parentfocus.ng" /></div>
      <div className="field"><label>Role</label><select className="select" value={f.role} onChange={set('role')}><option>Super Admin</option><option>Admin</option><option>Support</option></select>
        <p className="hint">{ROLE_PERMS[f.role]}</p></div>
    </Modal>
  );
}
