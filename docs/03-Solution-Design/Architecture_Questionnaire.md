# Architecture Questionnaire: Pomodoro Timer

The Solution Architect suggested these answers from the approved BRD and backlog; the Admin confirmed them before the SDD was written.

## Answers

| # | Category | Key questions | Answer | Source |
|---|---|---|---|---|
| Q1 | Application Nature | POC vs production? Lifespan? Multi-tenant? White-labelled? | A proof of concept (POC) for a demo, not a production system. It is single-tenant, not white-labelled, and its lifespan is the demo, about one sprint plus the demo period. | BRD |
| Q2 | Users & Scale | Concurrent users at peak? Total users in 12 months? Geography? Devices? Browsers? | One person or a handful of demo users, with no concurrency or 12-month user targets. They use phones (iOS Safari, Android Chrome) and laptops (current Chrome, Edge, Firefox, Safari), at widths from 320 to 1920 px, with English UI only. | BRD |
| Q3 | Availability & Reliability | Uptime SLA? RTO? RPO? Peak usage windows? | Best effort on the GitHub Pages free tier, with no SLA, RTO, RPO, monitoring or on-call. There are no peak windows, and rollback is redeploying the previous commit. | BRD |
| Q4 | Performance | Acceptable page load time? Response time? Real-time vs batch? | An interactive timer must show within 2 seconds on laptop broadband. Button presses update the display without perceptible delay. The display refreshes at least once per second and stays within 1 second of the stored end timestamp. All processing is real-time and runs in the browser. | BRD |
| Q5 | Security & Compliance | GDPR / other regulation? Auth required? Data residency? PII handling? | There is no auth, no PII and no server. localStorage holds only the local date, today's count, the cycle position and the mute setting. There are no cookies, analytics or network calls after load, so no GDPR or data-residency work is needed beyond that. There are no secrets. | BRD |
| Q6 | AI & Model Constraints | AI used in the product? Provider? Can data go to external APIs? | No AI is used in the product. No data goes to any external API. | Assumption |
| Q7 | Integration Landscape | Existing systems to integrate? APIs available? Identity provider? | There are no integrations, external APIs or identity provider. The app uses only browser APIs: localStorage, Date, the Web Audio API or HTMLAudioElement, and document.title. | BRD |
| Q8 | Infrastructure & Deployment | Cloud/hosting mandate? CI/CD in place? | Hosting is mandated as a static site on GitHub Pages from the demo repo sdlc-demo-apps/sdlc-pomodoro-timer-r6. It uses the starter template's GitHub Actions: ci.yml runs npm ci, npm test and npm run build on each PR, and deploy-pages.yml deploys dist/ on merge to main. | Backlog |
| Q9 | Team & Operations | Team size and skills? Who owns operations? Monitoring? | The orchestrator's build agent builds on React 18 + Vite 5 with Vitest 2 + Testing Library + jsdom. The Admin alone owns operations, with no monitoring or on-call. | Backlog |
| Q10 | Budget & Timeline | Infrastructure budget? Open-source only? Hard deadline? Phased delivery? | Free hosting only, with open-source tooling and a zero infrastructure budget. Delivery is one sprint (Sprint 1, 23 of 24 points planned); S9 mute is Could Have, with no further phases planned. | Backlog |

## Assumptions

- Q6 AI & Model Constraints: No AI is used in the product. No data goes to any external API.

## Sign-off

Approved by the Admin on 2026-11-26 (Architecture Questionnaire decision card).
