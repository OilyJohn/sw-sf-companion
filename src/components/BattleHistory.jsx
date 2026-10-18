import { useState } from 'react';
import { RESULTS } from '../data/campaign.js';
import { findBonus } from '../data/willOfTheForce.js';

// Wins, draws and losses from a squad's battle history. Test battles don't count.
export function record(history) {
  const r = { win: 0, draw: 0, loss: 0 };
  (history ?? []).forEach(h => { if (!h.test && h.result in r) r[h.result]++; });
  return { ...r, played: r.win + r.draw + r.loss };
}

const fmtDate = ms => (ms ? new Date(ms).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '');

export default function BattleHistory({ history, units }) {
  const [open, setOpen] = useState(null);
  const r = record(history);
  const nameOf = id => units.find(u => u.id === id)?.name ?? 'A unit no longer in the squad';
  const entries = history.map((h, i) => ({ ...h, i })).reverse();

  return (
    <div className="card stack">
      <div className="row between">
        <h2>Battle history</h2>
        <span className="pill">{r.win}W {r.draw}D {r.loss}L</span>
      </div>
      {!entries.length && <p className="muted small">No battles yet.</p>}
      {entries.map(h => (
        <div key={h.i} className="sub">
          <button className="section-head" onClick={() => setOpen(o => (o === h.i ? null : h.i))} aria-expanded={open === h.i}>
            <div>
              <strong>{h.scenario}</strong>{h.test && <span className="tag">Test</span>}
              <div className="muted small">{fmtDate(h.date)}{h.opponent ? ` · vs ${h.opponent}` : ''}</div>
            </div>
            <span className={`pill ${h.result === 'win' ? 'warn' : ''}`}>{RESULTS[h.result]?.label ?? '?'}</span>
          </button>
          {open === h.i && (
            <div className="small stack">
              {h.credits !== null && h.credits !== undefined && <div><span className="muted">Credits earned: </span>{h.credits}</div>}
              {h.mvp && <div><span className="muted">MVP: </span>{nameOf(h.mvp)}</div>}
              {h.wotf?.length > 0 && <div><span className="muted">Will of the Force: </span>{h.wotf.map(id => findBonus(id)?.name ?? id).join(', ')}</div>}
              {h.bounties?.length > 0 && <div><span className="muted">Bounties claimed: </span>{h.bounties.map(b => `${nameOf(b.unit)}${b.target ? ` (${b.target})` : ''}`).join(', ')}</div>}
              {h.outOfAction?.length > 0 && <div><span className="muted">Out of action: </span>{h.outOfAction.map(nameOf).join(', ')}</div>}
              {h.exp && Object.keys(h.exp).length > 0 && (
                <div><span className="muted">EXP: </span>{Object.entries(h.exp).map(([id, n]) => `${nameOf(id)} +${n}`).join(', ')}</div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
