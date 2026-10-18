import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import SignInGate from '../components/SignInGate.jsx';
import BattleHistory from '../components/BattleHistory.jsx';
import EquipmentPicker from '../components/EquipmentPicker.jsx';
import RuleLinks from '../components/RuleLinks.jsx';
import TodoTask from '../components/TodoTask.jsx';
import { TraitList } from '../components/UnitProfile.jsx';
import { MAX_FORCE_WIELDERS, MAX_HEROES } from '../data/factions.js';
import { GEAR_COST_PER_SLOT, slotsOf, slotsUsed } from '../data/equipment.js';
import { FORCE_WIELDERS, ROLE_BONUS, findProfile, getFaction } from '../data/rules.js';
import { buyableGear } from '../gear.js';
import { deleteSquad, newUnit, saveSquad, squadPoints, unitStats, useSquad } from '../squads.js';

export default function SquadPage() {
  return <SignInGate what="this squad"><Squad /></SignInGate>;
}

const isHero = u => u.role !== 'regular';
const isLost = u => u.status === 'dead';
// An officer who takes over from a dead leader gains only the Leader trait, not the leader bonuses.
const isLeader = u => u.role === 'leader' || (u.traits ?? []).some(t => t.name === 'Leader');
const rankOf = u => (isLeader(u) ? 'leader' : u.role);
const RANK = { leader: 0, officer: 1, regular: 2 };
const byRankThenExp = (a, b) => (RANK[rankOf(a)] ?? 3) - (RANK[rankOf(b)] ?? 3) || b.exp - a.exp;

// Starting company only: each base slot left unfilled refunds 1 credit (role bonus slots don't count).
const emptyBaseSlots = (profile, items) => Math.max(0, profile.eq - slotsUsed(items));

const without = (items, i) => items.filter((_, j) => j !== i);
const removeOne = (items, item) => without(items, items.indexOf(item));
const fits = (unit, st, item) => slotsUsed(unit.equipment) + slotsOf(item) <= st.eqSlots;
const gearCost = (unit, item) => slotsOf(item) * GEAR_COST_PER_SLOT[isHero(unit) ? 'hero' : 'regular'];

