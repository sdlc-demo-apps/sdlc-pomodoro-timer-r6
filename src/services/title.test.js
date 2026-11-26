import { afterEach, expect, test } from "vitest";
import { buildTitle, setTitle } from "./title.js";

afterEach(() => {
  document.title = "";
});

test("while Focus runs with 24:57 left the title is '24:57 · Focus · Pomodoro Timer' (S8)", () => {
  expect(buildTitle({ status: "running", mode: "focus", remainingMs: 1497000 })).toBe("24:57 · Focus · Pomodoro Timer");
});

test("names the break modes while they run (S8)", () => {
  expect(buildTitle({ status: "running", mode: "short", remainingMs: 300000 })).toBe("05:00 · Short break · Pomodoro Timer");
  expect(buildTitle({ status: "running", mode: "long", remainingMs: 61000 })).toBe("01:01 · Long break · Pomodoro Timer");
});

test("when paused or stopped the title is 'Pomodoro Timer' (S8)", () => {
  expect(buildTitle({ status: "paused", mode: "focus", remainingMs: 1497000 })).toBe("Pomodoro Timer");
  expect(buildTitle({ status: "stopped", mode: "focus", remainingMs: 1500000 })).toBe("Pomodoro Timer");
});

test("setTitle sets document.title", () => {
  setTitle("12:00 · Focus · Pomodoro Timer");
  expect(document.title).toBe("12:00 · Focus · Pomodoro Timer");
});
