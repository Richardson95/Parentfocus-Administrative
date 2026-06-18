import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight, School, Smartphone, BarChart3 } from 'lucide-react';
import { useAuth, DEMO_CREDS } from '../auth/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(DEMO_CREDS.email);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    setTimeout(() => {
      const res = login(email, password);
      setBusy(false);
      if (res.ok) navigate('/');
      else setError(res.error);
    }, 350);
  };

  return (
    <div className="login-wrap">
      <div className="login-art">
        <div className="flex items-center gap-sm">
          <div className="sidebar-logo"><ShieldCheck size={22} /></div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800 }}>ParentFocus</h1>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Owner Console</span>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-1px' }}>
            One console to run<br />every school on<br /><span style={{ color: 'var(--gold-light)' }}>ParentFocus.</span>
          </h2>
          <p style={{ marginTop: 16, maxWidth: 380, color: 'rgba(255,255,255,0.75)', fontSize: 15 }}>
            Manage schools, staff and students, control the mobile app remotely, import rosters,
            and broadcast to thousands of parents — all from one place.
          </p>
          <div className="flex gap-lg" style={{ marginTop: 32 }}>
            {[
              { icon: School, label: 'All schools' },
              { icon: Smartphone, label: 'App control' },
              { icon: BarChart3, label: 'Live insights' },
            ].map((f) => (
              <div key={f.label} className="flex flex-col gap-sm" style={{ alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.1)', display: 'grid', placeItems: 'center', color: 'var(--gold-light)' }}>
                  <f.icon size={22} />
                </div>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>© 2026 ParentFocus · Platform Administration</p>
      </div>

      <div className="login-form-side">
        <div className="login-card">
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>Welcome back</h2>
          <p className="text-muted" style={{ marginTop: 4, marginBottom: 24 }}>Sign in to the owner administration panel.</p>

          <form onSubmit={submit}>
            <div className="field">
              <label>Email address</label>
              <div className="topbar-search" style={{ borderRadius: 11, minWidth: 0, padding: '11px 13px' }}>
                <Mail size={16} className="text-muted" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@parentfocus.ng" autoComplete="username" />
              </div>
            </div>
            <div className="field">
              <label>Password</label>
              <div className="topbar-search" style={{ borderRadius: 11, minWidth: 0, padding: '11px 13px' }}>
                <Lock size={16} className="text-muted" />
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" autoComplete="current-password" />
              </div>
            </div>

            {error && <div className="badge badge-error" style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 12px', borderRadius: 10, marginBottom: 14 }}>{error}</div>}

            <button className="btn btn-primary btn-block" disabled={busy} style={{ padding: '12px' }}>
              {busy ? <span className="spinner" /> : <>Sign in <ArrowRight size={17} /></>}
            </button>
          </form>

          <div className="card" style={{ marginTop: 22, background: 'var(--surface-2)', padding: 14, borderStyle: 'dashed' }}>
            <p className="text-sm fw-700" style={{ marginBottom: 4 }}>Demo credentials</p>
            <p className="text-sm text-muted">Email: <b>{DEMO_CREDS.email}</b></p>
            <p className="text-sm text-muted">Password: <b>{DEMO_CREDS.password}</b></p>
          </div>
        </div>
      </div>
    </div>
  );
}
