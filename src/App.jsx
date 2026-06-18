import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './auth/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Schools from './pages/Schools.jsx';
import SchoolDetail from './pages/SchoolDetail.jsx';
import MobileControl from './pages/MobileControl.jsx';
import Broadcasts from './pages/Broadcasts.jsx';
import Subscriptions from './pages/Subscriptions.jsx';
import ActivityLog from './pages/ActivityLog.jsx';
import Team from './pages/Team.jsx';
import Settings from './pages/Settings.jsx';

function Protected({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Protected><Layout /></Protected>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/schools" element={<Schools />} />
        <Route path="/schools/:id" element={<SchoolDetail />} />
        <Route path="/mobile-app" element={<MobileControl />} />
        <Route path="/broadcasts" element={<Broadcasts />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/activity" element={<ActivityLog />} />
        <Route path="/team" element={<Team />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
