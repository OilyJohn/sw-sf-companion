import { Link } from 'react-router-dom';

const SECTIONS = [
  { to: '/rules/traits', name: 'Traits', text: 'Every trait table, Jedi/Sith force powers and lightsaber forms, from your campaign docs.' },
];

export default function RulesPage() {
  return (
    <div className="stack">
      {SECTIONS.map(s => (
        <Link key={s.to} to={s.to} className="card link-card">
          <strong>{s.name}</strong>
          <div className="muted small">{s.text}</div>
        </Link>
      ))}
      <p className="muted small">More rules (amendments, weapons, scenarios) are coming.</p>
    </div>
  );
}
