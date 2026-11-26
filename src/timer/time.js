export const MODES = ["focus", "short", "long"];

export const MODE_LABELS = {
  focus: "Focus",
  short: "Short break",
  long: "Long break",
};

const DURATIONS = {
  focus: 25 * 60 * 1000,
  short: 5 * 60 * 1000,
  long: 15 * 60 * 1000,
};

export const CYCLE_LENGTH = 4;

export function durationMs(mode) {
  if (!Object.hasOwn(DURATIONS, mode)) {
    throw new RangeError(`Unknown mode: ${mode}`);
  }
  return DURATIONS[mode];
}

// Rounds up to the whole second, so 24:59.2 left shows 25:00 and the display only reads 00:00 at the end.
export function formatMMSS(ms) {
  const totalSeconds = Math.ceil(Math.max(0, ms) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function remainingMs(endsAt, now) {
  return Math.max(0, endsAt - now);
}

export function localDateKey(now) {
  const d = new Date(now);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

// cycle is the cycle position after the ended session has been counted.
export function nextMode(endedMode, cycle) {
  if (endedMode === "focus") {
    return cycle >= CYCLE_LENGTH ? "long" : "short";
  }
  return "focus";
}
