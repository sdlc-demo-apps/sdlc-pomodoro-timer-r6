# Release Notes: Pomodoro Timer 1.0.0

## Release

| Version | Planned deployment date | Live URL | Pull request |
|---|---|---|---|
| 1.0.0 | 2026-11-26 | https://sdlc-demo-apps.github.io/sdlc-pomodoro-timer-r6/ | [#1](https://github.com/sdlc-demo-apps/sdlc-pomodoro-timer-r6/pull/1) |

This is the Sprint 1 release of a proof of concept (POC) for a demo. It is not a production system.

## What's new

**E1 Core timer**
- S1: Start, pause and reset a large MM:SS countdown. It opens on Focus at 25:00.
- S2: Switch between Focus (25:00), Short break (05:00) and Long break (15:00) with one tap.
- S3: The timer stays accurate when you switch tabs or lock your phone, because it counts down to a fixed end time.

**E2 Session flow and alerts**
- S4: A short sound plays and an in-page message appears when a session ends. No notification permission is asked for.
- S5: After a session ends, the app switches to the right next mode and waits for you to press Start: a Short break after Focus, a Long break after every 4th Focus, Focus after any break.

**E3 Progress and persistence**
- S6: Today's completed Focus sessions are counted, kept after a reload and reset at local midnight.
- S7: Your place in the 4-session cycle is kept after a reload. A reload resets a running timer to the start of its mode.

**E4 Reach and visibility**
- S8: While a session runs, the tab title shows the time left, for example "24:57 · Focus · Pomodoro Timer".
- S10: The layout fits phone and laptop screens, with large touch targets.

Not in this release: S9 mute toggle (Could Have, still in the backlog).

## How it was verified

CI on GitHub Actions ran `npm ci`, `npm test` and `npm run build` on merge commit d16fc02 of PR #1. All 7 test files and all 101 tests passed (Vitest 2, Testing Library, jsdom, with fake timers and a mocked `Date` and `AudioContext`). CI needed 0 fix attempts. Of the 29 Sprint 1 acceptance criteria, 27 are fully covered by passing tests, 1 is partly covered and 1 is not covered. The Reviewer passed all 7 code review checks. The Admin's Gate 6 approval is the acceptance (UAT) sign-off.

## Known issues

1. **S10 AC1 Not covered.** No horizontal scrolling at 320 px is not tested, because jsdom cannot measure layout. Check it by hand on the live site.
2. **S6 AC4 Partly covered.** Missing storage is tested. No cited test proves that malformed storage starts at 0. Check it by hand.
3. **Hand checks pending.** The 44 × 44 px touch targets are tested only as CSS rules. The beep is tested only through a mock. Confirm both on a real device.
4. **Test name extraction is incomplete.** Only 83 of the 101 tests CI ran were named in the extracted list, so the other 18 cannot be cited as evidence.
5. **S5 AC3** (Focus after a break) is tested only at unit level.
6. **Sound on a locked phone** may be late or silent (accepted limitation A7).
7. **Asset paths:** the Vite base path comes from `BASE_PATH` in `deploy-pages.yml`. Confirm the live site loads its assets.
8. **Housekeeping:** `npm ci` reports 5 dependency vulnerabilities (2 moderate, 1 high, 2 critical). The CI log shows a Node.js 20 deprecation warning. Neither affected the run.

## Dependencies and environment changes

- **Runtime:** React 18 only. No extra runtime dependencies. Built with Vite 5.
- **Hosting:** a static `dist/` on the GitHub Pages free tier, deployed by `deploy-pages.yml`. Availability is best effort, with no SLA or monitoring. Rollback means redeploying the previous commit.
- **Browsers:** current evergreen browsers on laptop and phone (Chrome, Edge, Firefox, Safari) with Web Audio and localStorage.
- **Data:** today's count and cycle position are stored only in the browser's localStorage under the key `pomodoro-timer:v1`. Nothing leaves the device.
- **No** server, database, login, secrets, external fonts or network calls.

## Go-live sign-off

| Role | Name | Decision | Date | Version |
|---|---|---|---|---|
| Approver (Sponsor, Product Owner), Gate 7 | Admin | Pending gate approval | — | 1.0.0 |

Approving Gate 7 is the go-live sign-off. It deploys release 1.0.0 to GitHub Pages. The app then adds the deployment record to these notes.

## Deployment record

| Live URL | Deployed (UTC) | Workflow run | Commit | Check |
|---|---|---|---|---|
| https://sdlc-demo-apps.github.io/sdlc-pomodoro-timer-r6/ | 2026-11-26 16:00 | [run](https://github.com/sdlc-demo-apps/sdlc-pomodoro-timer-r6/actions/runs/45854564550) | `e185399` | HTTP 200 |