function Squad() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const squad = useSquad(id);
  const [adding, setAdding] = useState(false);
  // The last gear moved to the armoury, so a mis-tap can be put back. Any other change clears it.
  const [lastStash, setLastStash] = useState(null);

  if (squad === undefined) return <p className="muted">Loading…</p>;
  if (squad === null) return <p>Squad not found. <Link to="/squads">Back to squads</Link></p>;

  const faction = getFaction(squad.faction);
  const mine = squad.ownerId === user.uid;
  const active = squad.units.filter(u => !isLost(u));
  const heroes = active.filter(isHero).length;
  const forceUsers = active.filter(u => FORCE_WIELDERS.has(u.type)).length;
  const hasLeader = active.some(isLeader);

  const armoury = squad.armoury ?? [];
  const save = patch => { setLastStash(null); return saveSquad(squad.id, patch); };
  const updateUnit = (unitId, patch, extra = {}) =>
    save({ units: squad.units.map(u => (u.id === unitId ? { ...u, ...patch } : u)), ...extra });

  // In the starting phase, changing equipment re-works the empty-slot refund.
  function setEquipment(unit, equipment) {
    if (squad.started) return updateUnit(unit.id, { equipment });
    const emptySlots = emptyBaseSlots(findProfile(squad.faction, unit.type), equipment);
    save({
      credits: squad.credits + emptySlots - unit.emptySlots,
      units: squad.units.map(u => (u.id === unit.id ? { ...u, equipment, emptySlots } : u)),
    });
  }

  function buy(type, name, equipment, role) {
    const profile = findProfile(squad.faction, type);
    const emptySlots = squad.started ? 0 : emptyBaseSlots(profile, equipment);
    const cost = faction.reinforcements[type] - emptySlots;
    const hero = role === 'regular' ? {} : { role, pending: [ROLE_BONUS[role].pending] };
    save({ credits: squad.credits - cost, units: [...squad.units, { ...newUnit(profile, name), ...hero, equipment, emptySlots }] });
    setAdding(false);
  }

  // After the first mission gear never refunds: it goes to the armoury, where regulars can take it.
  function stashGear(unit, i) {
    save({
      armoury: [...armoury, unit.equipment[i]],
      units: squad.units.map(u => (u.id === unit.id ? { ...u, equipment: without(u.equipment, i) } : u)),
    });
    setLastStash({ unitId: unit.id, item: unit.equipment[i], index: i });
  }

  // Puts the item back where it was on the same unit, since heroes can't take from the armoury.
  function undoStash() {
    const { unitId, item, index } = lastStash;
    if (!armoury.includes(item)) return setLastStash(null);
    save({
      armoury: removeOne(armoury, item),
      units: squad.units.map(u => (u.id === unitId ? { ...u, equipment: [...(u.equipment ?? []).slice(0, index), item, ...(u.equipment ?? []).slice(index)] } : u)),
    });
  }

  function takeGear(unit, item) {
    save({
      armoury: removeOne(armoury, item),
      units: squad.units.map(u => (u.id === unit.id ? { ...u, equipment: [...(u.equipment ?? []), item] } : u)),
    });
  }

  function buyGear(unit, item) {
    save({
      credits: squad.credits - gearCost(unit, item),
      units: squad.units.map(u => (u.id === unit.id ? { ...u, equipment: [...(u.equipment ?? []), item] } : u)),
    });
  }

  function remove(unit) {
    if (!confirm(`Remove ${unit.name}?`)) return;
    // Before the first mission a removal is an undo, so refund the purchase.
    const refund = squad.started ? 0 : (faction.reinforcements[unit.type] ?? 0) - unit.emptySlots;
    save({ credits: squad.credits + refund, units: squad.units.filter(u => u.id !== unit.id) });
  }

  function setRole(unit, role) {
    if (role === 'leader' && hasLeader && unit.role !== 'leader') return alert('Your squad already has a leader.');
    if (role !== 'regular' && !isHero(unit) && heroes >= MAX_HEROES) return alert(`A squad can have at most ${MAX_HEROES} heroes.`);
    updateUnit(unit.id, { role, pending: role === 'regular' ? [] : [ROLE_BONUS[role].pending] });
  }

  // A new squad adds its leader, then its officer, so their bonus slots show when picking kit.
  const hasOfficer = active.some(u => u.role === 'officer');
  const nextRole = squad.started ? 'regular' : !hasLeader ? 'leader' : !hasOfficer ? 'officer' : 'regular';

  const warnings = [];
  if (squad.credits < 0) warnings.push(`Over budget by ${-squad.credits} credits.`);
  if (heroes > MAX_HEROES) warnings.push(`More than ${MAX_HEROES} heroes.`);
  if (forceUsers > MAX_FORCE_WIELDERS) warnings.push(`More than ${MAX_FORCE_WIELDERS} force wielders.`);
  if (active.length && !hasLeader) warnings.push('Choose a leader.');
  if (active.length && !hasOfficer && !squad.started) warnings.push('Choose an officer.');

  return (
    <>
      <div className="card">
        <div className="row between">
          <h2>{squad.name}</h2>
          <span className="pill">{squadPoints(squad)} pts</span>
        </div>
        <div className="muted small">{faction?.name}</div>
        <div className="stats">
          <Stat label="Credits" value={squad.credits} />
          <Stat label="Heroes" value={`${heroes}/${MAX_HEROES}`} />
          <Stat label="Force" value={`${forceUsers}/${MAX_FORCE_WIELDERS}`} />
          <Stat label="Units" value={active.length} />
        </div>
        {warnings.map(w => <div key={w} className="warn small">{w}</div>)}
        {squad.battle && <Link className="btn wide banner" to={`/battle/${squad.id}`}>Battle in progress: open tracker</Link>}
        {squad.backToShip && <Link className="btn wide banner" to={`/squads/${squad.id}/ship`}>Back to the Ship: to-do list</Link>}
        {!squad.started && mine && (
          <p className="muted small">Starting company: empty equipment slots refund 1 credit each until you confirm the squad at the bottom of the page.</p>
        )}
        {squad.started && mine && !hasLeader && active.some(u => u.role === 'officer') && (
          <div className="warn small">Your leader is dead. Open an officer and choose "Make leader".</div>
        )}
      </div>

      <div className="stack">
        {[...squad.units].sort(byRankThenExp).map(unit => (
          <UnitCard key={unit.id} unit={unit} squad={squad} mine={mine}
            onChange={(patch, extra) => updateUnit(unit.id, patch, extra)}
            onRole={role => setRole(unit, role)}
            canSucceed={squad.started && !hasLeader && unit.role === 'officer' && !isLost(unit)}
            onSucceed={() => updateUnit(unit.id, { traits: [...unit.traits, { name: 'Leader', pts: 0 }] })}
            onEquip={items => setEquipment(unit, items)}
            onStash={i => stashGear(unit, i)}
            onTake={item => takeGear(unit, item)}
            undoItem={lastStash?.unitId === unit.id ? lastStash.item : null}
            onUndo={undoStash}
            onRemove={() => remove(unit)} />
        ))}
      </div>

      {mine && (adding
        ? <BuyUnit faction={faction} factionId={squad.faction} started={squad.started} role={nextRole} credits={squad.credits} forceFull={forceUsers >= MAX_FORCE_WIELDERS} onBuy={buy} onCancel={() => setAdding(false)} />
        : (
          <div className="card stack" id="spend">
            <div className="row between"><h2>{squad.started ? 'Spend credits' : 'Starting company'}</h2><span className="pill">{squad.credits} credits</span></div>
            <button className="btn wide" onClick={() => setAdding(true)}>{squad.started ? '+ Buy unit' : `+ Add ${nextRole === 'regular' ? 'unit' : `your ${nextRole}`}`}</button>
            {squad.started
              ? <BuyGear squad={squad} onBuy={buyGear} />
              : <p className="muted small">Add units with their starting kit until you mark the squad as started. After that, new units and gear are bought here with credits.</p>}
          </div>
        ))}

      {squad.started && (
        <div className="card stack">
          <h2>Armoury</h2>
          <p className="muted small">Spare gear. Any regular can take it from their unit card for free.</p>
          <div className="small">{armoury.length ? countItems(armoury).map(([g, n]) => (n > 1 ? `${g} ×${n}` : g)).join(', ') : 'Empty'}</div>
        </div>
      )}

      <BattleHistory history={squad.history ?? []} units={squad.units} />

      {mine && !squad.started && (
        <button className="btn wide big" onClick={() => confirm('Confirm your starting squad? Roles are locked after this.') && save({ started: true })}>
          Confirm starting squad
        </button>
      )}

      {mine && (
        <button className="btn danger ghost wide" onClick={async () => {
          if (confirm(`Delete ${squad.name}? This can't be undone.`)) { await deleteSquad(squad.id); navigate('/squads'); }
        }}>Delete squad</button>
      )}
    </>
  );
}

