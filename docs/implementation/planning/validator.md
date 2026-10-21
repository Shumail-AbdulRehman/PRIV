Validating /home/shumail/bkacup-16-oct-bkpriv/bk-Priv/PRIV/specs  (42 specs)

Parallel schedule  (10 waves · widest 9 · 42 specs)
  W0  00
  W1  01 03 04 06 10 12 19 20 21
  W2  02 13 14 17 22 23 27
  W3  05 15 16 18 34 36
  W4  07 08 09 24 28 30
  W5  11 25 29 32 33 37
  W6  26 31 35 38
  W7  39
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

32-billing-ui.md
  WARN   Depends on 15, 27 is already implied through another dependency

41-verification-pass.md
  WARN   creates 'docs/implementation/VERIFICATION.md' but no other spec mentions it — check it is not an endpoint or component with zero callers

42 specs · 0 error(s) · 6 warning(s)
Warnings are not blocking — justify each one in README.md under 'Known gaps', or fix it.
