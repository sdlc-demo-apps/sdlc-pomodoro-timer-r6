import { MODE_LABELS, formatMMSS } from "../timer/time.js";

export const APP_TITLE = "Pomodoro Timer";

export function buildTitle(state) {
  if (state.status !== "running") return APP_TITLE;
  return `${formatMMSS(state.remainingMs)} · ${MODE_LABELS[state.mode]} · ${APP_TITLE}`;
}

export function setTitle(text) {
  document.title = text;
}
