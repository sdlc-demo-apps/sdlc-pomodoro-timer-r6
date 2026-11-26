import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import App from "./App.jsx";
import * as sound from "./services/sound.js";
import indexHtml from "../index.html?raw";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

vi.mock("./services/sound.js", () => ({ unlock: vi.fn(), play: vi.fn() }));

// Vitest does not load CSS content, so the stylesheet is read as text.
const stylesCss = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "styles.css"), "utf8");
const KEY = "pomodoro-timer:v1";
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
  vi.unstubAllGlobals();
});

function stored(record) {
  localStorage.setItem(KEY, JSON.stringify({ version: 1, muted: false, ...record }));
}

function readStored() {
  return JSON.parse(localStorage.getItem(KEY));
}

const display = () => screen.getByRole("timer").textContent;
const countText = () => document.querySelector(".today-count").textContent;
const button = (name) => screen.getByRole("button", { name });
const modeButton = (name) => within(screen.getByRole("group", { name: "Mode" })).getByRole("button", { name });
const liveRegion = () => screen.getByRole("status");
const click = (name) => fireEvent.click(button(name));
const wait = (ms) => act(() => vi.advanceTimersByTime(ms));

// Runs the current session to 00:00.
function finishSession() {
  click("Start");
  wait(25 * MIN + 500);
}

