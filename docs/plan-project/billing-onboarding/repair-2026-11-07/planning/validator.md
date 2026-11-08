# Validation — 2026-11-07

Command: `python3 .ai/plan-project/scripts/validate-specs.py specs-billing-onboarding`

Exit0.

```text
Validating /home/shumail/bkacup-16-oct-bkpriv/bk-Priv/PRIV/specs-billing-onboarding  (20 specs)

Parallel schedule  (9 waves · widest 5 · 20 specs)
  W0  44
  W1  45 46 47 48
  W2  49 50 51 52
  W3  53 54 56 57 60
  W4  55 58
  W5  59
  W6  61
  W7  62
  W8  63

44-billing-decisions.md
  WARN   Status is 'Done' but no GitHub issue is recorded

45-billing-dto-contract.md
  WARN   Status is 'Done' but no GitHub issue is recorded

46-paddle-sdk-events.md
  WARN   Status is 'Done' but no GitHub issue is recorded

20 specs · 0 error(s) · 3 warning(s)
Warnings are not blocking — justify each one in README.md under 'Known gaps', or fix it.
```

All3 warnings are existing completed units44/45/46 without issue numbers; justified in README Known gaps. No numbers or completion evidence fabricated.

Manual review: completed44–46 unchanged; source ownership and DAG unchanged; new flow rowsF31–F33 map to existing code owners; code-owning specs have focused and whole-package unit gates;62 remains the only browser-test owner and63 remains the final gate. New criteria stay within40–130-line specs. No fresh design/token or application-code edit.
