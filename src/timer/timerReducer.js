import { CYCLE_LENGTH, durationMs, localDateKey, nextMode, remainingMs } from "./time.js";

export const MESSAGES = {
  short: "Focus session complete. Time for a short break.",
  long: "Focus session complete. Time for a long break.",
  focus: "Break over. Ready to focus?",
};

const BASE_STATE = {
  mode: "focus",
  status: "stopped",
  remainingMs: durationMs("focus"),
  endsAt: null,
  date: "",
  todayCount: 0,
  cycle: 0,
  muted: false,
  message: null,
  completionId: 0,
};

export function initialState(saved, todayKey) {
  return timerReducer(BASE_STATE, { type: "LOAD", saved, todayKey });
}

function stopAt(state, mode) {
  return { ...state, mode, status: "stopped", remainingMs: durationMs(mode), endsAt: null };
}

// A new local date resets today's count and keeps the cycle position.
function rollOver(state, todayKey) {
  if (state.date === todayKey) return state;
  return { ...state, date: todayKey, todayCount: 0 };
}

function complete(state) {
  let { todayCount, cycle } = state;
  if (state.mode === "focus") {
    todayCount += 1;
    cycle = Math.min(cycle + 1, CYCLE_LENGTH);
  } else if (state.mode === "long") {
    cycle = 0;
  }
  const mode = nextMode(state.mode, cycle);
  return {
    ...stopAt(state, mode),
    todayCount,
    cycle,
    message: MESSAGES[mode],
    completionId: state.completionId + 1,
  };
}

export function timerReducer(state, action) {
  switch (action.type) {
    case "START":
      if (state.status === "running") return state;
      return { ...state, status: "running", endsAt: action.now + state.remainingMs, message: null };

    case "PAUSE": {
      if (state.status !== "running") return state;
      const left = remainingMs(state.endsAt, action.now);
      if (left === 0) return complete(state);
      return { ...state, status: "paused", remainingMs: left, endsAt: null };
    }

    case "RESET":
      return stopAt(state, state.mode);

    case "SET_MODE":
      return stopAt(state, action.mode);

    case "TICK": {
      const current = rollOver(state, localDateKey(action.now));
      if (current.status !== "running") return current;
      const left = remainingMs(current.endsAt, action.now);
      if (left === 0) return complete(current);
      return { ...current, remainingMs: left };
    }

    case "DISMISS":
      return { ...state, message: null };

    case "LOAD": {
      // storage.load() already zeroes a count from another day; a saved date, if given, is checked here too.
      const { date = action.todayKey, todayCount, cycle, muted } = action.saved;
      return rollOver({ ...state, date, todayCount, cycle, muted }, action.todayKey);
    }

    default:
      return state;
  }
}
