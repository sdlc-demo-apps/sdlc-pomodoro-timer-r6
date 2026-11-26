# Test Report: Pomodoro Timer

## Summary

**Verdict:** Ready for release to Phase 7, with known issues. Two acceptance criteria are not fully verified by automated tests: S10 AC1 (no horizontal scrolling at 320 px) needs a hand check on the deployed site, and the "malformed" part of S6 AC4 has no named test that can be cited.

| Item | Result |
|---|---|
| CI result | Success (`npm ci`, `npm test`, `npm run build`) |
| Test files | 7 passed of 7 |
| Tests run in CI | 101 passed of 101 |
| Named tests extracted from the test files | 83 (the extracted list is shorter than the 101 tests CI ran; see Defects and known issues) |
| Acceptance criteria covered | 27 of 29 Sprint 1 ACs fully covered by passing tests; 1 Partly covered (S6 AC4); 1 Not covered (S10 AC1) |
| CI fix attempts | 0 |

The 29 ACs belong to the nine planned stories: S1–S8 and S10. S9 (mute, Could Have) stayed in the backlog as planned and is not tested.

## Test approach

- **Tools:** Vitest 2, Testing Library and jsdom. Time-dependent tests use fake timers and a mocked `Date`. Sound tests mock `AudioContext`.
- **Where they ran:** GitHub Actions `ci.yml`, on pull request #1 (`sprint-1/run-6`).
- **Integration tests:** `src/App.test.jsx` renders the whole app and has one named test per AC for S1–S8 and S10.
- **Unit tests:** These back the integration tests:
  - `timerReducer.test.js`: state transitions, completion rules, midnight rollover.
  - `time.test.js`: durations, MM:SS formatting, remaining time, local date, next mode.
  - `storage.test.js`: the `pomodoro-timer:v1` contract and bad data.
  - `sound.test.js`: the Web Audio beep.
  - `title.test.js`: the tab title.
  - `useTimer.test.js`: the interval, audio unlock and saving.
- **Automated:** All timer logic, mode rules, count and cycle persistence, the aria attributes, the tab title, the viewport meta tag and the CSS rules for touch targets and wrapping.
- **Not automated:** jsdom cannot measure layout or play audio. The following need a hand check on the deployed site:
  - real layout at 320 px wide;
  - real 44 × 44 px touch targets;
  - hearing the beep on a device.
- **Time zones:** The PR says the tests also pass in the New York and Kiritimati time zones. That was run in the build agent's workspace. The CI log does not show it.

## Acceptance criteria coverage

