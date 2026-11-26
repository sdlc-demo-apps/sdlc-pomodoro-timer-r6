# Business Requirements (Lite BRD): Pomodoro Timer

## Executive summary

Pomodoro Timer is a proof of concept (POC) for a demo. It is a static, browser-based web app that helps one person work in focused 25-minute sessions with short breaks in between. The user starts, pauses and resets a large MM:SS countdown and switches between three fixed modes: Focus (25 min), Short break (5 min) and Long break (15 min). When a session reaches 00:00, the app plays a short sound, shows an in-page message, and switches to the suggested next mode. It then waits for the user to press Start. After every 4th completed focus session it suggests a long break.

The app counts today's completed focus sessions and stores the count in the browser, so it survives a page reload. The count resets at local midnight. Remaining time is calculated from the session's end timestamp, so the timer stays accurate when the tab is in the background.

The app runs on phones and laptops, needs no login and no server, and is deployed to GitHub Pages. It is built in one sprint of 10 user stories. This BRD also holds the user stories and acceptance criteria (Phase 1 merged into the Lite BRD).

## Business objectives

| ID | Objective | Success measure |
|---|---|---|
| OBJ-01 | Help the user work in focused, timed sessions | On the deployed GitHub Pages site, the user starts a Focus session and it counts down to 00:00. A sound plays and an in-page message appears. |
| OBJ-02 | Show the user's progress for today | After at least 1 completed focus session, the "today" count shows the same value after a page reload. |
| OBJ-03 | Encourage regular, longer rest | After the 4th completed focus session in a cycle, the app switches to Long break (15:00) instead of Short break (5:00). |
| OBJ-04 | Deliver a tested demo in one sprint | Every Must and Should acceptance criterion is covered by an automated test that passes in CI. The app is deployed to GitHub Pages at the end of Sprint 1. |

## User personas

### P1: Focused solo worker (student or remote worker)

- **Who:** a student revising for exams, or a remote worker doing deep work, working alone.
- **Devices:** a phone (often propped next to a laptop) or a laptop browser.
- **Goal:** work in 25-minute blocks, take breaks at the right time, and see how many focus sessions they finished today.
- **Pain points:** loses track of time; forgets to take breaks or takes breaks that are too long; doesn't want to install an app or create an account.
- **Needs:** large, readable digits; one-tap controls; a clear signal when time is up; a count that is not lost when the page reloads.

## Scope (in and out)

### In scope

- Countdown timer shown in large MM:SS digits with Start, Pause and Reset buttons
- Three fixed modes switchable with buttons: Focus (25 min), Short break (5 min), Long break (15 min). Switching mode or resetting does not count as a completed session.
- Remaining time calculated from the session's end timestamp, so the timer stays accurate when the tab is in the background or the screen is locked
- When a session reaches 00:00, a short sound plays and an in-page message appears (no browser notification permission)
- After a session ends, the app switches to the suggested next mode and waits for Start:
  - Focus is followed by a short break, or by a long break after every 4th completed focus session.
  - A break is followed by Focus.
- Today's completed focus session count (only sessions that reach 00:00):
  - stored in browser localStorage
  - kept across reloads
  - reset at local midnight
- 4-session cycle position:
  - stored in localStorage
  - continues across the day
  - restarts after a long break is taken
  - a reload resets the running timer to the start of its mode
- Remaining time shown in the browser tab title while the timer runs (Should Have)
- Mute toggle for the end-of-session sound (Could Have, built only if time permits)
- Responsive layout that works on a phone screen and a laptop, deployed as a static site on GitHub Pages

### Out of scope

- Custom or user-editable session durations (fixed at 25/5/15 minutes for this POC)
- Automatically starting the next session without the user pressing Start
- Browser or system push notifications and the notification permission prompt
- Guaranteed sound on a locked phone screen (a known browser limitation)
- Restoring a running timer's remaining time after a page reload
- Light/dark theme switching
- Session history or statistics beyond today's count
- User accounts, login, a server, a database or syncing across devices
- Task lists, labels or linking sessions to tasks
- Production-grade availability, scale, monitoring or compliance targets (this is a demo POC)

## Business requirements

