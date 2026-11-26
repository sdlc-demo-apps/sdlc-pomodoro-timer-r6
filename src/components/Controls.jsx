export default function Controls({ running, onStart, onPause, onReset }) {
  return (
    <div className="controls">
      <button type="button" className="btn btn-primary" onClick={running ? onPause : onStart}>
        {running ? "Pause" : "Start"}
      </button>
      <button type="button" className="btn btn-secondary" onClick={onReset}>
        Reset
      </button>
    </div>
  );
}
