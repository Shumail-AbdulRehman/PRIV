# Parallel V5 checkpoint validator — 2026-10-22

Command: `python3 .ai/plan-project/scripts/validate-specs.py specs`

```text
Validating /tmp/hygene-v5-integrated/specs  (42 specs)

Parallel schedule  (10 waves · widest 9 · 42 specs)
  W0  00
  W1  01 03 04 06 10 12 19 20 21
  W2  02 13 14 17 22 23 27
  W3  05 15 16 18 34 36
  W4  07 08 09 24 28
  W5  11 25 29 30 32 33
  W6  26 31 35 38
  W7  37 39
  W8  40
  W9  41

00-launch-decisions.md
  WARN   Status is 'Done' but no GitHub issue is recorded

25-platform-support-api.md
  WARN   Depends on 19 is already implied through another dependency

26-launch-api-composition.md
  WARN   Depends on 14, 15, 17, 24 is already implied through another dependency

28-setup-ui.md
  WARN   Depends on 14 is already implied through another dependency

30-account-ui.md
  WARN   Depends on 27 is already implied through another dependency

32-billing-ui.md
  WARN   Depends on 15, 27 is already implied through another dependency

37-native-workflows.md
  WARN   Depends on 09, 17, 20, 21 is already implied through another dependency

40-e2e-suite.md
  WARN   142 lines — over 130 usually means this should be two specs
  WARN   creates 'docs/implementation/followups/E2E_DEFECTS.md' but no other spec mentions it — check it is not an endpoint or component with zero callers
  WARN   creates 'frontend/package-lock.json' but no other spec mentions it — check it is not an endpoint or component with zero callers
  WARN   creates 'frontend/package.json' but no other spec mentions it — check it is not an endpoint or component with zero callers

41-verification-pass.md
  WARN   creates 'docs/implementation/VERIFICATION.md' but no other spec mentions it — check it is not an endpoint or component with zero callers

42 specs · 0 error(s) · 12 warning(s)
Warnings are not blocking — justify each one in README.md under 'Known gaps', or fix it.
```

42specs/0errors/12existing justified warnings. All retained warnings are documented in specs/README.md. New settingsCSS/report are explicitly consumed by the existing spec40 harness. No new spec, design, API or dependency wave.
