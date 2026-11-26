import { useCallback, useEffect, useReducer } from "react";
import { initialState, timerReducer } from "../timer/timerReducer.js";
import { localDateKey } from "../timer/time.js";
import * as storage from "../services/storage.js";
import * as sound from "../services/sound.js";
import { buildTitle, setTitle } from "../services/title.js";

export const TICK_MS = 250;

function init() {
  const todayKey = localDateKey(Date.now());
  return initialState(storage.load(todayKey), todayKey);
}

export function useTimer() {
  const [state, dispatch] = useReducer(timerReducer, undefined, init);
  const { status, completionId, muted, date, todayCount, cycle } = state;

  useEffect(() => {
    if (status !== "running") return undefined;
    const id = setInterval(() => dispatch({ type: "TICK", now: Date.now() }), TICK_MS);
    return () => clearInterval(id);
  }, [status]);

  useEffect(() => {
    if (completionId > 0 && !muted) sound.play();
    // Only a new completion plays the sound, not a change of the mute setting.
  }, [completionId]);

  useEffect(() => {
    storage.save({ date, todayCount, cycle, muted });
  }, [date, todayCount, cycle, muted]);

  const title = buildTitle(state);
  useEffect(() => {
    setTitle(title);
  }, [title]);

  const start = useCallback(() => {
    sound.unlock();
    dispatch({ type: "START", now: Date.now() });
  }, []);
  const pause = useCallback(() => dispatch({ type: "PAUSE", now: Date.now() }), []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);
  const setMode = useCallback((mode) => dispatch({ type: "SET_MODE", mode }), []);
  const dismiss = useCallback(() => dispatch({ type: "DISMISS" }), []);

  return { state, start, pause, reset, setMode, dismiss };
}
