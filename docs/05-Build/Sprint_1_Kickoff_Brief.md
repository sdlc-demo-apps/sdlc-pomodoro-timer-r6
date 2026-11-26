# Sprint Kickoff Brief: Pomodoro Timer

## Sprint goal

On https://sdlc-demo-apps.github.io/sdlc-pomodoro-timer-r6/ the Admin can start, pause and reset a Focus session on a phone and a laptop. The Admin can also hear a sound and see a message at 00:00, see the app switch to Short break (or Long break after the 4th focus session), and see the remaining time in the tab title. Today's count and the cycle position survive a reload, and CI tests prove every Must and Should acceptance criterion.

## Stories in this sprint

| ID | Story | MoSCoW | Points |
|---|---|---|---|
| S1 | Start, pause and reset a large MM:SS countdown | Must | 3 |
| S2 | Switch between Focus, Short break and Long break | Must | 2 |
| S3 | Stay accurate in a background tab or on a locked phone | Must | 3 |
| S4 | Sound and in-page message when a session ends | Must | 3 |
| S5 | Switch to the suggested next mode and wait for Start | Must | 3 |
| S6 | Today's focus count, kept across reloads | Must | 3 |
| S7 | Remember the 4-session cycle across reloads | Must | 3 |
| S8 | Remaining time in the tab title | Should | 1 |
| S10 | Responsive layout for phone and laptop | Must | 2 |

**Total: 23 points** against a capacity of 24 points (1 point of buffer). Build order: S1 and S2, then S3, S4 and S5, S6, S7, and finally S8 and S10.

## How it will be built

- **Stack:** React 18 + Vite 5 on the starter template, with no new dependencies. The npm scripts, `ci.yml` and `deploy-pages.yml` stay unchanged. `vite.config.js` gets `base: '/sdlc-pomodoro-timer-r6/'`, and `index.html` gets the title "Pomodoro Timer" and the viewport meta tag.
- **Components:** `App.jsx` lays out these components from `src/components/`:
  - `ModeSelector`
  - `TimerDisplay`
  - `Controls`
  - `TodayCount`
  - `EndMessage` (an `aria-live="polite"` region with a Dismiss button)
- **Timer logic:** `timerReducer.js` is a pure state machine with the actions START, PAUSE, RESET, SET_MODE, TICK, DISMISS and LOAD. It works with:
  - `time.js` for `durationMs`, `formatMMSS`, `remainingMs`, `localDateKey` and `nextMode`;
  - the `useTimer` hook, which runs a 250 ms interval while the timer is running.
- **Accuracy:** remaining time is `max(0, endsAt - Date.now())`, and `endsAt` is recomputed on every resume. On TICK, the reducer runs the midnight check first. Completion is guarded by `status`, so it happens once and increments `completionId`.
- **Storage contract:** one key, `pomodoro-timer:v1`, with the shape `{version:1, date, todayCount, cycle, muted}`.
  - The running timer, `endsAt` and the mode are not stored.
  - Missing, malformed or wrong-version data falls back to `{todayCount:0, cycle:0, muted:false}`.
  - A new local date resets the count and keeps the cycle.
- **Side effects:** each browser API has its own small module, so tests can mock it.
  - `sound.js` makes a Web Audio beep (about 0.4 s at 880 Hz) and unlocks audio on Start.
  - `title.js` sets `document.title`.
  - `storage.js` reads and writes localStorage.
- **Design tokens:** `styles.css` reuses the CSS custom properties from the approved Phase 4 mockup's Design notes. These cover colour, typography, spacing and the focus ring. Component class names match the SDD component names. Buttons are at least 44 × 44 px, and the layout works from 320 to 1920 px.
- **Tests:** Vitest 2 with fake timers and `vi.setSystemTime`, with `sound` mocked and localStorage cleared before each test.
  - Unit tests cover `time.js`, `timerReducer.js`, `storage.js`, `sound.js`, `title.js` and `useTimer.js`.
  - Integration tests in `App.test.jsx` cover the rest, including a check that notification permission is never requested.

## Definition of Done

- [ ] Code is merged to `main` of github.com/sdlc-demo-apps/sdlc-pomodoro-timer-r6 through a pull request that names the story ID and BRD ref.
- [ ] The npm scripts are unchanged, and the `ci.yml` run on the pull request passes `npm ci`, `npm test` and `npm run build`.
- [ ] Each acceptance criterion has at least one named Vitest test, using fake timers and mocked `Date` and audio where needed. All tests pass in CI.
- [ ] Storage tests cover the key, the JSON shape, and missing or malformed data (NFR-06).
- [ ] No external fonts, scripts or network calls are added. No notification permission is requested.
- [ ] Controls are keyboard-usable, have accessible names and show a visible focus indicator (NFR-01).
- [ ] The code review is complete and its comments are resolved.
- [ ] `deploy-pages.yml` has deployed `dist/` from `main`, and the Pages URL loads.
- [ ] The story's behaviour is checked by hand on the deployed URL on a laptop and at 320 px wide. This includes the sound for S4 and the count surviving a reload for S6 and S7.
- [ ] Any AC that cannot be tested automatically is listed as a known issue for the Test Report.

## Risks and assumptions

- **Time logic:** exactly-once completion and midnight rollover are easy to get wrong. Mitigation: the reducer is pure and has unit tests that cover the edge cases.
- **Locked phones:** sound may be late or silent on a locked phone (A7). This is accepted as a known limitation.
- **Checks jsdom cannot do:** jsdom cannot measure layout or play audio. The 320 px layout, the 44 px touch targets and audible sound are checked by hand on the deployed site.
- **Velocity:** the 24-point velocity is an assumption, with no history behind it.

## Not in this sprint

- **S9 Mute toggle (Could Have, 2 points):** it stays in the backlog because the planned work fills the capacity. It is picked up only if the planned stories finish early. `muted` is already in the storage shape and stays false until then.
- **Out of scope per the BRD:** custom durations, auto-starting the next session, push notifications, restoring a running timer after a reload, themes, history beyond today, and accounts or sync.