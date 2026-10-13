// Spend excess EXP to move a rolled result up or down the table (1 EXP per step).
// shift: steps taken so far (negative = down); max: EXP the unit can spend on this roll.
export default function ExpShift({ shift, max, canUp, canDown, onShift }) {
  if (max < 1) return null;
  const spent = Math.abs(shift);
  return (
    <div className="row gap wrap small">
      <span className="muted">Excess EXP ({spent}/{max} spent):</span>
      <button className="btn ghost small-btn" disabled={!canDown || (shift <= 0 && spent >= max)} onClick={() => onShift(shift - 1)}>Result down</button>
      <button className="btn ghost small-btn" disabled={!canUp || (shift >= 0 && spent >= max)} onClick={() => onShift(shift + 1)}>Result up</button>
    </div>
  );
}
