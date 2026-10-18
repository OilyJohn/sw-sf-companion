import { useEffect } from 'react';
import { createPortal } from 'react-dom';

// Pops up after a roll lands, showing the full text of what was rolled.
// items: [{ title, text }]; tap OK, the backdrop or Escape to close.
export default function ResultPopup({ heading, items, onClose }) {
  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  // Portalled to the page body so it covers the whole screen, not just the clipped card it was opened from.
  return createPortal(
    <div className="popup-backdrop" onClick={onClose}>
      <div className="popup card stack" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <div className="muted small">{heading}</div>
        {items.map(it => (
          <div key={it.title} className="stack">
            <h2>{it.title}</h2>
            <div>{it.text}</div>
          </div>
        ))}
        <button className="btn" autoFocus onClick={onClose}>OK</button>
      </div>
    </div>,
    document.body
  );
}
