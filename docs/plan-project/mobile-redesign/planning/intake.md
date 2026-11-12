# Intake: questions and answers

The owner answered "use your recommendations" on 2026-11-11. Each question below is recorded with the recommendation that became the answer.

| # | Question | Answer (recommendation accepted) | What the code showed afterwards |
|---|---|---|---|
| 1 | Should staff see their manager's phone number, with a Call button? | Yes | The `Manager` model has no phone field (`backend/prisma/schema.prisma`). Showing it needs a migration and a web form change, which are out of scope. Spec 00 records the deviation: Profile shows the manager's name only. |
| 2 | Should staff see performance issues their manager recorded? | No | — |
| 3 | Should staff see their own task photos in History? | No, results only | — |
| 4 | Can staff check out with unsubmitted tasks? | Yes, after a warning | The server allows it today (`attendanceWrites.service.ts` only enforces 30 minutes after check-in). |
| 5 | Approve design `design/mobile-redesign/v3/`? | Approved by asking for the plan | The design README is updated to approved. |
| 6 | Stack | Fixed by the repo: Expo 54, React Native 0.81, TanStack Query, Express 5 and Prisma 7 | — |
| 7 | Brand input | Existing Hygene Ops mark, blue, Inter and Noto Sans Arabic (design brief fixed inputs) | — |
| 8 | Delivery | Two parts, Part 1 first. No commit, push or deploy without the owner. | — |
| 9 | Who implements | GPT Sol 6.1 (`gpt-6.1-sol`) at high effort, one spec per session | Plan written for a context-free implementer. |

Constraint repeated by the owner: another session (Codex) is changing app code at the same time. Planning only added new files under `specs-mobile-redesign/` and `docs/plan-project/mobile-redesign/`, and updated `design/mobile-redesign/README.md`.
