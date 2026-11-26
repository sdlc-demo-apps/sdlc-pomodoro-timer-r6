# Product Backlog: Pomodoro Timer

This backlog turns the approved Lite BRD into one sprint of work. It is a proof of concept (POC) for a demo. The app is a static React 18 + Vite 5 app on GitHub Pages, with no server, database, login or secrets. Each story maps one-to-one to a BRD user story (US-01 to US-10).

## Epic overview

| Epic ID | Epic | Goal | Stories |
|---|---|---|---|
| E1 | Core timer | The user can run, pause, reset and switch accurate fixed-length sessions. | S1, S2, S3 |
| E2 | Session flow and alerts | The user is told when a session ends and guided to the right next session. | S4, S5, S9 |
| E3 | Progress and persistence | Today's count and the 4-session cycle survive reloads and reset at the right time. | S6, S7 |
| E4 | Reach and visibility | The timer works on phone and laptop and is visible from other tabs. | S8, S10 |

## Stories

| ID | Epic | User story | Acceptance criteria | MoSCoW | T-shirt | Points | Sprint | Status | Depends on | BRD ref |
|---|---|---|---|---|---|---|---|---|---|---|
| S1 | E1 | As a focused solo worker, I want to start, pause and reset a large MM:SS countdown so that I can control my work session at a glance. | On first load the mode is Focus, the display reads 25:00, and Start and Reset are visible.<br>After Start and 3 s the display reads 24:57 and Start becomes Pause.<br>After Pause the display does not change for 10 s. Start resumes from the paused time.<br>Reset stops the timer and shows the full duration of the current mode. | Must | M | 3 | Sprint 1 | Planned \| Sprint 1 | — | US-01 / BR-01 |
| S2 | E1 | As a focused solo worker, I want to switch between Focus, Short break and Long break with one tap so that I can choose the right session. | Pressing Focus, Short break or Long break shows 25:00, 05:00 or 15:00, stopped.<br>The active mode button is visually marked and has aria-pressed="true".<br>Switching from a running Focus session with 10:00 left does not change today's count. | Must | S | 2 | Sprint 1 | Planned \| Sprint 1 | S1 | US-02 / BR-02 |
| S3 | E1 | As a focused solo worker, I want the timer to stay accurate when I switch tabs or lock my phone so that my sessions are the right length. | A Focus session started at T reads 15:00 when next updated at T + 10 min, even with no ticks in between.<br>A session whose end timestamp has passed is completed exactly once (sound, message, count and next mode apply once).<br>Resuming after a pause sets a new end timestamp, so the paused period is not counted. | Must | M | 3 | Sprint 1 | Planned \| Sprint 1 | S1 | US-03 / BR-03 |
| S4 | E2 | As a focused solo worker, I want to hear a short sound and see a message when a session ends so that I know it is time to switch. | When Focus reaches 00:00, one sound plays and a message such as "Focus session complete. Time for a short break." appears.<br>When a break reaches 00:00, a sound plays and a message such as "Break over. Ready to focus?" appears.<br>The message is in an aria-live region and has a Dismiss button.<br>The app never requests notification permission. | Must | M | 3 | Sprint 1 | Planned \| Sprint 1 | S3 | US-04 / BR-04 |
| S5 | E2 | As a focused solo worker, I want the app to switch to the right next session and wait for me so that I follow the Pomodoro rhythm without losing control. | When Focus ends at cycle position 1, 2 or 3, the mode becomes Short break, showing 05:00, stopped.<br>When Focus ends at cycle position 4, the mode becomes Long break, showing 15:00, stopped.<br>When any break ends, the mode becomes Focus, showing 25:00, stopped. | Must | M | 3 | Sprint 1 | Planned \| Sprint 1 | S2, S3 | US-05 / BR-05 |
| S6 | E3 | As a focused solo worker, I want to see how many focus sessions I completed today, even after a reload, so that I can track my progress. | With a count of 2, a Focus session reaching 00:00 makes it 3. A break ending or a reset does not change it.<br>A count of 3 still shows 3 after a reload.<br>A count stored with yesterday's local date shows 0 on load or update after midnight.<br>Missing or malformed storage starts at 0 without errors (NFR-06). | Must | M | 3 | Sprint 1 | Planned \| Sprint 1 | S3 | US-06 / BR-06 |
| S7 | E3 | As a focused solo worker, I want the app to remember where I am in the 4-session cycle so that the long break is still suggested at the right time after a reload. | With 3 sessions in the cycle, after a reload and 1 more completed Focus session, the mode becomes Long break.<br>When a Long break reaches 00:00, the cycle restarts at 0 and the next Focus is followed by a Short break.<br>A reload with Focus running at 12:00 shows 25:00, stopped, with count and cycle unchanged. | Must | M | 3 | Sprint 1 | Planned \| Sprint 1 | S5, S6 | US-07 / BR-07 |
| S8 | E4 | As a focused solo worker, I want to see the remaining time in the browser tab title so that I can check it while working in another tab. | While Focus runs with 24:57 left, the title is "24:57 · Focus · Pomodoro Timer".<br>When paused, reset or stopped, the title is "Pomodoro Timer". | Should | XS | 1 | Sprint 1 | Planned \| Sprint 1 | S1 | US-08 / BR-08 |
| S9 | E2 | As a focused solo worker, I want to mute the end sound so that I can use the timer in a quiet place. | With mute on, no sound plays at 00:00 but the message still appears.<br>Mute is off by default and the sound plays.<br>The toggle shows its state and exposes it with aria-pressed. | Could | S | 2 | — | Backlog \| Could Have | S4 | US-09 / BR-09 |
| S10 | E4 | As a focused solo worker, I want the timer to fit my phone and my laptop screens so that I can use it on either device. | At 320 px wide, the digits, mode buttons, controls and count are visible with no horizontal scrolling.<br>Every button has a touch target of at least 44 × 44 CSS px.<br>index.html has a viewport meta tag (width=device-width, initial-scale=1). | Must | S | 2 | Sprint 1 | Planned \| Sprint 1 | S1, S2 | US-10 / BR-10 |

