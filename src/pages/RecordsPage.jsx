import { Link } from 'react-router-dom';
import SignInGate from '../components/SignInGate.jsx';
import { record } from '../components/BattleHistory.jsx';
import { getFaction } from '../data/rules.js';
import { useAllSquads } from '../squads.js';

export default function RecordsPage() {
  return <SignInGate what="the group's records"><Records /></SignInGate>;
}

// Most wins first, then most draws, then fewest losses, then most played.
const byRecord = (a, b) => b.win - a.win || b.draw - a.draw || a.loss - b.loss || b.played - a.played;

function Records() {
  const squads = useAllSquads();
  if (squads === null) return <p className="muted">Loading records…</p>;

  const rows = squads.map(s => ({ ...record(s.history), id: s.id, name: s.name, owner: s.ownerName, faction: getFaction(s.faction)?.name }))
    .sort(byRecord);
  const players = Object.values(rows.reduce((m, r) => {
    const key = r.owner || 'Unknown player';
    const p = m[key] ?? { name: key, win: 0, draw: 0, loss: 0, played: 0, squads: 0 };
    m[key] = { ...p, win: p.win + r.win, draw: p.draw + r.draw, loss: p.loss + r.loss, played: p.played + r.played, squads: p.squads + 1 };
    return m;
  }, {})).sort(byRecord);

  return (
    <div className="stack">
      <div className="card stack">
        <h2>Players</h2>
        <RecordTable rows={players} name={p => p.name} sub={p => `${p.squads} squad${p.squads === 1 ? '' : 's'}`} />
      </div>
      <div className="card stack">
        <h2>Squads</h2>
        <RecordTable rows={rows} name={r => <Link to={`/squads/${r.id}`}>{r.name}</Link>} sub={r => [r.faction, r.owner].filter(Boolean).join(' · ')} />
      </div>
      <p className="muted small">Test battles don't count. Tap a squad to see its battle history.</p>
    </div>
  );
}

function RecordTable({ rows, name, sub }) {
  if (!rows.length) return <p className="muted small">No squads yet.</p>;
  return (
    <div className="record-table small">
      <span className="muted" /><span className="muted">P</span><span className="muted">W</span><span className="muted">D</span><span className="muted">L</span>
      {rows.map((r, i) => [
        <div key={`n${i}`}><b>{name(r)}</b><div className="muted">{sub(r)}</div></div>,
        <span key={`p${i}`}>{r.played}</span>,
        <b key={`w${i}`}>{r.win}</b>,
        <span key={`d${i}`}>{r.draw}</span>,
        <span key={`l${i}`}>{r.loss}</span>,
      ])}
    </div>
  );
}
