// Dice helpers. "2D10" in the campaign tables is percentile: tens die + units die (0-99).
export const rollDie = sides => 1 + Math.floor(Math.random() * sides);

export function rollFor(dice) {
  if (dice === '2D10') return (rollDie(10) - 1) * 10 + (rollDie(10) - 1);
  const m = /^D(\d+)$/.exec(dice);
  return rollDie(Number(m[1]));
}
