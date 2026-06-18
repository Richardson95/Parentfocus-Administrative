import { useState } from 'react';
import {
  Smartphone, AlertTriangle, RefreshCw, ToggleLeft, Megaphone, Save,
  Apple, Play, LifeBuoy, ShieldAlert, Layers, Bell,
} from 'lucide-react';
import { useData } from '../data/store.jsx';
import { useToast } from '../components/Toast.jsx';
import { Toggle } from '../components/ui.jsx';
import { APP_MODULES } from '../data/seed.js';

export default function MobileControl() {
  const { appConfig, updateAppConfig, schools, log } = useData();
  const toast = useToast();
  const [cfg, setCfg] = useState({ ...appConfig });
  const set = (k, v) => setCfg((c) => ({ ...c, [k]: v }));

  const save = () => { updateAppConfig(cfg); log('Updated mobile app config', 'Platform-wide settings'); toast.success('Mobile app settings published'); };

  return (
    <div className="page">
      <div className="flex items-center justify-between wrap gap mb">
        <div>
          <h1 className="page-title">Mobile App Control</h1>
          <p className="page-sub">Remotely control the ParentFocus app for every school and parent.</p>
        </div>
        <button className="btn btn-primary" onClick={save}><Save size={16} /> Publish changes</button>
      </div>

      {/* Critical switches */}
      <div className="grid grid-2 mb">
        <div className="card" style={{ borderLeft: cfg.maintenanceMode ? '4px solid var(--warning)' : '4px solid transparent' }}>
          <div className="card-pad flex items-start gap">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg,#D97706,#F59E0B)' }}><ShieldAlert size={22} /></div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap"><h3 style={{ fontSize: 15 }}>Maintenance Mode</h3><Toggle checked={cfg.maintenanceMode} onChange={(v) => set('maintenanceMode', v)} /></div>
              <p className="text-sm text-muted mt-sm">When on, all parents see a maintenance screen and cannot use the app.</p>
              <textarea className="textarea mt-sm" value={cfg.maintenanceMessage} onChange={(e) => set('maintenanceMessage', e.target.value)} placeholder="Message shown to parents…" style={{ minHeight: 64 }} />
            </div>
          </div>
        </div>

        <div className="card" style={{ borderLeft: cfg.forceUpdate ? '4px solid var(--error)' : '4px solid transparent' }}>
          <div className="card-pad flex items-start gap">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg,#B91C1C,#EF4444)' }}><RefreshCw size={22} /></div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap"><h3 style={{ fontSize: 15 }}>Force Update</h3><Toggle checked={cfg.forceUpdate} onChange={(v) => set('forceUpdate', v)} /></div>
              <p className="text-sm text-muted mt-sm">Require users below the minimum version to update before continuing.</p>
              <div className="form-row mt-sm">
                <div className="field" style={{ margin: 0 }}><label>Latest version</label><input className="input" value={cfg.latestVersion} onChange={(e) => set('latestVersion', e.target.value)} /></div>
                <div className="field" style={{ margin: 0 }}><label>Min. supported</label><input className="input" value={cfg.minSupportedVersion} onChange={(e) => set('minSupportedVersion', e.target.value)} /></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-2 mb">
        <div className="card">
          <div className="card-head"><h3>Global Switches</h3></div>
          <div className="card-pad flex flex-col">
            {[
              { k: 'allowNewRegistrations', icon: ToggleLeft, label: 'Allow new parent registrations', desc: 'Parents can self-register from the app' },
            ].map((row, i, arr) => (
              <div key={row.k} className="flex items-center justify-between gap" style={{ padding: '14px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border-soft)' : 'none' }}>
                <div className="flex items-center gap"><div className="stat-icon" style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--bg-alt)', color: 'var(--blue)' }}><row.icon size={18} /></div><div><div className="cell-main">{row.label}</div><div className="cell-sub">{row.desc}</div></div></div>
                <Toggle checked={cfg[row.k]} onChange={(v) => set(row.k, v)} />
              </div>
            ))}
            <div className="divider" />
            <div className="field"><label>Android store URL</label><div className="topbar-search" style={{ padding: '9px 12px' }}><Play size={15} className="text-muted" /><input value={cfg.androidStoreUrl} onChange={(e) => set('androidStoreUrl', e.target.value)} /></div></div>
            <div className="field"><label>iOS store URL</label><div className="topbar-search" style={{ padding: '9px 12px' }}><Apple size={15} className="text-muted" /><input value={cfg.iosStoreUrl} onChange={(e) => set('iosStoreUrl', e.target.value)} /></div></div>
            <div className="form-row">
              <div className="field"><label>Support email</label><div className="topbar-search" style={{ padding: '9px 12px' }}><LifeBuoy size={15} className="text-muted" /><input value={cfg.supportEmail} onChange={(e) => set('supportEmail', e.target.value)} /></div></div>
              <div className="field"><label>Support phone</label><div className="topbar-search" style={{ padding: '9px 12px' }}><Bell size={15} className="text-muted" /><input value={cfg.supportPhone} onChange={(e) => set('supportPhone', e.target.value)} /></div></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><div><h3>Default Modules</h3><p>Enabled by default for newly onboarded schools</p></div><Layers size={18} className="text-muted" /></div>
          <div className="card-pad flex flex-col">
            {APP_MODULES.map((m, i) => (
              <div key={m.key} className="flex items-center justify-between gap" style={{ padding: '12px 0', borderBottom: i < APP_MODULES.length - 1 ? '1px solid var(--border-soft)' : 'none' }}>
                <div className="flex-1"><div className="cell-main">{m.label}</div><div className="cell-sub">{m.desc}</div></div>
                <Toggle checked={!!cfg.defaultModules?.[m.key]} onChange={(v) => set('defaultModules', { ...cfg.defaultModules, [m.key]: v })} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Phone preview */}
      <div className="card">
        <div className="card-head"><h3>Live App Preview</h3><span className="cell-sub">How the app reacts to current settings</span></div>
        <div className="card-pad flex justify-between wrap gap-lg" style={{ alignItems: 'center' }}>
          <div className="flex-1" style={{ minWidth: 240 }}>
            <div className="flex items-center gap mb"><Smartphone size={20} color="var(--blue)" /><b>Status across {schools.length} schools</b></div>
            <ul className="flex flex-col gap-sm text-sm">
              <li className="flex items-center gap-sm">{cfg.maintenanceMode ? <AlertTriangle size={15} color="var(--warning)" /> : <Smartphone size={15} color="var(--success)" />} App is <b>{cfg.maintenanceMode ? 'in maintenance (blocked)' : 'live and accessible'}</b></li>
              <li className="flex items-center gap-sm"><RefreshCw size={15} color={cfg.forceUpdate ? 'var(--error)' : 'var(--muted)'} /> Force update is <b>{cfg.forceUpdate ? 'ON' : 'off'}</b> · latest v{cfg.latestVersion}</li>
              <li className="flex items-center gap-sm"><ToggleLeft size={15} color="var(--blue)" /> New registrations <b>{cfg.allowNewRegistrations ? 'allowed' : 'closed'}</b></li>
            </ul>
          </div>
          <PhoneMock cfg={cfg} />
        </div>
      </div>
    </div>
  );
}

function PhoneMock({ cfg }) {
  return (
    <div style={{ width: 220, height: 440, borderRadius: 32, background: 'var(--navy)', padding: 10, boxShadow: 'var(--shadow-lg)', flexShrink: 0 }}>
      <div style={{ width: '100%', height: '100%', borderRadius: 24, background: cfg.maintenanceMode ? 'linear-gradient(160deg,#D97706,#F59E0B)' : 'linear-gradient(160deg,#0C1B33,#1A3A6B)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', padding: 20, textAlign: 'center' }}>
        {cfg.maintenanceMode ? (
          <>
            <AlertTriangle size={40} />
            <h3 style={{ marginTop: 12, fontSize: 16 }}>Under Maintenance</h3>
            <p style={{ fontSize: 12, marginTop: 8, opacity: 0.9 }}>{cfg.maintenanceMessage}</p>
          </>
        ) : cfg.forceUpdate ? (
          <>
            <RefreshCw size={40} />
            <h3 style={{ marginTop: 12, fontSize: 16 }}>Update Required</h3>
            <p style={{ fontSize: 12, marginTop: 8, opacity: 0.9 }}>Please update to v{cfg.latestVersion} to continue.</p>
            <span className="btn btn-gold btn-sm" style={{ marginTop: 14 }}>Update now</span>
          </>
        ) : (
          <>
            <div style={{ width: 54, height: 54, borderRadius: 16, background: 'rgba(245,158,11,0.2)', display: 'grid', placeItems: 'center', color: 'var(--gold-light)' }}><Smartphone size={26} /></div>
            <h3 style={{ marginTop: 14, fontSize: 16 }}>ParentFocus</h3>
            <p style={{ fontSize: 12, marginTop: 6, opacity: 0.8 }}>Welcome back 👋</p>
            <span className="badge badge-success" style={{ marginTop: 16 }}>App live · v{cfg.latestVersion}</span>
          </>
        )}
      </div>
    </div>
  );
}
