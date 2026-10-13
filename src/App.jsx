import { useState } from 'react';
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import { signIn, signOutUser } from './firebase.js';
import SquadsPage from './pages/SquadsPage.jsx';
import SquadPage from './pages/SquadPage.jsx';
import FactionsPage from './pages/FactionsPage.jsx';
import BattlePage from './pages/BattlePage.jsx';
import RulesPage from './pages/RulesPage.jsx';

const NAV = [
  { section: 'Squad Management', links: [
    { to: '/squads', label: 'My Squads' },
    { to: '/factions', label: 'Factions & Units' },
  ] },
  { section: 'During a Battle', links: [{ to: '/battle', label: 'Battle Tracker' }] },
  { section: 'Rules Clarifications', links: [{ to: '/rules', label: 'Rules Reference' }] },
];

export default function App() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const title = NAV.flatMap(s => s.links).find(l => location.pathname.startsWith(l.to))?.label ?? 'Special Forces';

  return (
    <div className={`shell ${open ? 'nav-open' : ''}`}>
      <header className="topbar">
        <button className="icon-btn" aria-label="Menu" onClick={() => setOpen(o => !o)}>☰</button>
        <h1>{title}</h1>
      </header>

      <nav className="sidebar" onClick={e => e.target.closest('a') && setOpen(false)}>
        <div className="brand">Special Forces</div>
        {NAV.map(s => (
          <div key={s.section} className="nav-section">
            <div className="nav-heading">{s.section}</div>
            {s.links.map(l => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}
          </div>
        ))}
        <div className="nav-footer">
          {user ? (
            <>
              <div className="muted small">{user.displayName ?? user.email}</div>
              <button className="link-btn" onClick={signOutUser}>Sign out</button>
            </>
          ) : !loading && <button className="btn" onClick={() => signIn().catch(e => alert(e.message))}>Sign in with Google</button>}
        </div>
      </nav>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}

      <main className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/squads" replace />} />
          <Route path="/squads" element={<SquadsPage />} />
          <Route path="/squads/:id" element={<SquadPage />} />
          <Route path="/factions" element={<FactionsPage />} />
          <Route path="/factions/:id" element={<FactionsPage />} />
          <Route path="/battle" element={<BattlePage />} />
          <Route path="/rules" element={<RulesPage />} />
        </Routes>
      </main>
    </div>
  );
}