| Story | Acceptance criterion | Test(s) that verify it (file: test name) | Result |
|---|---|---|---|
| S1 | First load: Focus, 25:00, Start and Reset visible | App.test.jsx: on first load the mode is Focus, the display reads 25:00, and Start and Reset are visible; timerReducer.test.js: is Focus, 25:00, stopped, with the saved count and cycle | Pass |
| S1 | Start + 3 s reads 24:57; Start becomes Pause | App.test.jsx: after Start and 3 s the display reads 24:57 and Start becomes Pause; timerReducer.test.js: 3 s after START the remaining time reads 24:57 | Pass |
| S1 | Pause holds for 10 s; Start resumes | App.test.jsx: after Pause the display does not change for 10 s; Start resumes from the paused time; timerReducer.test.js: PAUSE keeps the remaining time and TICKs do not change it | Pass |
| S1 | Reset stops and shows the full duration | App.test.jsx: Reset stops the timer and shows the full duration of the current mode; timerReducer.test.js: RESET stops the timer and restores the full duration of the current mode | Pass |
| S2 | Mode buttons show 25:00 / 05:00 / 15:00, stopped | App.test.jsx: pressing Focus, Short break or Long break shows 25:00, 05:00 or 15:00, stopped; time.test.js: Focus is 25:00, Short break 05:00, Long break 15:00 | Pass |
| S2 | Active mode marked, aria-pressed="true" | App.test.jsx: the active mode button has aria-pressed=true and the others false | Pass |
| S2 | Switching mid-Focus does not change the count | App.test.jsx: switching from a running Focus session with 10:00 left does not change today's count; timerReducer.test.js: switching from a running Focus with 10:00 left does not change the count or cycle | Pass |
| S3 | T + 10 min reads 15:00 with no ticks | App.test.jsx: a Focus session started at T reads 15:00 when next updated at T + 10 min, with no ticks in between; timerReducer.test.js: a session started at T reads 15:00 at T + 10 min with no ticks in between | Pass |
| S3 | Overdue session completes exactly once | App.test.jsx: a session whose end has passed is completed exactly once; timerReducer.test.js: an overdue session completes exactly once; useTimer.test.js: an overdue session (ticks throttled) completes once on the next tick (S3) | Pass |
| S3 | Resume sets a new end timestamp | App.test.jsx: resuming after a pause sets a new end, so the paused period is not counted; timerReducer.test.js: resuming after a pause sets a new end timestamp, so the pause is not counted | Pass |
| S4 | Focus 00:00: one sound plus the focus message | App.test.jsx: when Focus reaches 00:00, one sound plays and the focus message appears; useTimer.test.js: plays the sound once per completion (S3, S4) | Pass (sound mocked) |
| S4 | Break 00:00: sound plus "Break over. Ready to focus?" | App.test.jsx: when a break reaches 00:00, a sound plays and 'Break over. Ready to focus?' appears | Pass (sound mocked) |
| S4 | Message in an aria-live region with Dismiss | App.test.jsx: the message is in an aria-live region and has a Dismiss button that removes it | Pass |
| S4 | Never requests notification permission | App.test.jsx: the app never requests notification permission | Pass |
| S5 | Focus ends at cycle 1–3: Short break, 05:00, stopped | App.test.jsx: Focus ending at cycle positions 1, 2 and 3 switches to Short break, 05:00, stopped | Pass |
| S5 | Focus ends at cycle 4: Long break, 15:00, stopped | App.test.jsx: Focus ending at cycle position 4 switches to Long break, 15:00, stopped | Pass |
| S5 | Any break ends: Focus, 25:00, stopped | timerReducer.test.js: a Short break ending switches to Focus, 25:00, and keeps count and cycle; a Long break ending restarts the cycle at 0, and the next Focus leads to a Short break; time.test.js: any break ending suggests Focus | Pass (unit level only) |
| S6 | Count 2 becomes 3 on Focus 00:00; break or reset does not change it | App.test.jsx: with a count of 2, a Focus session reaching 00:00 makes it 3; a break ending or a reset does not | Pass |
| S6 | Count of 3 survives a reload | App.test.jsx: a count of 3 still shows 3 after a reload | Pass |
| S6 | Yesterday's count shows 0 on load or update after midnight | App.test.jsx: a count stored with yesterday's local date shows 0 on load; a count from yesterday shows 0 on the first update after midnight | Pass |
| S6 | Missing or malformed storage starts at 0 without errors | Missing: storage.test.js: missing data gives the defaults; unavailable storage gives the defaults; a throwing setItem is ignored. Malformed: no extracted test name can be cited | Partly covered (missing: Pass; malformed: Not covered; see known issue 2) |
| S7 | Cycle 3, reload, 1 more Focus: Long break | App.test.jsx: with 3 sessions in the cycle, after a reload and 1 more Focus session, the mode becomes Long break | Pass |
| S7 | Long break end restarts the cycle at 0 | App.test.jsx: when a Long break reaches 00:00 the cycle restarts at 0 and the next Focus is followed by a Short break | Pass |
| S7 | Reload at 12:00 shows 25:00, stopped | App.test.jsx: a reload with Focus running at 12:00 shows 25:00, stopped, with count and cycle unchanged | Pass |
| S8 | Running title "24:57 · Focus · Pomodoro Timer" | App.test.jsx: while Focus runs with 24:57 left the title is '24:57 · Focus · Pomodoro Timer'; title.test.js: same name (S8) | Pass |
| S8 | Paused, reset or stopped title "Pomodoro Timer" | App.test.jsx: when paused, reset or stopped the title is 'Pomodoro Timer'; useTimer.test.js: updates document.title while running and restores it when paused (S8) | Pass |
| S10 | 320 px wide: everything visible, no horizontal scroll | App.test.jsx: the digits, mode buttons, controls and count render with their styled classes (checks markup and CSS only, not layout) | Not covered |
| S10 | Buttons at least 44 × 44 CSS px | App.test.jsx: every button style has a 44 px touch target, buttons wrap, digits scale and focus is visible | Pass (CSS rule; hand check pending) |
| S10 | Viewport meta tag | App.test.jsx: index.html has the viewport meta tag width=device-width, initial-scale=1 | Pass |

## Requirements traceability

