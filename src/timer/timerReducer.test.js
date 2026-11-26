import { describe, expect, test } from "vitest";
import { MESSAGES, initialState, timerReducer } from "./timerReducer.js";
import { formatMMSS } from "./time.js";

const T = new Date(2026, 10, 26, 10, 0, 0).getTime();
const TODAY = "2026-11-26";
const MIN = 60 * 1000;

function fresh(saved = { todayCount: 0, cycle: 0, muted: false }) {
  return initialState(saved, TODAY);
}

function run(state, actions) {
  return actions.reduce(timerReducer, state);
}

// Starts the current mode at "now" and ticks past its end.
function finish(state, now = T) {
  const started = timerReducer(state, { type: "START", now });
  return timerReducer(started, { type: "TICK", now: started.endsAt + 1 });
}

describe("initial state (S1)", () => {
  test("is Focus, 25:00, stopped, with the saved count and cycle", () => {
    const s = fresh({ todayCount: 2, cycle: 3, muted: false });
    expect(s).toMatchObject({
      mode: "focus",
      status: "stopped",
      remainingMs: 1500000,
      endsAt: null,
      date: TODAY,
      todayCount: 2,
      cycle: 3,
      muted: false,
      message: null,
      completionId: 0,
    });
  });
});

describe("START, PAUSE, RESET (S1)", () => {
  test("START sets running and the end timestamp", () => {
    const s = timerReducer(fresh(), { type: "START", now: T });
    expect(s.status).toBe("running");
    expect(s.endsAt).toBe(T + 25 * MIN);
  });

  test("3 s after START the remaining time reads 24:57", () => {
    const s = run(fresh(), [
      { type: "START", now: T },
      { type: "TICK", now: T + 3000 },
    ]);
    expect(formatMMSS(s.remainingMs)).toBe("24:57");
  });

  test("PAUSE keeps the remaining time and TICKs do not change it", () => {
    const paused = run(fresh(), [
      { type: "START", now: T },
      { type: "PAUSE", now: T + 3000 },
    ]);
    expect(paused.status).toBe("paused");
    expect(paused.endsAt).toBeNull();
    expect(paused.remainingMs).toBe(1497000);
    const later = timerReducer(paused, { type: "TICK", now: T + 13000 });
    expect(later.remainingMs).toBe(1497000);
  });

  test("START twice does not move the end timestamp", () => {
    const once = timerReducer(fresh(), { type: "START", now: T });
    expect(timerReducer(once, { type: "START", now: T + 5000 })).toBe(once);
  });

  test("RESET stops the timer and restores the full duration of the current mode", () => {
    const s = run(fresh(), [
      { type: "SET_MODE", mode: "short" },
      { type: "START", now: T },
      { type: "TICK", now: T + 60000 },
      { type: "RESET" },
    ]);
    expect(s).toMatchObject({ mode: "short", status: "stopped", remainingMs: 300000, endsAt: null });
  });
});

describe("SET_MODE (S2)", () => {
  test.each([
    ["focus", 1500000],
    ["short", 300000],
    ["long", 900000],
  ])("%s shows its full duration, stopped", (mode, ms) => {
    const s = run(fresh(), [{ type: "START", now: T }, { type: "SET_MODE", mode }]);
    expect(s).toMatchObject({ mode, status: "stopped", remainingMs: ms, endsAt: null });
  });

  test("switching from a running Focus with 10:00 left does not change the count or cycle", () => {
    const s = run(fresh({ todayCount: 2, cycle: 2, muted: false }), [
      { type: "START", now: T },
      { type: "TICK", now: T + 15 * MIN },
      { type: "SET_MODE", mode: "short" },
    ]);
    expect(s.todayCount).toBe(2);
    expect(s.cycle).toBe(2);
    expect(s.completionId).toBe(0);
  });
});

describe("accuracy from the end timestamp (S3)", () => {
  test("a session started at T reads 15:00 at T + 10 min with no ticks in between", () => {
    const s = run(fresh(), [
      { type: "START", now: T },
      { type: "TICK", now: T + 10 * MIN },
    ]);
    expect(formatMMSS(s.remainingMs)).toBe("15:00");
  });

  test("an overdue session completes exactly once", () => {
    const done = run(fresh(), [
      { type: "START", now: T },
      { type: "TICK", now: T + 60 * MIN },
    ]);
    expect(done.completionId).toBe(1);
    expect(done.todayCount).toBe(1);
    expect(done.cycle).toBe(1);
    expect(done.mode).toBe("short");
    const again = run(done, [
      { type: "TICK", now: T + 61 * MIN },
      { type: "TICK", now: T + 62 * MIN },
    ]);
    expect(again).toEqual(done);
  });

  test("resuming after a pause sets a new end timestamp, so the pause is not counted", () => {
    const s = run(fresh(), [
      { type: "START", now: T },
      { type: "PAUSE", now: T + 5 * MIN },
      { type: "START", now: T + 30 * MIN },
    ]);
    expect(s.endsAt).toBe(T + 30 * MIN + 20 * MIN);
    const ticked = timerReducer(s, { type: "TICK", now: T + 40 * MIN });
    expect(formatMMSS(ticked.remainingMs)).toBe("10:00");
    expect(ticked.completionId).toBe(0);
  });

  test("pausing after the end timestamp completes the session instead", () => {
    const s = run(fresh(), [
      { type: "START", now: T },
      { type: "PAUSE", now: T + 26 * MIN },
    ]);
    expect(s.completionId).toBe(1);
    expect(s.status).toBe("stopped");
  });
});

