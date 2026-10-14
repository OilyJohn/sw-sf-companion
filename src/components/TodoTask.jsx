import { useState } from 'react';
import EquipmentPicker from './EquipmentPicker.jsx';
import ExpShift from './ExpShift.jsx';
import ResultPopup from './ResultPopup.jsx';
import RollInput from './RollInput.jsx';
import { findTrait } from '../data/traits.js';
import {
  LEVELS, LIGHTSABER_FORMS, choosable, diceRange, formLevel, parseFormTrait, rollTraitTable, todoSpec, traitTable,
} from '../data/todos.js';
import { buyableGear, gearProblems, removedGear } from '../gear.js';
import { maxShift, promotionOptions } from '../promotions.js';
import { unitStats } from '../squads.js';

// One Back to the Ship to-do: roll or choose the result and apply it to the unit.
// onDone(patch, extra) saves the unit patch (and any squad-level `extra`) and clears the to-do;
// patch.pending lists any new to-dos.
export default function TodoTask({ unit, squad, text, onDone }) {
  const spec = todoSpec(text);
  const Body = { trait: TraitTask, gear: GearTask, removeNegative: RemoveNegativeTask, form: FormTask, promotion: PromotionTask, regear: RegearTask }[spec.kind] ?? OtherTask;
  return (
    <div className="sub">
      <div><b>{unit.name}</b>: {text}</div>
      <Body unit={unit} squad={squad} spec={spec} onDone={onDone} />
    </div>
  );
}

const addTraits = (unit, ...traits) => ({ traits: [...unit.traits, ...traits.map(({ name, pts }) => ({ name, pts: pts ?? 0 }))] });

// Results on a trait table in order; rows sharing a roll (Force Powers 6) are one result.
const results = table => [...new Set(table.traits.filter(t => t.roll !== null).map(t => t.roll))];

function TraitTask({ unit, squad, spec, onDone }) {
  const [tableId, setTableId] = useState(spec.tables[0]);
  const [roll, setRoll] = useState(null);
  const [irl, setIrl] = useState(false);
  const [shift, setShift] = useState(0);
  const [popup, setPopup] = useState(false);
  const table = traitTable(tableId);
  const has = new Set(unitStats(unit, squad.faction)?.traits.map(n => findTrait(n)?.name ?? n));
  const rolledRows = roll === null ? [] : rollTraitTable(table, roll);
  const order = results(table);
  const at = rolledRows.length ? order.indexOf(rolledRows[0].roll) : -1;
  const rows = shift ? table.traits.filter(t => t.roll === order[at + shift]) : rolledRows;
  const chooseAny = spec.choose || rows.some(r => r.pts === null);
  // The rules allow a re-roll when every trait rolled is one the unit already has.
  const mustReroll = rows.length > 0 && !chooseAny && rows.every(tr => has.has(tr.name));
  const [min, max] = diceRange(table.dice);
  const reset = () => { setRoll(null); setShift(0); };
  const done = patch => onDone(shift ? { ...patch, exp: unit.exp - Math.abs(shift) } : patch);

  return (
    <div className="stack">
      {spec.tables.length > 1 && (
        <div className="row gap wrap">
          {spec.tables.map(id => (
            <button key={id} className={`btn small-btn ${id === tableId ? '' : 'ghost'}`} disabled={roll !== null && !irl}
              onClick={() => { setTableId(id); reset(); }}>
              {traitTable(id).name}
            </button>
          ))}
        </div>
      )}
      {!spec.choose && roll === null && <RollInput dice={table.dice} min={min} max={max} onRoll={(n, typed) => { setRoll(n); setIrl(typed); setPopup(true); }} />}
      {roll !== null && (
        <div className="small muted">Rolled {roll} on {table.name}{shift ? `, shifted ${Math.abs(shift)} ${shift > 0 ? 'up' : 'down'} for ${Math.abs(shift)} EXP` : ''}.
          {irl && <> <button className="link-btn small" onClick={reset}>change</button></>}</div>
      )}
      {popup && rolledRows.length > 0 && (
        <ResultPopup heading={`Rolled ${roll} on ${table.name}`} onClose={() => setPopup(false)}
          items={rolledRows.map(tr => ({ title: tr.pts === null ? tr.name : `${tr.name} (${tr.pts} pts)`, text: tr.text }))} />
      )}
      {roll !== null && at >= 0 && (
        <ExpShift shift={shift} max={maxShift(unit)} canUp={at + shift + 1 < order.length} canDown={at + shift - 1 >= 0} onShift={setShift} />
      )}
      {chooseAny
        ? <TraitPicker traits={choosable(table)} has={has} onPick={tr => done(addTraits(unit, tr))} />
        : rows.map(tr => (
          <div key={tr.roll + tr.name} className="stack">
            <div><b>{tr.name}</b> ({tr.pts} pts) <span className="small">{tr.text}</span></div>
            {has.has(tr.name)
              ? <div className="warn small">{unit.name} already has {tr.name}{mustReroll ? ', so re-roll' : ''}.</div>
              : <button className="btn" onClick={() => done(addTraits(unit, tr))}>Add {tr.name}</button>}
          </div>
        ))}
      <div className="row gap wrap">
        {mustReroll && <button className="btn ghost" onClick={reset}>Re-roll</button>}
        {spec.alt && <button className="btn ghost" onClick={() => onDone(addTraits(unit, spec.alt.trait))}>{spec.alt.label}</button>}
      </div>
    </div>
  );
}