| BR ID | Story | Code module(s) | Test file(s) | Status |
|---|---|---|---|---|
| BR-01 | S1 | timerReducer, useTimer, time.js, TimerDisplay, Controls | App.test.jsx, timerReducer.test.js, time.test.js | Pass |
| BR-02 | S2 | timerReducer (SET_MODE), ModeSelector | App.test.jsx, timerReducer.test.js, time.test.js | Pass |
| BR-03 | S3 | timerReducer, time.js (remainingMs), useTimer | App.test.jsx, timerReducer.test.js, useTimer.test.js, time.test.js | Pass |
| BR-04 | S4 | sound.js, EndMessage, useTimer | App.test.jsx, sound.test.js, useTimer.test.js | Pass (device sound: hand check) |
| BR-05 | S5 | time.js (nextMode), timerReducer | App.test.jsx, time.test.js, timerReducer.test.js | Pass |
| BR-06 | S6 | storage.js, timerReducer, TodayCount, time.js (localDateKey) | App.test.jsx, storage.test.js, timerReducer.test.js, time.test.js | Partly covered (malformed storage: no named test cited) |
| BR-07 | S7 | storage.js, timerReducer, useTimer | App.test.jsx, storage.test.js, useTimer.test.js | Pass |
| BR-08 | S8 | title.js, useTimer | App.test.jsx, title.test.js, useTimer.test.js | Pass |
| BR-09 | S9 | Not built (Backlog, Could Have) | None | Not in Sprint 1 |
| BR-10 | S10 | styles.css, index.html, all components | App.test.jsx | Partly covered (1 AC Not covered) |

Module names come from the PR description and the test file paths.

## CI run

- **Result:** success
- **Link:** https://github.com/sdlc-demo-apps/sdlc-pomodoro-timer-r6/actions/runs/45852252708/job/140021352328
- **Commit tested:** d16fc02, the merge commit of PR #1
- **Environment:** Node v22.23.5, npm 10.9.9, Vitest v2.1.8, Vite v5.4.11
- **Test summary from the log:**

```
✓ src/timer/timerReducer.test.js (25 tests) 21ms
✓ src/hooks/useTimer.test.js (6 tests) 155ms
✓ src/services/storage.test.js (17 tests) 25ms
✓ src/services/sound.test.js (4 tests) 32ms
✓ src/timer/time.test.js (10 tests) 5ms
✓ src/App.test.jsx (35 tests) 1676ms
✓ src/services/title.test.js (4 tests) 5ms
Test Files  7 passed (7)
     Tests  101 passed (101)
  Duration  3.15s
```

- **Build:** `vite build` transformed 42 modules and built `dist/` in 726 ms. The JS bundle is 148.58 kB (48.04 kB gzip).
- **Log scope:** The log shown is an excerpt of the last 120 lines. It does not list every test name.

## Code review

The Reviewer passed all 7 checks at Gate 5:

1. **Must stories implemented:** Pass. S1–S7, S10 and S8 are built. S9 is correctly left out.
2. **AC coverage:** Pass. Needs attention: the S10 layout ACs are covered only by CSS and markup assertions. The manual check on the deployed site should stay listed as a known issue.
3. **Follows the approved design:** Pass. The components, reducer actions, the `pomodoro-timer:v1` storage contract and the mockup tokens match the SDD and mockup.
4. **No network calls, secrets or tracking:** Pass.
5. **Accessibility:** Pass. Controls are native buttons, mode buttons use `aria-pressed`, `focus-visible` gives a 3 px ring, and the message is in a polite live region.
6. **CI passed:** Pass.
7. **Workflows and Vite base path unchanged:** Pass.

## Defects and known issues

No test failed and no defects were logged. Known issues:

1. **S10 AC1 Not covered.** jsdom cannot measure layout, so "no horizontal scrolling at 320 px" is not verified. **Action:** check by hand on the deployed site at a 320 px viewport.
2. **S6 AC4 Partly covered: the "malformed" part is Not covered.** The extracted test names cover missing and unavailable storage. The PR says malformed and wrong-version data are tested, but no extracted test name says "malformed", so no test can be cited. CI ran 17 storage tests, and only 7 names were extracted. **Action:** extract the remaining storage test names, or check by hand that a malformed `pomodoro-timer:v1` value loads as a count of 0 without errors.
3. **S10 AC2 and S4 sound need hand checks.**
   - The 44 × 44 px targets are checked only as CSS rules.
   - The beep is checked only through a mocked `AudioContext`.
   - **Action:** confirm both on a real device after deployment.
4. **Test name extraction is incomplete.** 83 tests were named, but CI ran 101. The missing names cannot be cited in this report.
5. **S5 AC3** (break ends, then Focus) is verified only by unit tests, not by an App-level test.
6. **Sound on a locked phone** may be late or silent. This is the accepted limitation A7.
7. **Vite base path:** `vite.config.js` is unchanged. The path comes from `BASE_PATH`, which is set by `deploy-pages.yml`. **Action:** confirm the deployed site loads its assets in Phase 7.
8. **Housekeeping from the CI log:**
   - `npm ci` reports 5 dependency vulnerabilities (2 moderate, 1 high, 2 critical).
   - The GitHub Actions log shows a Node.js 20 deprecation warning.
   - Neither affected the run.

## UAT sign-off

| Role | Name | Decision | Date |
|---|---|---|---|
| Approver (Sponsor, Product Owner) | Admin | Pending gate approval | — |

The Admin's Gate 6 approval is the UAT sign-off. The app is deployed in Phase 7.