| BR ID | Description | Persona | MoSCoW | Rationale |
|---|---|---|---|---|
| BR-01 | Show a countdown in large MM:SS digits with Start, Pause and Reset controls. Pause keeps the remaining time. Reset stops the timer and restores the full duration of the current mode. | P1 | Must | This is the core function. The user must see and control the time left at a glance. |
| BR-02 | Provide three fixed modes, switchable with buttons: Focus 25:00, Short break 05:00, Long break 15:00. Switching mode stops the timer and loads that mode's full duration. Neither Reset nor a mode switch counts as a completed session. | P1 | Must | These are the standard Pomodoro intervals. Fixed durations keep the POC small. |
| BR-03 | Calculate remaining time from the session's end timestamp, not by counting ticks. The timer stays accurate when the tab is in the background or the screen is locked. | P1 | Must | Browsers throttle timers in background tabs. Without this, sessions would run long. |
| BR-04 | When a session reaches 00:00, play a short sound and show an in-page message that names the session that ended. Do not use browser notifications. | P1 | Must | The user needs a clear signal that time is up, without a permission prompt. |
| BR-05 | After a session ends, switch to the suggested next mode and wait for Start. After Focus, suggest Short break, or Long break after every 4th completed focus session in the cycle. After any break, suggest Focus. | P1 | Must | This guides the user through the Pomodoro rhythm while leaving them in control. |
| BR-06 | Count today's completed focus sessions (only Focus sessions that reach 00:00). Show the count on screen, store it in localStorage so it survives a reload, and reset it at local midnight. | P1 | Must | Visible progress motivates the user. Losing the count on reload would break trust. |
| BR-07 | Track the 4-session cycle position in localStorage. It continues across the day and restarts after a long break is taken. A page reload keeps the count and cycle position but resets the current timer to the start of its mode. | P1 | Must | The long-break suggestion stays correct after a reload. Not restoring the running timer keeps the build simple. |
| BR-08 | While the timer runs, show the remaining time and mode in the browser tab title. | P1 | Should | The user can see the time left while working in another tab. |
| BR-09 | Provide a mute toggle that silences the end-of-session sound. The in-page message still shows. | P1 | Could | This is useful in quiet places such as libraries. It is not essential for the demo. |
| BR-10 | Use a responsive layout that is usable on phone screens (from 320 px wide) and laptop screens, with no horizontal scrolling. | P1 | Must | The persona uses both a phone and a laptop. |

## User stories

### US-01: Start, pause and reset the timer

As a focused solo worker, I want to start, pause and reset a large MM:SS countdown so that I can control my work session at a glance.

- **Serves:** BR-01
- **Acceptance criteria:**
  - Given the app loads for the first time, when the page is shown, then the mode is Focus and the display reads 25:00 in large digits, with Start and Reset buttons visible.
  - Given the timer shows 25:00, when I press Start and 3 seconds pass, then the display reads 24:57 and the Start button is replaced by a Pause button.
  - Given the timer is running, when I press Pause and then wait 10 seconds, then the display does not change. When I press Start again, it continues from the paused time.
  - Given the timer is running or paused, when I press Reset, then the timer stops and the display shows the full duration of the current mode.

### US-02: Switch between Focus, Short break and Long break

As a focused solo worker, I want to switch between Focus, Short break and Long break with one tap so that I can choose the right session.

- **Serves:** BR-02
- **Acceptance criteria:**
  - Given any state, when I press Focus, Short break or Long break, then the display shows 25:00, 05:00 or 15:00 respectively and the timer is stopped.
  - Given the selected mode, when the page is shown, then the active mode button is visually marked and exposed as selected to assistive technology (for example aria-pressed="true").
  - Given a Focus session is running with 10:00 left, when I switch to Short break, then today's count does not change.

### US-03: Accurate time in the background

As a focused solo worker, I want the timer to stay accurate when I switch tabs or lock my phone so that my sessions are the right length.

- **Serves:** BR-03
- **Acceptance criteria:**
  - Given a Focus session is started at time T, when the display is next updated at T + 10 minutes (even if no ticks ran in between), then it reads 15:00.
  - Given a running session whose end timestamp has already passed when the app next updates, when the update runs, then the session is treated as completed exactly once (sound, message, count and next-mode rules apply once).
  - Given a session is paused and later resumed, when it resumes, then a new end timestamp is set from the remaining time, so the paused period is not counted.