function TraitPicker({ traits, has, onPick }) {
  const [name, setName] = useState('');
  const tr = traits.find(x => x.name === name);
  return (
    <div className="stack">
      <select value={name} onChange={e => setName(e.target.value)}>
        <option value="">Choose a trait…</option>
        {traits.map(x => <option key={x.roll + x.name} value={x.name} disabled={has.has(x.name)}>{x.name} ({x.pts}){has.has(x.name) ? ', already has' : ''}</option>)}
      </select>
      {tr && <div className="small">{tr.text}</div>}
      <button className="btn" disabled={!tr} onClick={() => onPick(tr)}>Add {tr?.name ?? 'trait'}</button>
    </div>
  );
}

function GearTask({ unit, onDone }) {
  const [gear, setGear] = useState('');
  return (
    <div className="stack">
      <label className="small">Other Gear roll (table is in the GH rulebook)
        <input value={gear} placeholder="What did they get?" onChange={e => setGear(e.target.value)} />
      </label>
      <div className="row gap wrap">
        <button className="btn" disabled={!gear.trim()} onClick={() => onDone({ equipment: [...(unit.equipment ?? []), gear.trim()] })}>Add gear</button>
        <button className="btn ghost" onClick={() => onDone(addTraits(unit, { name: 'Force Sensitive', pts: 0 }))}>Become force sensitive</button>
      </div>
      <div className="muted small">Force sensitive: replace any ranged/melee weapons with a lightsaber on the squad page.</div>
    </div>
  );
}

function RemoveNegativeTask({ unit, onDone }) {
  const negatives = new Set(traitTable('negative').traits.map(t => t.name));
  const own = unit.traits.map((t, i) => [t, i]).filter(([t]) => negatives.has(t.name) || t.pts < 0);
  return (
    <div className="row gap wrap">
      {own.length === 0 && <span className="muted small">No negative traits to remove.</span>}
      {own.map(([t, i]) => (
        <button key={i} className="btn" onClick={() => onDone({ traits: unit.traits.filter((_, j) => j !== i) })}>Remove {t.name}</button>
      ))}
      {own.length === 0 && <button className="btn ghost" onClick={() => onDone({})}>Done</button>}
    </div>
  );
}

