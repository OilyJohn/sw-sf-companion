import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import SignInGate from '../components/SignInGate.jsx';
import { factions } from '../data/factions.js';
import { getFaction } from '../data/rules.js';
import { createSquad, squadPoints, useMySquads } from '../squads.js';

export default function SquadsPage() {
  return <SignInGate><SquadList /></SignInGate>;
}

function SquadList() {
  const { user } = useAuth();
  const squads = useMySquads(user.uid);
  const [creating, setCreating] = useState(false);

  return (
    <>
      {squads === null && <p className="muted">Loading squads…</p>}
      {squads?.length === 0 && !creating && <p className="muted">No squads yet. Create one to get started.</p>}
      <div className="stack">
        {squads?.map(s => (
          <Link key={s.id} to={`/squads/${s.id}`} className="card link-card">
            <div className="row between">
              <strong>{s.name}</strong>
              <span className="pill">{squadPoints(s)} pts</span>
            </div>
            <div className="muted small">{getFaction(s.faction)?.name} · {s.units.length} units · {s.credits} credits</div>
          </Link>
        ))}
      </div>
      {creating ? <NewSquadForm onCancel={() => setCreating(false)} /> : (
        <button className="btn wide" onClick={() => setCreating(true)}>+ New squad</button>
      )}
    </>
  );
}

function NewSquadForm({ onCancel }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [faction, setFaction] = useState(factions[0].id);

  async function submit(e) {
    e.preventDefault();
    const ref = await createSquad(user, { name: name.trim(), faction });
    navigate(`/squads/${ref.id}`);
  }

  return (
    <form className="card stack" onSubmit={submit}>
      <h2>New squad</h2>
      <label>Squad name<input required value={name} onChange={e => setName(e.target.value)} /></label>
      <label>Faction
        <select value={faction} onChange={e => setFaction(e.target.value)}>
          {factions.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </label>
      <p className="muted small">You start with 50 credits to buy your starting units.</p>
      <div className="row gap">
        <button className="btn" type="submit">Create</button>
        <button className="btn ghost" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
