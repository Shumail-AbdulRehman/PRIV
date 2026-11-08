# DAG amendment — 2026-11-07

No dependency edges changed. Existing docs/plan-project/billing-onboarding/planning/dag.md retains the consumption rationale. Added regressions consume the same service/query/controller/screen/routes; no new prerequisite is invented.

| Spec | Consumes |
| --- | --- |
| 44 | — |
| 45 | Spec 44 |
| 46 | Spec 44 |
| 47 | Spec 44 |
| 48 | Spec 44 |
| 49 | Spec 45 |
| 50 | Spec 45 |
| 51 | Spec 45 |
| 52 | Spec 47 |
| 53 | Spec 46, Spec 51 |
| 54 | Spec 47, Spec 50, Spec 51 |
| 55 | Spec 47, Spec 50, Spec 53 |
| 56 | Spec 46, Spec 47, Spec 50, Spec 51 |
| 57 | Spec 47, Spec 50, Spec 51 |
| 58 | Spec 47, Spec 50, Spec 53 |
| 59 | Spec 52, Spec 54, Spec 55, Spec 56, Spec 57, Spec 58 |
| 60 | Spec 49 |
| 61 | Spec 48, Spec 49, Spec 59 |
| 62 | Spec 60, Spec 61 |
| 63 | Spec 62 |

Server49/queries51/screens54–58 may still develop against contract45; route59 consumes finished screen modules, SQL60 consumes service49; release61 consumes transport48/service49/routes59; browser62 consumes SQL60 and release61; final63 audits all transitively completed work. No shared hot-file ownership changed.

Sequential handoff:47 next; early read-only operator diagnosis may proceed independently of UI construction. Missing live diagnosis blocks final affected-account acceptance, not unrelated local units.