### US-04: End-of-session alert

As a focused solo worker, I want to hear a short sound and see a message when a session ends so that I know it is time to switch.

- **Serves:** BR-04
- **Acceptance criteria:**
  - Given a running Focus session, when it reaches 00:00, then a short sound is played once and an in-page message appears, for example "Focus session complete. Time for a short break."
  - Given a running break, when it reaches 00:00, then a sound is played and a message appears, for example "Break over. Ready to focus?"
  - Given the message is shown, when it appears, then it is announced to screen readers (aria-live region) and can be dismissed with a button.
  - Given any session ends, when the alert is shown, then the app never requests browser notification permission.

### US-05: Suggested next mode and long break after 4 focus sessions

As a focused solo worker, I want the app to switch to the right next session and wait for me so that I follow the Pomodoro rhythm without losing control.

- **Serves:** BR-05
- **Acceptance criteria:**
  - Given a Focus session reaches 00:00 and the cycle position becomes 1, 2 or 3, when the session ends, then the mode switches to Short break, the display shows 05:00 and the timer stays stopped until I press Start.
  - Given a Focus session reaches 00:00 and the cycle position becomes 4, when the session ends, then the mode switches to Long break and the display shows 15:00, stopped.
  - Given a Short break or Long break reaches 00:00, when it ends, then the mode switches to Focus and the display shows 25:00, stopped.

### US-06: Today's completed focus sessions

As a focused solo worker, I want to see how many focus sessions I completed today, even after a reload, so that I can track my progress.

- **Serves:** BR-06
- **Acceptance criteria:**
  - Given today's count is 2, when a Focus session reaches 00:00, then the count shows 3. When a break reaches 00:00 or a Focus session is reset, the count does not change.
  - Given today's count is 3, when I reload the page, then the count still shows 3.
  - Given a count of 3 was stored with yesterday's local date, when the app loads or updates after local midnight, then the count shows 0.

### US-07: Keep the cycle position across reloads

As a focused solo worker, I want the app to remember where I am in the 4-session cycle so that the long break is still suggested at the right time after a reload.

- **Serves:** BR-07
- **Acceptance criteria:**
  - Given 3 focus sessions are completed in the current cycle, when I reload the page and complete 1 more Focus session, then the app switches to Long break.
  - Given the cycle position is 4, when a Long break reaches 00:00, then the cycle position restarts at 0. The next completed Focus session is followed by a Short break.
  - Given a Focus session is running with 12:00 left, when I reload the page, then the timer shows the full duration of the current mode (25:00) and is stopped, and the count and cycle position are unchanged.

### US-08: Remaining time in the tab title

As a focused solo worker, I want to see the remaining time in the browser tab title so that I can check it while working in another tab.

- **Serves:** BR-08
- **Acceptance criteria:**
  - Given a Focus session is running with 24:57 left, when the display updates, then the document title is "24:57 · Focus · Pomodoro Timer".
  - Given the timer is paused, reset or stopped, when the display updates, then the document title is "Pomodoro Timer".

### US-09: Mute the end-of-session sound

As a focused solo worker, I want to mute the end sound so that I can use the timer in a quiet place.

- **Serves:** BR-09
- **Acceptance criteria:**
  - Given mute is on, when a session reaches 00:00, then no sound is played and the in-page message still appears.
  - Given mute is off (the default), when a session reaches 00:00, then the sound is played.
  - Given the mute toggle, when it is shown, then its on/off state is visible and exposed to assistive technology (for example aria-pressed).

### US-10: Works on phone and laptop

As a focused solo worker, I want the timer to fit my phone and my laptop screens so that I can use it on either device.

- **Serves:** BR-10
- **Acceptance criteria:**
  - Given a viewport 320 px wide, when the page is shown, then the digits, mode buttons, controls and today's count are all visible without horizontal scrolling.
  - Given a phone screen, when the page is shown, then every button has a touch target of at least 44 × 44 CSS px.
  - Given the page, when it is shown on any screen, then it includes a viewport meta tag (width=device-width, initial-scale=1).