describe("completion rules (S4, S5, S6, S7)", () => {
  test("Focus ending at cycle 1, 2 or 3 switches to Short break, 05:00, stopped", () => {
    let s = fresh();
    for (let i = 1; i <= 3; i += 1) {
      s = finish(s);
      expect(s).toMatchObject({ mode: "short", status: "stopped", remainingMs: 300000, cycle: i });
      expect(s.message).toBe("Focus session complete. Time for a short break.");
      s = timerReducer(s, { type: "SET_MODE", mode: "focus" });
    }
  });

  test("Focus ending at cycle 4 switches to Long break, 15:00, stopped", () => {
    const s = finish(fresh({ todayCount: 3, cycle: 3, muted: false }));
    expect(s).toMatchObject({ mode: "long", status: "stopped", remainingMs: 900000, cycle: 4, todayCount: 4 });
    expect(s.message).toBe("Focus session complete. Time for a long break.");
  });

  test("the cycle is capped at 4 until a long break is taken", () => {
    const s = finish(fresh({ todayCount: 5, cycle: 4, muted: false }));
    expect(s.cycle).toBe(4);
    expect(s.mode).toBe("long");
  });

  test("a Short break ending switches to Focus, 25:00, and keeps count and cycle", () => {
    const s = finish(timerReducer(fresh({ todayCount: 2, cycle: 2, muted: false }), { type: "SET_MODE", mode: "short" }));
    expect(s).toMatchObject({ mode: "focus", status: "stopped", remainingMs: 1500000, todayCount: 2, cycle: 2 });
    expect(s.message).toBe("Break over. Ready to focus?");
  });

  test("a Long break ending restarts the cycle at 0, and the next Focus leads to a Short break", () => {
    let s = finish(timerReducer(fresh({ todayCount: 4, cycle: 4, muted: false }), { type: "SET_MODE", mode: "long" }));
    expect(s).toMatchObject({ mode: "focus", remainingMs: 1500000, cycle: 0, todayCount: 4 });
    expect(s.message).toBe(MESSAGES.focus);
    s = finish(s);
    expect(s).toMatchObject({ mode: "short", cycle: 1, todayCount: 5 });
  });

  test("with a count of 2 a completed Focus makes it 3; a break ending or a reset does not change it", () => {
    let s = finish(fresh({ todayCount: 2, cycle: 0, muted: false }));
    expect(s.todayCount).toBe(3);
    s = finish(s);
    expect(s.todayCount).toBe(3);
    s = run(s, [{ type: "START", now: T }, { type: "RESET" }]);
    expect(s.todayCount).toBe(3);
  });

  test("DISMISS clears the message; START also clears an old message", () => {
    const done = finish(fresh());
    expect(timerReducer(done, { type: "DISMISS" }).message).toBeNull();
    expect(timerReducer(done, { type: "START", now: T }).message).toBeNull();
  });
});

describe("midnight rollover (S6)", () => {
  const beforeMidnight = new Date(2026, 10, 26, 23, 50).getTime();

  test("a TICK on a new local date sets the new date, resets the count and keeps the cycle", () => {
    const s = run(fresh({ todayCount: 3, cycle: 3, muted: false }), [
      { type: "START", now: beforeMidnight },
      { type: "TICK", now: new Date(2026, 10, 27, 0, 1).getTime() },
    ]);
    expect(s.date).toBe("2026-11-27");
    expect(s.todayCount).toBe(0);
    expect(s.cycle).toBe(3);
    expect(s.status).toBe("running");
  });

  test("a Focus session that ends just after midnight counts 1 on the new date", () => {
    const s = run(fresh({ todayCount: 6, cycle: 1, muted: false }), [
      { type: "START", now: beforeMidnight },
      { type: "TICK", now: new Date(2026, 10, 27, 0, 16).getTime() },
    ]);
    expect(s.date).toBe("2026-11-27");
    expect(s.todayCount).toBe(1);
    expect(s.cycle).toBe(2);
  });

  test("LOAD of a record dated yesterday resets the count and keeps the cycle", () => {
    const s = timerReducer(fresh(), {
      type: "LOAD",
      saved: { date: "2026-11-26", todayCount: 3, cycle: 2, muted: false },
      todayKey: "2026-11-27",
    });
    expect(s).toMatchObject({ date: "2026-11-27", todayCount: 0, cycle: 2 });
  });
});

test("an unknown action returns the state unchanged", () => {
  const s = fresh();
  expect(timerReducer(s, { type: "NOPE" })).toBe(s);
});