describe("S1 Start, pause and reset", () => {
  test("on first load the mode is Focus, the display reads 25:00, and Start and Reset are visible", () => {
    render(<App />);
    expect(modeButton("Focus").getAttribute("aria-pressed")).toBe("true");
    expect(display()).toBe("25:00");
    expect(button("Start")).toBeTruthy();
    expect(button("Reset")).toBeTruthy();
  });

  test("after Start and 3 s the display reads 24:57 and Start becomes Pause", () => {
    render(<App />);
    click("Start");
    wait(3000);
    expect(display()).toBe("24:57");
    expect(button("Pause")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Start" })).toBeNull();
  });

  test("after Pause the display does not change for 10 s; Start resumes from the paused time", () => {
    render(<App />);
    click("Start");
    wait(3000);
    click("Pause");
    expect(screen.getByText("Focus · Paused")).toBeTruthy();
    wait(10000);
    expect(display()).toBe("24:57");
    click("Start");
    expect(display()).toBe("24:57");
    wait(2000);
    expect(display()).toBe("24:55");
  });

  test("Reset stops the timer and shows the full duration of the current mode", () => {
    render(<App />);
    fireEvent.click(modeButton("Short break"));
    click("Start");
    wait(61000);
    expect(display()).toBe("03:59");
    click("Reset");
    expect(display()).toBe("05:00");
    expect(button("Start")).toBeTruthy();
    wait(5000);
    expect(display()).toBe("05:00");
  });

  test("controls work from the keyboard as real buttons with accessible names", () => {
    render(<App />);
    const start = button("Start");
    start.focus();
    expect(document.activeElement).toBe(start);
    expect(start.tagName).toBe("BUTTON");
    expect(start.getAttribute("type")).toBe("button");
  });
});

describe("S2 Switch between Focus, Short break and Long break", () => {
  test("pressing Focus, Short break or Long break shows 25:00, 05:00 or 15:00, stopped", () => {
    render(<App />);
    click("Start");
    wait(5000);
    fireEvent.click(modeButton("Short break"));
    expect(display()).toBe("05:00");
    expect(button("Start")).toBeTruthy();
    fireEvent.click(modeButton("Long break"));
    expect(display()).toBe("15:00");
    fireEvent.click(modeButton("Focus"));
    expect(display()).toBe("25:00");
    wait(5000);
    expect(display()).toBe("25:00");
  });

  test("the active mode button has aria-pressed=true and the others false", () => {
    render(<App />);
    fireEvent.click(modeButton("Long break"));
    expect(modeButton("Long break").getAttribute("aria-pressed")).toBe("true");
    expect(modeButton("Focus").getAttribute("aria-pressed")).toBe("false");
    expect(modeButton("Short break").getAttribute("aria-pressed")).toBe("false");
    expect(modeButton("Long break").className).toBe("mode-btn");
  });

  test("switching from a running Focus session with 10:00 left does not change today's count", () => {
    stored({ date: "2026-11-26", todayCount: 2, cycle: 2 });
    render(<App />);
    click("Start");
    wait(15 * MIN);
    expect(display()).toBe("10:00");
    fireEvent.click(modeButton("Short break"));
    expect(countText()).toBe("Today: 2 focus sessions");
    expect(readStored()).toMatchObject({ todayCount: 2, cycle: 2 });
    expect(sound.play).not.toHaveBeenCalled();
  });
});

describe("S3 Stay accurate in a background tab", () => {
  test("a Focus session started at T reads 15:00 when next updated at T + 10 min, with no ticks in between", () => {
    render(<App />);
    click("Start");
    // Simulate a throttled background tab: the clock jumps, then one tick runs.
    vi.setSystemTime(T.getTime() + 10 * MIN);
    wait(250);
    expect(display()).toBe("15:00");
  });

  test("a session whose end has passed is completed exactly once", () => {
    stored({ date: "2026-11-26", todayCount: 0, cycle: 0 });
    render(<App />);
    click("Start");
    vi.setSystemTime(T.getTime() + 60 * MIN);
    wait(250);
    wait(5000);
    expect(sound.play).toHaveBeenCalledTimes(1);
    expect(countText()).toBe("Today: 1 focus session");
    expect(readStored()).toMatchObject({ todayCount: 1, cycle: 1 });
    expect(modeButton("Short break").getAttribute("aria-pressed")).toBe("true");
    expect(screen.getAllByText("Focus session complete. Time for a short break.")).toHaveLength(1);
  });

  test("resuming after a pause sets a new end, so the paused period is not counted", () => {
    render(<App />);
    click("Start");
    wait(5 * MIN);
    click("Pause");
    vi.setSystemTime(T.getTime() + 60 * MIN);
    click("Start");
    wait(10 * MIN);
    expect(display()).toBe("10:00");
    expect(sound.play).not.toHaveBeenCalled();
  });
});

describe("S4 Sound and in-page message when a session ends", () => {
  test("when Focus reaches 00:00, one sound plays and the focus message appears", () => {
    render(<App />);
    click("Start");
    expect(sound.unlock).toHaveBeenCalledTimes(1);
    wait(25 * MIN);
    expect(sound.play).toHaveBeenCalledTimes(1);
    expect(liveRegion().textContent).toContain("Focus session complete. Time for a short break.");
  });

  test("when a break reaches 00:00, a sound plays and 'Break over. Ready to focus?' appears", () => {
    render(<App />);
    fireEvent.click(modeButton("Short break"));
    click("Start");
    wait(5 * MIN);
    expect(sound.play).toHaveBeenCalledTimes(1);
    expect(liveRegion().textContent).toContain("Break over. Ready to focus?");
  });

  test("the message is in an aria-live region and has a Dismiss button that removes it", () => {
    render(<App />);
    const region = liveRegion();
    expect(region.getAttribute("aria-live")).toBe("polite");
    expect(region.textContent).toBe("");
    finishSession();
    expect(liveRegion()).toBe(region);
    expect(region.className).toBe("end-message");
    click("Dismiss");
    expect(region.textContent).toBe("");
    expect(screen.queryByRole("button", { name: "Dismiss" })).toBeNull();
  });

  test("the app never requests notification permission", () => {
    const requestPermission = vi.fn(() => Promise.resolve("granted"));
    const NotificationStub = vi.fn();
    NotificationStub.requestPermission = requestPermission;
    NotificationStub.permission = "default";
    vi.stubGlobal("Notification", NotificationStub);
    render(<App />);
    finishSession();
    finishSession();
    expect(requestPermission).not.toHaveBeenCalled();
    expect(NotificationStub).not.toHaveBeenCalled();
  });
});

describe("S5 Switch to the suggested next mode and wait for Start", () => {
  test("Focus ending at cycle positions 1, 2 and 3 switches to Short break, 05:00, stopped", () => {
    render(<App />);
    for (let i = 1; i <= 3; i += 1) {
      fireEvent.click(modeButton("Focus"));
      finishSession();
      expect(modeButton("Short break").getAttribute("aria-pressed")).toBe("true");
      expect(display()).toBe("05:00");
      expect(button("Start")).toBeTruthy();
      expect(readStored().cycle).toBe(i);
      wait(10000);
      expect(display()).toBe("05:00");
    }
  });

  test("Focus ending at cycle position 4 switches to Long break, 15:00, stopped", () => {
    stored({ date: "2026-11-26", todayCount: 3, cycle: 3 });
    render(<App />);
    finishSession();
    expect(modeButton("Long break").getAttribute("aria-pressed")).toBe("true");
    expect(display()).toBe("15:00");
    expect(button("Start")).toBeTruthy();
    expect(liveRegion().textContent).toContain("Focus session complete. Time for a long break.");
  });

  test.each([
    ["Short break", 5],
    ["Long break", 15],
  ])("when a %s ends, the mode becomes Focus, 25:00, stopped", (name, minutes) => {
    render(<App />);
    fireEvent.click(modeButton(name));
    click("Start");
    wait(minutes * MIN);
    expect(modeButton("Focus").getAttribute("aria-pressed")).toBe("true");
    expect(display()).toBe("25:00");
    expect(button("Start")).toBeTruthy();
  });
});

describe("S6 Today's focus count, kept across reloads", () => {
  test("with a count of 2, a Focus session reaching 00:00 makes it 3; a break ending or a reset does not", () => {
    stored({ date: "2026-11-26", todayCount: 2, cycle: 0 });
    render(<App />);
    expect(countText()).toBe("Today: 2 focus sessions");
    finishSession();
    expect(countText()).toBe("Today: 3 focus sessions");
    finishSession(); // the short break
    expect(countText()).toBe("Today: 3 focus sessions");
    click("Start");
    wait(60000);
    click("Reset");
    expect(countText()).toBe("Today: 3 focus sessions");
  });

  test("a count of 3 still shows 3 after a reload", () => {
    stored({ date: "2026-11-26", todayCount: 2, cycle: 0 });
    const first = render(<App />);
    finishSession();
    expect(countText()).toBe("Today: 3 focus sessions");
    first.unmount();
    render(<App />);
    expect(countText()).toBe("Today: 3 focus sessions");
  });

  test("a count stored with yesterday's local date shows 0 on load", () => {
    stored({ date: "2026-11-25", todayCount: 4, cycle: 2 });
    render(<App />);
    expect(countText()).toBe("Today: 0 focus sessions");
    expect(readStored()).toMatchObject({ date: "2026-11-26", todayCount: 0, cycle: 2 });
  });

  test("a count from yesterday shows 0 on the first update after midnight", () => {
    vi.setSystemTime(new Date(2026, 10, 26, 23, 59, 0));
    stored({ date: "2026-11-26", todayCount: 4, cycle: 2 });
    render(<App />);
    click("Start");
    wait(2 * MIN);
    expect(countText()).toBe("Today: 0 focus sessions");
    expect(readStored()).toMatchObject({ date: "2026-11-27", todayCount: 0, cycle: 2 });
  });

  test.each([
    ["missing", null],
    ["malformed", "{oops"],
    ["wrong version", JSON.stringify({ version: 9, date: "2026-11-26", todayCount: 5, cycle: 1 })],
  ])("%s storage starts at 0 without errors", (_name, raw) => {
    if (raw !== null) localStorage.setItem(KEY, raw);
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<App />);
    expect(countText()).toBe("Today: 0 focus sessions");
    expect(display()).toBe("25:00");
    expect(errors).not.toHaveBeenCalled();
    expect(readStored()).toEqual({ version: 1, date: "2026-11-26", todayCount: 0, cycle: 0, muted: false });
    errors.mockRestore();
  });
});