## Non-functional requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-01 | Accessibility | Meet WCAG 2.1 AA:<br>• All controls are usable with the keyboard and have a visible focus indicator.<br>• Text contrast is at least 4.5:1 (3:1 for the large digits).<br>• Buttons have accessible names.<br>• The end-of-session message is announced through an aria-live region.<br>• The countdown is not announced every second.<br>• Colour is not the only way the active mode is shown. |
| NFR-02 | Timing accuracy | The displayed time is within 1 second of the time remaining to the stored end timestamp. The display refreshes at least once per second while visible. |
| NFR-03 | Performance | First load on a typical laptop broadband connection shows an interactive timer within 2 seconds. Mode switches and button presses update the display without perceptible delay. |
| NFR-04 | Browser and device support | Supports current versions of Chrome, Edge, Firefox and Safari on desktop, plus Safari on iOS and Chrome on Android. Screen widths range from 320 px to 1920 px. |
| NFR-05 | Privacy of browser storage | localStorage holds only the local date, today's count, the cycle position and (if built) the mute setting. It holds no personal data. There are no cookies, analytics, external fonts, scripts or network calls after the page loads. |
| NFR-06 | Resilience of stored data | If stored data is missing, malformed or from an unknown version, the app starts with a count of 0 and a cycle position of 0, without errors. |
| NFR-07 | Availability | Best effort on the GitHub Pages free tier. There is no SLA, RTO, RPO, monitoring or on-call. This is a demo POC. |
| NFR-08 | Quality | Every Must and Should acceptance criterion has an automated Vitest + Testing Library test (using fake timers for time) that passes in CI on every pull request. |

## Assumptions and constraints

### Constraints

- The app is a static, front-end-only web app deployed to GitHub Pages. There is no server, database, login or secrets.
- It is built on the demo repo's starter template: React 18 + Vite 5, Vitest 2 + Testing Library + jsdom, and CI on GitHub Actions (`npm ci`, `npm test`, `npm run build`).
- Delivery is one sprint (Sprint 1) of 10 user stories. US-09 (Could Have) is built only if time permits.
- Durations are fixed at 25/5/15 minutes.
- This is a POC for a demo with one user or a handful of demo users. There are no user-count, concurrency or uptime targets.

### Assumptions

- **A1:** A long break counts as "taken" when a Long break session reaches 00:00. Switching to Long break manually and resetting it does not restart the cycle.
- **A2:** Once the cycle position reaches 4, every completed Focus session suggests a Long break until a long break is taken. The position does not go above 4.
- **A3:** The cycle position is not reset at local midnight; only the daily count is.
- **A4:** "Today" uses the device's local date. The stored date is compared on load and on each display update.
- **A5:** Switching mode while the timer runs stops the timer without confirmation.
- **A6:** The sound is generated in the browser (Web Audio API) or bundled as a small audio file in the repo. It is never loaded from an external URL.
- **A7:** Browsers allow the sound after the user has pressed Start at least once (the autoplay policy). Sound may not play on a locked phone screen. This is a known limitation and is listed out of scope.
- **A8:** The mute setting, if built, is stored in localStorage and defaults to off.
- **A9:** The UI text is English only.

## Dependencies

| ID | Dependency | Impact if unavailable |
|---|---|---|
| D-01 | Demo GitHub repository with the starter template (React 18, Vite 5, Vitest 2) | Build cannot start. |
| D-02 | GitHub Actions CI workflow (`ci.yml`) | Acceptance criteria cannot be verified by CI tests. |
| D-03 | GitHub Pages and the `deploy-pages.yml` workflow | The app cannot be deployed for the demo. |
| D-04 | Browser APIs: localStorage, Date, Web Audio API or HTMLAudioElement, and document.title | Count persistence, timing, sound and the tab title depend on these. |
| D-05 | Admin availability to approve each phase gate | Phases cannot progress. |
| D-06 | Demo Jira project (Phase 2) | The backlog cannot be created in Jira. |

## Sign-off

| Role | Name | Decision | Date |
|---|---|---|---|
| Approver (Sponsor, Product Owner) | Admin | Pending gate approval | — |

**Status:** Pending gate approval (Gate 0: Charter and Lite BRD sign-off). Phase 2 (Backlog & planning) may not begin until this BRD is approved.
