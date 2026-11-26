# Retrospective: Pomodoro Timer

## The run in numbers

| Phase | Minutes | Minutes waiting for the Admin | Cost | Automatic revisions |
|---|---|---|---|---|
| 0 Discovery | 7.9 | 5.4 | $0.52 | 0 |
| 2 Backlog & planning | 13.7 | 11.9 | $0.45 | 0 |
| 3 Solution design | 36.4 | 33.3 | $1.04 | 1 |
| 4 UI design | 3.1 | 1.1 | $0.68 | 1 |
| 5 Build | 18.2 | 10.7 | $1.43 | 0 |
| 6 Testing | 5.8 | 3.6 | $0.71 | 1 |
| 7 Deployment | 3.2 | 1.6 | $0.30 | 1 |
| 8 Retrospective | 0.0 (in progress) | 0.0 | $0.00 | 0 |
| **Total** | **88.3** | **67.6** | **$5.14** | **4** |

The run cost $5.14 against a cap of $7.00 (73% used). The cap was raised 0 times. Of the 88.3 minutes, 67.6 (77%) were spent waiting for the Admin, so agent working time was about 20.7 minutes. There were 12 decisions, 15 Jira issues, 27 files changed, 0 failed steps and 0 change requests.

## What went well

- **Build passed CI first time.** CI fix attempts: 0. All 7 test files and 101 of 101 tests passed on merge commit d16fc02, and the Code review scored 7/7 on its first version.
- **Early documents were right first time.** The Project Charter (7/7), BRD (11/11) and Product Backlog (8/8) each passed review on version 1, with 0 automatic revisions in Phases 0 and 2.
- **No rework from the Admin.** The run had 0 change requests and 0 edited questionnaire answers, so the confirmed scope held from intake to release.
- **Stayed within budget with no failures.** Total cost $5.14 of a $7.00 cap, cap raised 0 times, and an empty failed-steps list. Deployment returned HTTP 200 on commit e185399.
- **Honest test evidence.** The Test Report listed 27 of 29 ACs as fully covered and named the gaps (S10 AC1, S6 AC4) instead of hiding them.

## What didn't go well

- **Solution design was the slowest phase.** Phase 3 took 36.4 minutes, 41% of the run, and 33.3 of them were waiting for the Admin.
- **Four artefacts needed automatic revisions.** SDD first review 9/12, Hi-Fi Mockups 6/9, Test Report 6/7, Release Notes 5/6. Release Notes needed 3 versions.
- **Build was the costliest phase.** Phase 5 cost $1.43 (28% of total), and had 10.7 minutes of Admin waiting.
- **Test evidence was incomplete.** Only 83 of the 101 test names were extracted, so 18 tests (including 10 of the 17 storage tests) could not be cited, and S6 AC4 "malformed" storage was reported as Partly covered.
- **Two ACs could not be verified automatically.** S10 AC1 (no horizontal scroll at 320 px) is Not covered; touch targets and the beep rely on hand checks still pending.

## Root causes

- **Phase 3 waiting time:** the questionnaire (10 categories) plus the stack choice needed two Admin steps in one phase. Since 0 answers were edited, the Admin likely spent time reading suggestions that the POC defaults already fixed.
- **SDD and mockup revisions:** first drafts missed 3 mandatory items each (9/12, 6/9). The most likely cause is the writer agents not self-checking against the Phase 3 and Phase 4 gate checklists before review.
- **Release Notes 3 versions:** the notes must hold a planned date and then a deployment record added after deploy, so the artefact is edited after approval by design, plus one review revision (5/6).
- **Missing test names:** the name extractor read 83 names from 101 tests. Likely cause: it misses tests declared in loops (`it.each`) or nested `describe` blocks, as in `storage.test.js`.
- **Layout ACs not covered:** the BRD wrote S10 AC1 as a pixel layout check, which jsdom cannot measure, and no browser-based check exists in the template CI.

## Action items

| Action | Owner | Due |
|---|---|---|
| Check the live site at 320 px for horizontal scroll, 44 × 44 px targets and the beep on a real phone | Admin | Before the next run |
| Load the live site with a malformed `pomodoro-timer:v1` value and confirm the count shows 0 with no errors | Admin | Before the next run |
| Fix test name extraction to read `it.each` and nested tests so the extracted count matches CI's count | Test Report agent | Before the next run |
| Add a self-check against the gate checklist before submitting the SDD and mockup | Solution Architect agent, UX Designer agent | Before the next run |
| Plan a fix for the 5 `npm ci` vulnerabilities (2 critical) and the Node.js 20 deprecation in the template | Admin | Before the next run |

## Process improvements for the next project

1. **Pre-fill POC answers in the questionnaire.** Mark Q1, Q2, Q3, Q9 and Q10 as fixed POC defaults so the Admin reviews only 5 categories; aim to cut Phase 3's 33.3 waiting minutes.
2. **Gate checklist self-check in prompts.** Ask each writer agent to list every mandatory section with present/missing before review, targeting first-review scores equal to final scores (4 artefacts missed this time).
3. **Make the test count a check.** Fail the Test Report draft if extracted test names differ from CI's test count (83 vs 101 this run).
4. **Write layout ACs as testable rules.** In the BRD, phrase responsive ACs as CSS or markup checks, and list true visual checks as hand checks in the Definition of Done from the start.
5. **Split Release Notes from the deployment record.** Keep the deployment record as a separate appended section owned by the app, so it does not count as a new Release Notes version.