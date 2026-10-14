import { useState } from 'react';
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import { signIn, signOutUser } from './firebase.js';
import { THEMES, applyTheme, getTheme } from './theme.js';
import SquadsPage from './pages/SquadsPage.jsx';
import SquadPage from './pages/SquadPage.jsx';
import FactionsPage from './pages/FactionsPage.jsx';
import BattlePage from './pages/BattlePage.jsx';
import RulesPage from './pages/RulesPage.jsx';
import ShipPage from './pages/ShipPage.jsx';
import TraitsPage from './pages/TraitsPage.jsx';
import ScenariosPage from './pages/ScenariosPage.jsx';
import SharedBattlePage from './pages/SharedBattlePage.jsx';
import WeaponsPage from './pages/WeaponsPage.jsx';
import DocumentsPage from './pages/DocumentsPage.jsx';
import RecordsPage from './pages/RecordsPage.jsx';
import SearchPage from './pages/SearchPage.jsx';

const NAV = [
  { section: 'Squad Management', links: [
    { to: '/squads', label: 'My Squads' },
    { to: '/factions', label: 'Factions & Units' },
    { to: '/records', label: 'Win/Loss Records' },
  ] },
  { section: 'During a Battle', links: [{ to: '/battle', label: 'Battle Tracker' }] },
  { section: 'Rules Clarifications', links: [
    { to: '/rules/search', label: 'Search All Rules' },
    { to: '/rules/traits', label: 'Traits' },
    { to: '/rules/scenarios', label: 'Scenarios' },
    { to: '/rules/weapons', label: 'Weapons and Gear' },
    { to: '/rules', label: 'Gameplay Rules', end: true },
  ] },
  { section: 'Documents & Resources', links: [{ to: '/documents', label: 'PDFs' }] },
];

export default function App() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(getTheme);
  const location = useLocation();
  const title = location.pathname.endsWith('/ship') ? 'Back to the Ship' : NAV.flatMap(s => s.links).find(l => location.pathname.startsWith(l.to))?.label ?? 'Special Forces';

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
            {s.links.map(l => <NavLink key={l.to} to={l.to} end={l.end}>{l.label}</NavLink>)}
          </div>
        ))}
        <div className="nav-footer">
          <label className="theme-picker">Theme
            <select value={theme} onChange={e => { applyTheme(e.target.value); setTheme(e.target.value); }}>
              {THEMES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </label>
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
          <Route path="/squads/:id/ship" element={<ShipPage />} />
          <Route path="/factions" element={<FactionsPage />} />
          <Route path="/factions/:id" element={<FactionsPage />} />
          <Route path="/battle" element={<BattlePage />} />
          <Route path="/battle/game/:code" element={<SharedBattlePage />} />
          <Route path="/battle/:id" element={<BattlePage />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/rules/traits" element={<TraitsPage />} />
          <Route path="/rules/scenarios" element={<ScenariosPage />} />
          <Route path="/rules/weapons" element={<WeaponsPage />} />
          <Route path="/rules/search" element={<SearchPage />} />
          <Route path="/records" element={<RecordsPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
        </Routes>
      </main>
    </div>
  );
}
