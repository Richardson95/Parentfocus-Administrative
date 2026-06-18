import { useState } from 'react';
import { User, Building, Database, RotateCcw, Save, Palette } from 'lucide-react';
import { useAuth } from '../auth/AuthContext.jsx';
import { useData } from '../data/store.jsx';
import { useToast } from '../components/Toast.jsx';
import Modal from '../components/Modal.jsx';

export default function Settings() {
  const { user } = useAuth();
  const { resetData, schools } = useData();
  const toast = useToast();
  const [org, setOrg] = useState({ name: 'ParentFocus Technologies', email: 'support@parentfocus.ng', phone: '+234 700 PARENT', country: 'Nigeria' });
  const [confirmReset, setConfirmReset] = useState(false);
  const set = (k) => (e) => setOrg((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="page">
      <div className="mb"><h1 className="page-title">Settings</h1><p className="page-sub">Owner profile, organisation details and data management.</p></div>

      <div className="grid grid-2 mb">
        <div className="card">
          <div className="card-head"><div className="flex items-center gap-sm"><User size={18} color="var(--blue)" /><h3>Your Profile</h3></div></div>
          <div className="card-pad">
            <div className="form-row">
              <div className="field"><label>Name</label><input className="input" defaultValue={user?.name} /></div>
              <div className="field"><label>Email</label><input className="input" defaultValue={user?.email} /></div>
            </div>
            <div className="field"><label>Role</label><input className="input" value={user?.role} disabled /></div>
            <button className="btn btn-primary" onClick={() => toast.success('Profile saved')}><Save size={16} /> Save profile</button>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><div className="flex items-center gap-sm"><Building size={18} color="var(--blue)" /><h3>Organisation</h3></div></div>
          <div className="card-pad">
            <div className="field"><label>Company name</label><input className="input" value={org.name} onChange={set('name')} /></div>
            <div className="form-row">
              <div className="field"><label>Support email</label><input className="input" value={org.email} onChange={set('email')} /></div>
              <div className="field"><label>Support phone</label><input className="input" value={org.phone} onChange={set('phone')} /></div>
            </div>
            <div className="field"><label>Country</label><input className="input" value={org.country} onChange={set('country')} /></div>
            <button className="btn btn-primary" onClick={() => toast.success('Organisation details saved')}><Save size={16} /> Save</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><div className="flex items-center gap-sm"><Database size={18} color="var(--blue)" /><h3>Data Management</h3></div></div>
        <div className="card-pad">
          <p className="text-sm text-muted mb">This demo stores all data (schools, students, settings) in your browser's local storage. Resetting restores the original sample data across all {schools.length} schools.</p>
          <button className="btn btn-ghost" onClick={() => setConfirmReset(true)}><RotateCcw size={16} /> Reset demo data</button>
        </div>
      </div>

      {confirmReset && (
        <Modal title="Reset all demo data?" onClose={() => setConfirmReset(false)}
          footer={<><button className="btn btn-ghost" onClick={() => setConfirmReset(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => { resetData(); setConfirmReset(false); toast.success('Data reset to defaults'); }}><RotateCcw size={16} /> Reset</button></>}>
          <p>All changes you've made — new schools, imported students, configuration — will be discarded and the original sample data restored. Continue?</p>
        </Modal>
      )}
    </div>
  );
}