describe("S7 Remember the 4-session cycle across reloads", () => {
  test("with 3 sessions in the cycle, after a reload and 1 more Focus session, the mode becomes Long break", () => {
    const first = render(<App />);
    for (let i = 0; i < 3; i += 1) {
      fireEvent.click(modeButton("Focus"));
      finishSession();
    }
    expect(readStored().cycle).toBe(3);
    first.unmount();
    render(<App />);
    expect(modeButton("Focus").getAttribute("aria-pressed")).toBe("true");
    finishSession();
    expect(modeButton("Long break").getAttribute("aria-pressed")).toBe("true");
    expect(display()).toBe("15:00");
  });

  test("when a Long break reaches 00:00 the cycle restarts at 0 and the next Focus is followed by a Short break", () => {
    stored({ date: "2026-11-26", todayCount: 4, cycle: 4 });
    render(<App />);
    fireEvent.click(modeButton("Long break"));
    finishSession();
    expect(readStored().cycle).toBe(0);
    expect(modeButton("Focus").getAttribute("aria-pressed")).toBe("true");
    finishSession();
    expect(modeButton("Short break").getAttribute("aria-pressed")).toBe("true");
    expect(readStored()).toMatchObject({ cycle: 1, todayCount: 5 });
  });

  test("a reload with Focus running at 12:00 shows 25:00, stopped, with count and cycle unchanged", () => {
    stored({ date: "2026-11-26", todayCount: 2, cycle: 2 });
    const first = render(<App />);
    click("Start");
    wait(13 * MIN);
    expect(display()).toBe("12:00");
    first.unmount();
    render(<App />);
    expect(display()).toBe("25:00");
    expect(modeButton("Focus").getAttribute("aria-pressed")).toBe("true");
    expect(button("Start")).toBeTruthy();
    expect(countText()).toBe("Today: 2 focus sessions");
    expect(readStored()).toEqual({ version: 1, date: "2026-11-26", todayCount: 2, cycle: 2, muted: false });
  });
});

