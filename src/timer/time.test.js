import { describe, expect, test } from "vitest";
import { durationMs, formatMMSS, localDateKey, nextMode, remainingMs } from "./time.js";

describe("durationMs", () => {
  test("Focus is 25:00, Short break 05:00, Long break 15:00 (S1, S2)", () => {
    expect(durationMs("focus")).toBe(1500000);
    expect(durationMs("short")).toBe(300000);
    expect(durationMs("long")).toBe(900000);
  });

  test("throws a RangeError on an unknown mode", () => {
    expect(() => durationMs("nap")).toThrow(RangeError);
  });
});

describe("formatMMSS", () => {
  test("formats full durations and zero", () => {
    expect(formatMMSS(1500000)).toBe("25:00");
    expect(formatMMSS(300000)).toBe("05:00");
    expect(formatMMSS(0)).toBe("00:00");
  });

  test("rounds up to the whole second", () => {
    expect(formatMMSS(1497000)).toBe("24:57");
    expect(formatMMSS(1496001)).toBe("24:57");
    expect(formatMMSS(1)).toBe("00:01");
  });

  test("clamps negative input to 00:00", () => {
    expect(formatMMSS(-5000)).toBe("00:00");
  });
});

describe("remainingMs (S3)", () => {
  test("is the time to the end timestamp, never negative", () => {
    expect(remainingMs(10000, 4000)).toBe(6000);
    expect(remainingMs(10000, 10000)).toBe(0);
    expect(remainingMs(10000, 99999)).toBe(0);
  });
});

describe("localDateKey (S6)", () => {
  test("uses the local date around midnight", () => {
    expect(localDateKey(new Date(2026, 10, 26, 23, 59, 59).getTime())).toBe("2026-11-26");
    expect(localDateKey(new Date(2026, 10, 27, 0, 0, 0).getTime())).toBe("2026-11-27");
    expect(localDateKey(new Date(2026, 0, 5, 12).getTime())).toBe("2026-01-05");
  });
});

describe("nextMode (S5)", () => {
  test("Focus ending at cycle 1, 2 or 3 suggests a Short break", () => {
    expect(nextMode("focus", 1)).toBe("short");
    expect(nextMode("focus", 2)).toBe("short");
    expect(nextMode("focus", 3)).toBe("short");
  });

  test("Focus ending at cycle 4 suggests a Long break", () => {
    expect(nextMode("focus", 4)).toBe("long");
  });

  test("any break ending suggests Focus", () => {
    expect(nextMode("short", 2)).toBe("focus");
    expect(nextMode("long", 0)).toBe("focus");
  });
});