function Stat({ label, value }) {
  return <div className="stat"><div className="stat-value">{value}</div><div className="stat-label">{label}</div></div>;
}

function UnitCard({ unit, squad, mine, onChange, onRole, canSucceed, onSucceed, onEquip, onStash, onTake, undoItem, onUndo, onRemove }) {
  const [open, setOpen] = useState(false);
  const st = unitStats(unit, squad.faction);
  if (!st) return <div className="card warn">Unknown unit type: {unit.type}</div>;

  return (
    <div className={`card unit ${unit.status !== 'ready' ? 'dim' : ''}`}>
      <button className="unit-head" onClick={() => setOpen(o => !o)}>
        <div>
          <strong>{unit.name}</strong>
          {unit.role !== 'regular' && <span className={`tag ${rankOf(unit)}`}>{rankOf(unit)}</span>}
          {unit.temp && <span className="tag">This mission only</span>}
          {unit.status !== 'ready' && <span className="tag">{unit.status}</span>}
          <div className="muted small">{unit.type}</div>
        </div>
        <span className="pill">{st.points} pts</span>
      </button>
      <div className="statline">
        <span>W <b>{st.wounds}</b></span>
        <span>CC <b>d{st.cc}</b></span>
        <span>S <b>d{st.s}</b></span>
        <span>Eq <b>{slotsUsed(unit.equipment)}/{st.eqSlots}</b></span>
        <span>EXP <b>{unit.exp}</b></span>
      </div>
      {!open && st.traits.length > 0 && <RuleLinks label="Traits" kind="trait" names={st.traits} />}
      {unit.pending?.length > 0 && (mine
        ? unit.pending.map((p, i) => (
          <TodoTask key={i + p} unit={unit} squad={squad} text={p} onDone={(patch, extra) => onChange({
            ...patch, pending: [...unit.pending.filter((_, j) => j !== i), ...(patch.pending ?? [])],
          }, extra)} />
        ))
        : unit.pending.map(p => <div key={p} className="warn small">To do: {p}</div>))}

      {open && (
        <div className="stack unit-body">
          {st.traits.length > 0 && <TraitList names={st.traits} />}
          <RuleLinks label="Equipped" kind="gear" names={unit.equipment ?? []} empty="nothing" />
          {mine && <>
            <label>Name<input value={unit.name} onChange={e => onChange({ name: e.target.value })} /></label>
            <label>Model notes<input value={unit.model} placeholder="e.g. red pauldron" onChange={e => onChange({ model: e.target.value })} /></label>
            {!squad.started && (
              <label>Role
                <select value={unit.role} onChange={e => onRole(e.target.value)}>
                  <option value="regular">Regular</option>
                  <option value="officer">Officer (hero)</option>
                  <option value="leader">Leader (hero)</option>
                </select>
              </label>
            )}
            {canSucceed && (
              <button className="btn" onClick={() => confirm(`Make ${unit.name} the new leader? They gain the Leader trait only.`) && onSucceed()}>
                Make leader
              </button>
            )}
            {squad.started
              ? <GearSwap unit={unit} st={st} armoury={squad.armoury ?? []} onStash={onStash} onTake={onTake} undoItem={undoItem} onUndo={onUndo} />
              : (
                <details>
                  <summary className="small">Change equipment</summary>
                  <EquipmentPicker allowed={allowedGear(unit, st)} slots={st.eqSlots} value={unit.equipment ?? []} onChange={onEquip} />
                </details>
              )}
            {!squad.started && unit.emptySlots > 0 && (
              <div className="muted small">{unit.emptySlots} empty slot{unit.emptySlots > 1 ? 's' : ''}: {unit.emptySlots} credit{unit.emptySlots > 1 ? 's' : ''} back.</div>
            )}
            <div className="counter">
              <span className="small">EXP (promotions taken: {unit.promotions ?? 0})</span>
              <div className="row gap">
                <button className="icon-btn step" aria-label="Decrease EXP" onClick={() => onChange({ exp: Math.max(0, unit.exp - 1) })}>−</button>
                <b className="count">{unit.exp}</b>
                <button className="icon-btn step" aria-label="Increase EXP" onClick={() => onChange({ exp: unit.exp + 1 })}>+</button>
              </div>
            </div>
            <label>Status
              <select value={unit.status} onChange={e => onChange({ status: e.target.value })}>
                <option value="ready">Ready</option>
                <option value="injured">Injured (misses next mission)</option>
                <option value="mia">M.I.A.</option>
                <option value="dead">Dead</option>
              </select>
            </label>
            <label>Notes<textarea rows="2" value={unit.notes} onChange={e => onChange({ notes: e.target.value })} /></label>
            <button className="btn danger ghost" onClick={onRemove}>Remove unit</button>
          </>}
        </div>
      )}
    </div>
  );
}

