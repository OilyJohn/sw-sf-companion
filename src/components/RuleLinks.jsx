import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { gearRule, linkedParts, propertyRule, traitRule } from '../ruleLookup.js';

// A "Traits: a, b" or "Equipment: x, y" line where each name opens its rule.
// kind: 'trait' | 'gear'.
export default function RuleLinks({ label, kind, names, empty = 'none' }) {
  const [open, setOpen] = useState(null);
  const rule = open && (kind === 'trait' ? traitRule(open) : gearRule(open));
  return (
    <div className="small">
      {label && <span className="muted">{label}: </span>}
      {names.length ? names.map((n, i) => (
        <span key={n + i}>
          {i > 0 && ', '}
          <button type="button" className="rule-link" onClick={e => { e.stopPropagation(); setOpen(n); }}>{n}</button>
        </span>
      )) : <span className="muted">{empty}</span>}
      {rule && <RulePopup rule={rule} onClose={() => setOpen(null)} />}
    </div>
  );
}

export function RulePopup({ rule, onClose }) {
  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  // Portalled to the page body: the angled-corner clip on cards would otherwise cut the popup off.
  return createPortal(
    <div className="popup-backdrop" onClick={e => { e.stopPropagation(); onClose(); }}>
      <div className="popup card stack" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <div>
          <h2>{rule.title}</h2>
          {rule.sub && <div className="muted small">{rule.sub}</div>}
        </div>
        {rule.lines.map((l, i) => (
          <div key={i} className={l.old ? 'gh-old' : l.amended ? 'amended small' : l.muted ? 'muted small' : 'small'}>
            {l.label && <b>{l.label}: </b>}<RuleText text={l.text} />
          </div>
        ))}
        <button className="btn" autoFocus onClick={onClose}>OK</button>
      </div>
    </div>,
    document.body,
  );
}

// Rule text where linked weapon property names (e.g. Splash) open their rule.
export function RuleText({ text }) {
  const [open, setOpen] = useState(null);
  const parts = linkedParts(text);
  if (parts.length === 1) return text;
  return (
    <>
      {parts.map((part, i) => (i % 2
        ? <button key={i} type="button" className="rule-link" onClick={e => { e.stopPropagation(); setOpen(part); }}>{part}</button>
        : part))}
      {open && <RulePopup rule={propertyRule(open)} onClose={() => setOpen(null)} />}
    </>
  );
}
