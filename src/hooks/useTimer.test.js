import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useTimer } from "./useTimer.js";
import * as sound from "../services/sound.js";
import * as storage from "../services/storage.js";

vi.mock("../services/sound.js", () => ({ unlock: vi.fn(), play: vi.fn() }));

const T = new Date(2026, 10, 26, 10, 0, 0);
const MIN = 60 * 1000;

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(T);
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("useTimer", () => {
  test("runs a 250 ms interval only while running and clears it on pause and unmount (S3)", () => {
    const setSpy = vi.spyOn(globalThis, "setInterval");
    const clearSpy = vi.spyOn(globalThis, "clearInterval");
    const { result, unmount } = renderHook(() => useTimer());
    expect(setSpy).not.toHaveBeenCalled();
    act(() => result.current.start());
    expect(setSpy).toHaveBeenCalledTimes(1);
    expect(setSpy.mock.calls[0][1]).toBe(250);
    act(() => vi.advanceTimersByTime(250));
    expect(result.current.state.remainingMs).toBe(25 * MIN - 250);
    act(() => result.current.pause());
    expect(clearSpy).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(10000));
    expect(result.current.state.remainingMs).toBe(25 * MIN - 250);
    act(() => result.current.start());
    expect(setSpy).toHaveBeenCalledTimes(2);
    unmount();
    expect(clearSpy).toHaveBeenCalledTimes(2);
  });

  test("start() unlocks audio (S4)", () => {
    const { result } = renderHook(() => useTimer());
    act(() => result.current.start());
    expect(sound.unlock).toHaveBeenCalledTimes(1);
  });

  test("plays the sound once per completion (S3, S4)", () => {
    const { result } = renderHook(() => useTimer());
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(25 * MIN + 2000));
    expect(result.current.state.completionId).toBe(1);
    expect(sound.play).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(10 * MIN));
    expect(sound.play).toHaveBeenCalledTimes(1);
  });

  test("an overdue session (ticks throttled) completes once on the next tick (S3)", () => {
    const { result } = renderHook(() => useTimer());
    act(() => result.current.start());
    vi.setSystemTime(T.getTime() + 40 * MIN);
    act(() => vi.advanceTimersByTime(250));
    act(() => vi.advanceTimersByTime(250));
    expect(result.current.state.completionId).toBe(1);
    expect(result.current.state.todayCount).toBe(1);
    expect(sound.play).toHaveBeenCalledTimes(1);
  });

  test("saves the date, count and cycle after a completion (S6, S7)", () => {
    const saveSpy = vi.spyOn(storage, "save");
    const { result } = renderHook(() => useTimer());
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(25 * MIN + 250));
    expect(saveSpy).toHaveBeenLastCalledWith({ date: "2026-11-26", todayCount: 1, cycle: 1, muted: false });
    expect(JSON.parse(localStorage.getItem("pomodoro-timer:v1"))).toEqual({
      version: 1,
      date: "2026-11-26",
      todayCount: 1,
      cycle: 1,
      muted: false,
    });
  });

  test("updates document.title while running and restores it when paused (S8)", () => {
    const { result } = renderHook(() => useTimer());
    expect(document.title).toBe("Pomodoro Timer");
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(3000));
    expect(document.title).toBe("24:57 · Focus · Pomodoro Timer");
    act(() => result.current.pause());
    expect(document.title).toBe("Pomodoro Timer");
  });
});
