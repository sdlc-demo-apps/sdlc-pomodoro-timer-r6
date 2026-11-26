import { MODES, MODE_LABELS } from "../timer/time.js";

export default function ModeSelector({ mode, onSelect }) {
  return (
    <div className="modes" role="group" aria-label="Mode">
      {MODES.map((m) => (
        <button key={m} type="button" className="mode-btn" aria-pressed={m === mode} onClick={() => onSelect(m)}>
          {MODE_LABELS[m]}
        </button>
      ))}
    </div>
  );
}