describe("S8 Remaining time in the tab title", () => {
  test("while Focus runs with 24:57 left the title is '24:57 · Focus · Pomodoro Timer'", () => {
    render(<App />);
    click("Start");
    wait(3000);
    expect(document.title).toBe("24:57 · Focus · Pomodoro Timer");
  });

  test("when paused, reset or stopped the title is 'Pomodoro Timer'", () => {
    render(<App />);
    expect(document.title).toBe("Pomodoro Timer");
    click("Start");
    wait(3000);
    click("Pause");
    expect(document.title).toBe("Pomodoro Timer");
    click("Start");
    wait(1000);
    click("Reset");
    expect(document.title).toBe("Pomodoro Timer");
    finishSession();
    expect(document.title).toBe("Pomodoro Timer");
  });

  test("index.html has the title 'Pomodoro Timer'", () => {
    expect(indexHtml).toContain("<title>Pomodoro Timer</title>");
  });
});

describe("S10 Responsive layout for phone and laptop", () => {
  test("index.html has the viewport meta tag width=device-width, initial-scale=1", () => {
    const doc = new DOMParser().parseFromString(indexHtml, "text/html");
    expect(doc.querySelector('meta[name="viewport"]').getAttribute("content")).toBe("width=device-width, initial-scale=1");
  });

  test("the digits, mode buttons, controls and count render with their styled classes", () => {
    render(<App />);
    expect(document.querySelector("main.app .card")).toBeTruthy();
    expect(screen.getByRole("timer").className).toBe("timer-display");
    expect(screen.getAllByRole("button", { name: /Focus|Short break|Long break/ }).every((b) => b.className === "mode-btn")).toBe(true);
    expect(button("Start").className).toBe("btn btn-primary");
    expect(button("Reset").className).toBe("btn btn-secondary");
    expect(document.querySelector(".today-count")).toBeTruthy();
  });

  test("every button style has a 44 px touch target, buttons wrap, digits scale and focus is visible", () => {
    expect(stylesCss).toMatch(/--touch:\s*44px/);
    for (const selector of [".mode-btn", ".btn", ".end-message button"]) {
      const rule = stylesCss.split(selector + " {")[1].split("}")[0];
      expect(rule).toContain("min-height: var(--touch)");
    }
    expect(stylesCss).toMatch(/\.modes \{[^}]*flex-wrap: wrap/);
    expect(stylesCss).toContain("--fs-digits: clamp(4.5rem, 22vw, 9rem)");
    expect(stylesCss).toMatch(/button:focus-visible \{[^}]*outline: 3px solid var\(--color-ring\)/);
  });
});
