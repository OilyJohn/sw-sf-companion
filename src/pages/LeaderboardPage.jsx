import { useState } from 'react';
import { Link } from 'react-router-dom';
import SignInGate from '../components/SignInGate.jsx';
import { useAllSquads } from '../squads.js';

export default function LeaderboardPage() {
  return <SignInGate what="the unit leaderboard"><Leaderboard /></SignInGate>;
}

const COLS = [
  ['played', 'P', 'Games played'],
  ['wounds', 'Wnd', 'Wounds inflicted'],
  ['heroKills', 'Hero', 'Enemy heroes defeated'],
  ['objective', 'Obj', 'Objective bonus EXP'],
  ['ooa', 'OOA', 'Times taken out of action'],
];

// Lifetime totals per unit, from every squad's battle history. Test battles don't count.
// Games played and out of action come from all battles; wounds, hero kills and objective
// EXP only from battles ended after per-unit stats started being saved.
export function unitTotals(squads) {
  const rows = [];
  squads.forEach(s => {
    const byId = {};
    (s.history ?? []).forEach(h => {
      if (h.test) return;
      Object.keys(h.exp ?? {}).forEach(id => {
        const r = byId[id] ??= { id, played: 0, wounds: 0, heroKills: 0, objective: 0, ooa: 0 };
        r.played++;
        if (h.outOfAction?.includes(id)) r.ooa++;
        const st = h.stats?.[id];
        if (st) {
          r.wounds += st.wounds ?? 0;
          r.heroKills += st.heroKills ?? 0;
          r.objective += st.objective ?? 0;
          r.name = st.name; r.type = st.type;
        }
      });
    });
    Object.values(byId).forEach(r => {
      const unit = s.units?.find(u => u.id === r.id);
      const name = unit?.name ?? r.name;
      if (!name) return; // removed before stats were saved: nothing left to name it by
      rows.push({ ...r, name, type: unit?.type ?? r.type, dead: unit?.status === 'dead', removed: !unit,
        squadId: s.id, squad: s.name, owner: s.ownerName });
    });
  });
  return rows;
}

function Leaderboard() {
  const squads = useAllSquads();
  const [sort, setSort] = useState('wounds');
  if (squads === null) return <p className="muted">Loading leaderboard…</p>;

  const rows = unitTotals(squads).sort((a, b) => b[sort] - a[sort] || b.wounds - a.wounds || b.heroKills - a.heroKills || b.played - a.played);

  return (
    <div className="stack">
      <div className="card stack">
        <h2>Unit leaderboard</h2>
        {!rows.length ? <p className="muted small">No battles yet.</p> : (
          <div className="leader-table small">
            <span className="muted" />
            {COLS.map(([k, label, title]) => (
              <button key={k} className={`link-btn ${sort === k ? 'on' : 'muted'}`} title={title} aria-label={`Sort by ${title}`} onClick={() => setSort(k)}>{label}</button>
            ))}
            {rows.map((r, i) => [
              <div key={`n${i}`}>
                <b>{i + 1}. {r.name}</b>{r.dead && <span className="tag">Dead</span>}{r.removed && <span className="tag">Removed</span>}
                <div className="muted">{[r.type, <Link key="s" to={`/squads/${r.squadId}`}>{r.squad}</Link>, r.owner].filter(Boolean).reduce((a, x, j) => (j ? [...a, ' · ', x] : [x]), [])}</div>
              </div>,
              ...COLS.map(([k]) => (k === sort ? <b key={`${k}${i}`}>{r[k]}</b> : <span key={`${k}${i}`}>{r[k]}</span>)),
            ])}
          </div>
        )}
      </div>
      <div className="muted small stack">
        <div>Tap a column to sort. P games played · Wnd wounds inflicted · Hero enemy heroes defeated · Obj objective bonus EXP · OOA times taken out of action.</div>
        <div>Test battles don't count. Wounds, hero kills and objective EXP are counted from 28 Nov 2026; earlier battles only count towards games played and out of action.</div>
      </div>
    </div>
  );
}