function FormTask({ unit, spec, onDone }) {
  const [form, setForm] = useState(null);
  const [irl, setIrl] = useState(false);
  const [popup, setPopup] = useState(false);
  const level = form ? formLevel(unit, form) : 0;
  const gained = form && level < 3 ? form.levels[level].map(parseFormTrait) : [];

  return (
    <div className="stack">
      {spec.choose ? (
        <select value={form?.name ?? ''} onChange={e => setForm(LIGHTSABER_FORMS.find(f => f.name === e.target.value) ?? null)}>
          <option value="">Choose a form…</option>
          {LIGHTSABER_FORMS.map(f => (
            <option key={f.name} value={f.name} disabled={formLevel(unit, f) >= 3}>
              {f.roll}. {f.name}{formLevel(unit, f) ? ` (level ${LEVELS[formLevel(unit, f) - 1]})` : ''}
            </option>
          ))}
        </select>
      ) : form === null && (
        <RollInput dice="D8" min={1} max={8} onRoll={(n, typed) => { setForm(LIGHTSABER_FORMS.find(f => f.roll === n)); setIrl(typed); setPopup(true); }} />
      )}
      {popup && form && (
        <ResultPopup heading={`Rolled ${form.roll}: ${form.name}`} onClose={() => setPopup(false)}
          items={level >= 3
            ? [{ title: form.name, text: `${unit.name} is already at level III, so re-roll.` }]
            : gained.map(g => ({ title: `${g.name} (${g.pts} pts)`, text: findTrait(g.name)?.text ?? `Level ${LEVELS[level]} of ${form.name}.` }))} />
      )}
      {form && (level >= 3
        ? <div className="warn small">{form.name} is already at level III, so re-roll.</div>
        : (
          <>
            <div><b>{form.roll}. {form.name}</b>: level {LEVELS[level]} gives {gained.map(g => `${g.name} (${g.pts})`).join(', ')}.</div>
            <div className="muted small">Re-roll if {unit.name} isn't eligible for this form.</div>
            {!spec.choose && <button className="btn ghost" onClick={() => setForm(null)}>Not eligible, re-roll</button>}
            <button className="btn" onClick={() => onDone({ forms: { ...unit.forms, [form.name]: level + 1 }, ...addTraits(unit, ...gained) })}>
              Advance to level {LEVELS[level]}
            </button>
          </>
        ))}
      {form && !spec.choose && level >= 3 && <button className="btn ghost" onClick={() => setForm(null)}>Re-roll</button>}
      {form && !spec.choose && irl && <button className="link-btn small" onClick={() => setForm(null)}>Change typed roll</button>}
    </div>
  );
}

function PromotionTask({ unit, squad, spec, onDone }) {
  const rows = spec.table.rows.filter(r => r.max <= 79);
  const [i, setI] = useState('');
  const res = rows[i];
  const options = res ? promotionOptions(res, unit, squad, []) : null;
  return (
    <div className="stack">
      <select value={i} onChange={e => setI(e.target.value)}>
        <option value="">Choose a result…</option>
        {rows.map((r, j) => <option key={r.name} value={j}>{r.min}-{r.max}: {r.name}</option>)}
      </select>
      {res && <div className="small">{res.text}</div>}
      {res && options === null && <div className="warn small">{unit.name} can't take this one, so choose another.</div>}
      <div className="row gap wrap">
        {options?.map(([label, patch]) => <button key={label} className="btn" onClick={() => onDone(patch)}>{label}</button>)}
      </div>
    </div>
  );
}

function OtherTask({ unit, onDone }) {
  const [name, setName] = useState('');
  const [pts, setPts] = useState('');
  return (
    <div className="stack">
      <div className="row gap">
        <input value={name} placeholder="Trait gained (optional)" onChange={e => setName(e.target.value)} />
        <input type="number" inputMode="numeric" value={pts} placeholder="pts" style={{ width: 70 }} onChange={e => setPts(e.target.value)} />
      </div>
      <button className="btn" onClick={() => onDone(name.trim() ? addTraits(unit, { name: name.trim(), pts: Number(pts) || 0 }) : {})}>
        {name.trim() ? `Add ${name.trim()}` : 'Mark done'}
      </button>
    </div>
  );
}

// After a promotion: swap gear for anything the new unit type can carry, at no cost.
// Gear taken off goes to the squad's armoury, as it does on the squad page.
function RegearTask({ unit, squad, onDone }) {
  const st = unitStats(unit, squad.faction);
  const allowed = buyableGear(unit, st);
  const equipment = unit.equipment ?? [];
  const [value, setValue] = useState(() => equipment.filter(g => allowed.includes(g)));
  const { notAllowed, overSlots } = gearProblems(unit, st);
  const tooMany = gearProblems({ ...unit, equipment: value }, st).overSlots;

  return (
    <div className="stack">
      {notAllowed.length > 0 && <div className="warn small">A {unit.type} can't carry: {notAllowed.join(', ')}.</div>}
      {overSlots && <div className="warn small">Their gear needs more slots than a {unit.type} has ({st.eqSlots}).</div>}
      {notAllowed.length === 0 && !overSlots && <div className="muted small">{unit.name} can carry everything they have now. Change it anyway if you like.</div>}
      <EquipmentPicker allowed={allowed} slots={st.eqSlots} value={value} onChange={setValue} />
      <div className="muted small">Free of charge. Anything taken off goes to the armoury.</div>
      <button className="btn" disabled={tooMany} onClick={() => onDone({ equipment: value }, {
        armoury: [...(squad.armoury ?? []), ...removedGear(equipment, value)],
      })}>Save gear</button>
    </div>
  );
}
