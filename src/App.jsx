import "./styles.css";
import { useTimer } from "./hooks/useTimer.js";
import { MODE_LABELS } from "./timer/time.js";
import ModeSelector from "./components/ModeSelector.jsx";
import TimerDisplay from "./components/TimerDisplay.jsx";
import Controls from "./components/Controls.jsx";
import EndMessage from "./components/EndMessage.jsx";
import TodayCount from "./components/TodayCount.jsx";

const ACCENTS = {
  focus: "var(--color-focus)",
  short: "var(--color-short)",
  long: "var(--color-long)",
};

export default function App() {
  const { state, start, pause, reset, setMode, dismiss } = useTimer();
  const running = state.status === "running";

  return (
    <main className="app" style={{ "--accent": ACCENTS[state.mode] }}>
      <h1>Pomodoro Timer</h1>
      <section className="card" aria-label="Timer">
        <ModeSelector mode={state.mode} onSelect={setMode} />
        <TimerDisplay remainingMs={state.remainingMs} />
        <p className="mode-label">
          {MODE_LABELS[state.mode]}
          {state.status === "paused" ? " · Paused" : ""}
        </p>
        <Controls running={running} onStart={start} onPause={pause} onReset={reset} />
        <EndMessage message={state.message} onDismiss={dismiss} />
        <TodayCount count={state.todayCount} />
      </section>
    </main>
  );
}
