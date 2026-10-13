const DOCS = [
  { file: 'special-forces.pdf', name: 'Star Wars: Special Forces', text: 'Campaign rules: forming a squad, mission prep, injuries, EXP, promotions, credits, traits and scenarios.' },
  { file: 'gameplay-rules-amendments.pdf', name: 'Gameplay Rules Amendments', text: 'Changes to the Galactic Heroes rules.' },
  { file: 'weapons.pdf', name: 'Weapons', text: 'Weapon table and weapon properties.' },
  { file: 'factions-and-units.pdf', name: 'Factions & Units', text: 'Unit tables for every faction.' },
  { file: 'jedi-sith-progression.pdf', name: 'Jedi/Sith Progression', text: 'Jedi and Sith units, promotions, force powers and lightsaber forms.' },
  { file: 'unit-sheets.pdf', name: 'Unit Sheets', text: 'Blank printable squad roster sheet.' },
];

export default function DocumentsPage() {
  return (
    <div className="stack">
      {DOCS.map(d => (
        <a key={d.file} href={`${import.meta.env.BASE_URL}docs/${d.file}`} target="_blank" rel="noopener" className="card link-card">
          <strong>{d.name}</strong> <span className="tag">PDF</span>
          <div className="muted small">{d.text}</div>
        </a>
      ))}
    </div>
  );
}
