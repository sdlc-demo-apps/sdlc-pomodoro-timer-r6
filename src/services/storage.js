export const STORAGE_KEY = "pomodoro-timer:v1";

export const DEFAULTS = Object.freeze({ todayCount: 0, cycle: 0, muted: false });

function isValid(record) {
  return (
    record !== null &&
    typeof record === "object" &&
    record.version === 1 &&
    typeof record.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(record.date) &&
    Number.isInteger(record.todayCount) &&
    record.todayCount >= 0 &&
    Number.isInteger(record.cycle) &&
    record.cycle >= 0 &&
    record.cycle <= 4 &&
    (record.muted === undefined || typeof record.muted === "boolean")
  );
}

export function load(todayKey) {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return { ...DEFAULTS };
    const record = JSON.parse(raw);
    if (!isValid(record)) return { ...DEFAULTS };
    return {
      todayCount: record.date === todayKey ? record.todayCount : 0,
      cycle: record.cycle,
      muted: record.muted ?? false,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function save({ date, todayCount, cycle, muted }) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, date, todayCount, cycle, muted }));
  } catch {
    // Storage full or blocked: the app keeps working without persistence.
  }
}