function BuyUnit({ faction, factionId, started, role, credits, forceFull, onBuy, onCancel }) {
  const [type, setType] = useState(Object.keys(faction.reinforcements)[0]);
  const [name, setName] = useState('');
  const [equipment, setEquipment] = useState([]);
  const profile = findProfile(factionId, type);
  const slots = profile.eq + (ROLE_BONUS[role]?.eqSlots ?? 0);
  const empty = started ? 0 : emptyBaseSlots(profile, equipment);
  const cost = faction.reinforcements[type] - empty;
  const blocked = FORCE_WIELDERS.has(type) && forceFull;

  return (
    <form className="card stack" onSubmit={e => { e.preventDefault(); onBuy(type, name.trim() || type, equipment, role); }}>
      <h2>{started ? 'Buy unit' : role === 'regular' ? 'Add unit' : `Add your ${role}`}</h2>
      {role !== 'regular' && (
        <p className="muted small">
          {role === 'leader'
            ? 'Your leader gets +1 wound, +1 equipment slot, the Leader trait and a trait roll.'
            : 'Your officer gets +1 wound and a general trait roll.'}
        </p>
      )}
      <label>Unit
        <select value={type} onChange={e => { setType(e.target.value); setEquipment([]); }}>
          {Object.entries(faction.reinforcements).map(([t, c]) => <option key={t} value={t}>{t} ({c} credits)</option>)}
        </select>
      </label>
      <label>Name<input value={name} placeholder={type} onChange={e => setName(e.target.value)} /></label>
      <div className="small">Starting equipment</div>
      <EquipmentPicker allowed={profile.equipment} slots={slots} value={equipment} onChange={setEquipment} />
      <p className="muted small">
        Costs {cost} credits{empty > 0 ? ` (${empty} back for empty slots)` : ''}, leaving {credits - cost}.
        {started && slotsUsed(equipment) < slots && ' Empty slots only refund credits in the starting company.'}
      </p>
      {blocked && <p className="warn small">Your squad already has {MAX_FORCE_WIELDERS} force wielders.</p>}
      <div className="row gap">
        <button className="btn" type="submit" disabled={blocked || (started && cost > credits)}>{started ? `Buy for ${cost}` : 'Add'}</button>
        <button className="btn ghost" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

// Profile list, plus gear already held (e.g. Other Gear rolls) and a lightsaber once force sensitive.
const allowedGear = (unit, st) => [...new Set([
  ...st.profile.equipment,
  ...(st.traits.includes('Force Sensitive') ? ['Lightsaber'] : []),
  ...(unit.equipment ?? []),
])];

const countItems = items => [...items.reduce((m, g) => m.set(g, (m.get(g) ?? 0) + 1), new Map())];

function GearSwap({ unit, st, armoury, onStash, onTake, undoItem, onUndo }) {
  const equipment = unit.equipment ?? [];
  const allowed = new Set(buyableGear(unit, st));
  const takeable = isHero(unit) ? [] : [...new Set(armoury)].filter(g => allowed.has(g));
  return (
    <details>
      <summary className="small">Change equipment</summary>
      <div className="equip-picker">
        <div className="muted small">Slots used {slotsUsed(equipment)}/{st.eqSlots}. Removed gear goes to the armoury.</div>
        {undoItem && (
          <div className="counter">
            <span className="small">{undoItem} moved to the armoury.</span>
            <button type="button" className="btn small-btn" onClick={onUndo}>Undo</button>
          </div>
        )}
        {equipment.map((g, i) => (
          <div key={i + g} className="counter">
            <span className="small">{g} <span className="muted">({slotsOf(g)})</span></span>
            <button type="button" className="btn ghost small-btn" onClick={() => onStash(i)}>To armoury</button>
          </div>
        ))}
        {takeable.map(g => (
          <div key={'a' + g} className="counter">
            <span className="small">{g} <span className="muted">({slotsOf(g)}, in armoury)</span></span>
            <button type="button" className="btn small-btn" disabled={!fits(unit, st, g)} onClick={() => onTake(g)}>Equip</button>
          </div>
        ))}
        {isHero(unit) && armoury.length > 0 && <div className="muted small">Heroes buy their gear rather than taking it from the armoury.</div>}
      </div>
    </details>
  );
}

function BuyGear({ squad, onBuy }) {
  const units = [...squad.units].filter(u => !isLost(u)).sort(byRankThenExp);
  const [unitId, setUnitId] = useState('');
  const [item, setItem] = useState('');
  const unit = units.find(u => u.id === unitId);
  const st = unit && unitStats(unit, squad.faction);
  const options = st ? buyableGear(unit, st) : [];
  const cost = unit && item ? gearCost(unit, item) : 0;
  const tooBig = unit && item && !fits(unit, st, item);
  const tooDear = cost > squad.credits;

  return (
    <div className="stack">
      <label>Buy gear for
        <select value={unitId} onChange={e => { setUnitId(e.target.value); setItem(''); }}>
          <option value="">Choose a unit…</option>
          {units.map(u => <option key={u.id} value={u.id}>{u.name} ({u.type})</option>)}
        </select>
      </label>
      {unit && (
        <label>Gear ({isHero(unit) ? 2 : 1} credit{isHero(unit) ? 's' : ''} per slot)
          <select value={item} onChange={e => setItem(e.target.value)}>
            <option value="">Choose gear…</option>
            {options.map(g => <option key={g} value={g}>{g} ({gearCost(unit, g)} credits)</option>)}
          </select>
        </label>
      )}
      {unit && <div className="muted small">Slots used {slotsUsed(unit.equipment)}/{st.eqSlots}.</div>}
      {tooBig && <div className="warn small">Not enough free slots. Move something to the armoury first.</div>}
      {item && tooDear && <div className="warn small">Not enough credits.</div>}
      {unit && (
        <button className="btn" disabled={!item || tooBig || tooDear} onClick={() => { onBuy(unit, item); setItem(''); }}>
          Buy{item ? ` ${item} for ${cost}` : ''}
        </button>
      )}
    </div>
  );
}
