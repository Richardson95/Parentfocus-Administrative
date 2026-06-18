import { Link, useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import {
  School, GraduationCap, Users, Wallet, ArrowUpRight,
  TrendingUp, Megaphone, Upload, Smartphone, ChevronRight, CircleDot,
} from 'lucide-react';
import { useData } from '../data/store.jsx';
import { StatCard, StatusBadge } from '../components/ui.jsx';
import { naira, compact, timeAgo } from '../utils/format.js';
import { PLAN_TIERS } from '../data/seed.js';

const GROWTH = [
  { m: 'Jan', schools: 1, students: 842 },
  { m: 'Feb', schools: 2, students: 1106 },
  { m: 'Mar', schools: 3, students: 1527 },
  { m: 'Apr', schools: 3, students: 1640 },
  { m: 'May', schools: 4, students: 1828 },
  { m: 'Jun', schools: 5, students: 2092 },
];

export default function Dashboard() {
  const { schools, broadcasts, activity, appConfig } = useData();
  const navigate = useNavigate();

  const totalStudents = schools.reduce((a, s) => a + (s.counts?.students || 0), 0);
  const totalTeachers = schools.reduce((a, s) => a + (s.counts?.teachers || 0), 0);
  const totalParents = schools.reduce((a, s) => a + (s.counts?.parents || 0), 0);
  const mrr = schools.filter((s) => s.status === 'active').reduce((a, s) => a + (PLAN_TIERS[s.plan]?.price || 0), 0);
  const activeCount = schools.filter((s) => s.status === 'active').length;

  const planData = Object.entries(PLAN_TIERS).map(([key, t]) => ({
    name: t.label,
    value: schools.filter((s) => s.plan === key).length,
  })).filter((d) => d.value > 0);
  const PIE_COLORS = ['#94A3B8', '#2563EB', '#7C3AED', '#F59E0B'];

  const topSchools = [...schools].sort((a, b) => (b.counts?.students || 0) - (a.counts?.students || 0)).slice(0, 5);

  return (
    <div className="page">
      <div className="flex items-center justify-between wrap gap mb">
        <div>
          <h1 className="page-title">Platform Overview</h1>
          <p className="page-sub">Everything across all ParentFocus schools at a glance.</p>
        </div>
        <div className="flex gap-sm wrap">
          <Link to="/broadcasts" className="btn btn-ghost"><Megaphone size={16} /> Broadcast</Link>
          <Link to="/schools" className="btn btn-primary"><School size={16} /> Manage Schools</Link>
        </div>
      </div>

      {appConfig.maintenanceMode && (
        <div className="card mb" style={{ borderLeft: '4px solid var(--warning)', background: 'var(--warning-bg)' }}>
          <div className="card-pad flex items-center gap">
            <Smartphone size={20} color="var(--warning)" />
            <div className="flex-1">
              <b>Maintenance mode is ON.</b> The mobile app is currently showing a maintenance screen to all parents.
            </div>
            <Link to="/mobile-app" className="btn btn-sm btn-ghost">Manage</Link>
          </div>
        </div>
      )}

      <div className="grid grid-stats mb">
        <StatCard icon={School} label="Schools onboarded" value={schools.length} trend={`${activeCount} active`} color="linear-gradient(135deg,#1A3A6B,#2563EB)" />
        <StatCard icon={GraduationCap} label="Total students" value={compact(totalStudents)} trend="+12%" color="linear-gradient(135deg,#7C3AED,#8B5CF6)" />
        <StatCard icon={Users} label="Parents reached" value={compact(totalParents)} trend="+8%" color="linear-gradient(135deg,#0F766E,#14B8A6)" />
        <StatCard icon={Wallet} label="Monthly revenue" value={naira(mrr)} trend="+15%" color="linear-gradient(135deg,#D97706,#F59E0B)" />
      </div>

      <div className="grid grid-2 mb">
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Platform Growth</h3>
              <p>Schools & students onboarded over time</p>
            </div>
            <span className="badge badge-success"><TrendingUp size={13} /> Trending up</span>
          </div>
          <div className="card-pad" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={GROWTH} margin={{ left: -18, right: 8, top: 6 }}>
                <defs>
                  <linearGradient id="gStud" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F8" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 13 }} />
                <Area type="monotone" dataKey="students" stroke="#2563EB" strokeWidth={2.5} fill="url(#gStud)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <h3>Plan Distribution</h3>
              <p>Schools by subscription tier</p>
            </div>
          </div>
          <div className="card-pad flex items-center gap-lg wrap" style={{ height: 280 }}>
            <ResponsiveContainer width="55%" height="100%">
              <PieChart>
                <Pie data={planData} dataKey="value" innerRadius={52} outerRadius={84} paddingAngle={3}>
                  {planData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 flex flex-col gap-sm">
              {planData.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-sm text-sm fw-700">
                    <CircleDot size={13} color={PIE_COLORS[i % PIE_COLORS.length]} /> {d.name}
                  </span>
                  <b>{d.value}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-head">
            <h3>Top Schools by Enrollment</h3>
            <Link to="/schools" className="btn btn-sm btn-ghost">View all <ChevronRight size={14} /></Link>
          </div>
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>School</th><th>Plan</th><th>Students</th><th>Status</th></tr></thead>
              <tbody>
                {topSchools.map((s) => (
                  <tr key={s.id} className="row-click" onClick={() => navigate(`/schools/${s.id}`)}>
                    <td>
                      <div className="cell-main">{s.shortName}</div>
                      <div className="cell-sub">{s.city}, {s.state}</div>
                    </td>
                    <td><span className={`badge badge-${PLAN_TIERS[s.plan]?.color}`}>{PLAN_TIERS[s.plan]?.label}</span></td>
                    <td className="fw-800">{(s.counts?.students || 0).toLocaleString()}</td>
                    <td><StatusBadge status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3>Recent Activity</h3><Link to="/activity" className="btn btn-sm btn-ghost">All <ChevronRight size={14} /></Link></div>
          <div className="card-pad flex flex-col gap">
            {activity.slice(0, 6).map((a) => (
              <div key={a.id} className="flex gap items-center">
                <div className="stat-icon" style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--bg-alt)', color: 'var(--blue)' }}>
                  {a.type === 'import' ? <Upload size={16} /> : a.type === 'broadcast' ? <Megaphone size={16} /> : a.type === 'school' ? <School size={16} /> : <ArrowUpRight size={16} />}
                </div>
                <div className="flex-1">
                  <div className="text-sm"><b>{a.action}</b> {a.target}</div>
                  <div className="cell-sub">{a.actor} · {timeAgo(a.at)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
