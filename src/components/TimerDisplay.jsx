import { formatMMSS } from "../timer/time.js";

// role="timer" is not announced on every change, so screen readers are not flooded each second.
export default function TimerDisplay({ remainingMs }) {
  return (
    <div className="timer-display" role="timer">
      {formatMMSS(remainingMs)}
    </div>
  );
}