## Estimation

- **Method:** T-shirt sizing first (XS, S, M, L), then Fibonacci points: XS = 1, S = 2, M = 3, L = 5, 8 = too large to fit and must be split. No story is above 3 points.
- **Per-story points:** S1 3, S2 2, S3 3, S4 3, S5 3, S6 3, S7 3, S8 1, S9 2, S10 2. The total backlog is 25 points.
- **Velocity assumption:** 24 points for one sprint. The build is done by the orchestrator's build agent on the starter template, with fake-timer tests in Vitest. There is no velocity history, so this is an assumption.
- **Confidence: Medium-high.**
  - Raising it: the scope is small and fixed, with no server or integrations.
  - Lowering it: time logic (end timestamps, exactly-once completion, local midnight) and sound in jsdom need careful fake-timer and mocking work. jsdom cannot measure layout, so S10 is checked partly by tests (meta tag, CSS classes) and partly by a manual check on the deployed site.

## Sprint 1 plan

| Story | Points | MoSCoW |
|---|---|---|
| S1 Start, pause, reset | 3 | Must |
| S2 Mode switching | 2 | Must |
| S3 Background accuracy | 3 | Must |
| S4 End-of-session alert | 3 | Must |
| S5 Suggested next mode | 3 | Must |
| S6 Today's count | 3 | Must |
| S7 Cycle persistence | 3 | Must |
| S8 Tab title | 1 | Should |
| S10 Responsive layout | 2 | Must |
| **Total planned** | **23** | |

- **Capacity:** 24 points. Planned work is 23 points, leaving 1 point of buffer.
- **S9 (mute, 2 points):** stays Backlog | Could Have. It is picked up only if the planned stories finish early.
- **Suggested order:**
  1. S1 and S2
  2. S3
  3. S4 and S5
  4. S6
  5. S7
  6. S8 and S10
- **Sprint goal (demonstrable):** On https://sdlc-demo-apps.github.io/sdlc-pomodoro-timer-r6/ the Admin can do the following on a phone and a laptop:
  - start a Focus session, pause it and reset it;
  - watch a session reach 00:00 and hear a sound and see a message;
  - see the app switch to Short break, or to Long break after the 4th focus session;
  - see the remaining time in the tab title;
  - reload the page and see today's count and cycle position kept.

  The CI tests prove every Must and Should acceptance criterion.

## Definition of Done

A story is Done | Sprint 1 only when every item applies:

- [ ] Code is merged to `main` of github.com/sdlc-demo-apps/sdlc-pomodoro-timer-r6 through a pull request that names the story ID (S1–S10) and BRD ref.
- [ ] The starter template's npm scripts are unchanged. The `.github/workflows/ci.yml` run on the pull request passes:
  - `npm ci`
  - `npm test` (Vitest 2 + Testing Library + jsdom)
  - `npm run build`
- [ ] Each acceptance criterion of the story has at least one named Vitest test, using fake timers and mocked `Date` and audio where time or sound is involved. All pass in CI.
- [ ] Storage tests cover the localStorage keys and JSON shape from the SDD, including missing or malformed data (NFR-06).
- [ ] No external fonts, scripts or network calls are added. No notification permission is requested.
- [ ] Controls are keyboard-usable, have accessible names and show a visible focus indicator (NFR-01).
- [ ] The code review is complete and its comments are resolved.
- [ ] `.github/workflows/deploy-pages.yml` has deployed `dist/` from `main`, and https://sdlc-demo-apps.github.io/sdlc-pomodoro-timer-r6/ loads.
- [ ] On the deployed URL, the story's behaviour is checked by hand on a laptop browser and at a 320 px wide viewport.
  - For S4, this includes hearing the sound after pressing Start.
  - For S6/S7, this includes the count surviving a reload.
- [ ] Any AC that cannot be tested automatically is listed as a known issue for the Test Report.

## Sign-off

| Role | Name | Decision | Date |
|---|---|---|---|
| Approver (Sponsor, Product Owner) | Admin | Pending gate approval | — |

**Status:** Pending gate approval (Gate 2: Backlog groomed). After approval, epics E1–E4 and stories S1–S10 will be created in the demo Jira project, with:

- acceptance criteria in each story's description;
- MoSCoW mapped to Jira priority;
- story points;
- the epic as parent.

Phase 3 (Solution design) begins after approval.