import { beforeEach, describe, expect, test, vi } from "vitest";
import { STORAGE_KEY, load, save } from "./storage.js";

const TODAY = "2026-11-26";
const DEFAULTS = { todayCount: 0, cycle: 0, muted: false };

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("storage contract (S6, S7, NFR-06)", () => {
  test("save writes one key, pomodoro-timer:v1, with the versioned JSON shape", () => {
    save({ date: TODAY, todayCount: 3, cycle: 3, muted: false });
    expect(STORAGE_KEY).toBe("pomodoro-timer:v1");
    expect(localStorage.length).toBe(1);
    expect(JSON.parse(localStorage.getItem("pomodoro-timer:v1"))).toEqual({
      version: 1,
      date: TODAY,
      todayCount: 3,
      cycle: 3,
      muted: false,
    });
  });

  test("a saved record loads back (round trip)", () => {
    save({ date: TODAY, todayCount: 3, cycle: 2, muted: false });
    expect(load(TODAY)).toEqual({ todayCount: 3, cycle: 2, muted: false });
  });

  test("missing data gives the defaults", () => {
    expect(load(TODAY)).toEqual(DEFAULTS);
  });

  test.each([
    ["malformed JSON", "{not json"],
    ["JSON null", "null"],
    ["a number", "42"],
    ["the wrong version", JSON.stringify({ version: 2, date: TODAY, todayCount: 3, cycle: 1, muted: false })],
    ["a bad date", JSON.stringify({ version: 1, date: "26/11/2026", todayCount: 3, cycle: 1 })],
    ["a negative count", JSON.stringify({ version: 1, date: TODAY, todayCount: -1, cycle: 1 })],
    ["a fractional count", JSON.stringify({ version: 1, date: TODAY, todayCount: 1.5, cycle: 1 })],
    ["a cycle above 4", JSON.stringify({ version: 1, date: TODAY, todayCount: 3, cycle: 5 })],
    ["a string cycle", JSON.stringify({ version: 1, date: TODAY, todayCount: 3, cycle: "2" })],
    ["a non-boolean muted", JSON.stringify({ version: 1, date: TODAY, todayCount: 3, cycle: 1, muted: "no" })],
  ])("%s gives the defaults without throwing", (_name, raw) => {
    localStorage.setItem(STORAGE_KEY, raw);
    expect(load(TODAY)).toEqual(DEFAULTS);
  });

  test("a missing muted field defaults to false", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, date: TODAY, todayCount: 1, cycle: 1 }));
    expect(load(TODAY)).toEqual({ todayCount: 1, cycle: 1, muted: false });
  });

  test("yesterday's date gives a count of 0 and keeps the cycle", () => {
    save({ date: "2026-11-25", todayCount: 5, cycle: 3, muted: false });
    expect(load(TODAY)).toEqual({ todayCount: 0, cycle: 3, muted: false });
  });

  test("unavailable storage gives the defaults", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    expect(load(TODAY)).toEqual(DEFAULTS);
  });

  test("a throwing setItem is ignored", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    expect(() => save({ date: TODAY, todayCount: 1, cycle: 1, muted: false })).not.toThrow();
  });
});
