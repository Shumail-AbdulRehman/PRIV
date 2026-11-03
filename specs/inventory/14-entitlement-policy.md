# Spec14 reuse inventory

- `backend/src/services/accountAccess.service.ts`: `readAccountState` consumes exact company/customer/subscription mirror; `evaluateAccountAccess` shares suspension vs entitlement policy for roles/jobs. Reuses existing plan limits/provider status; requires actual provider period, no guessed trial/grace or company status-only entitlement.
- `assertAccountAction` rechecks active principal; `recordWorkEntitlement` reads persisted own-work start and writes WORK_ENTITLEMENT_GRANTED inside the successful locked start transaction. `assertAccountCompletion` accepts only that exact saved start grant when unentitled; legacy missing proof denied. Existing task/site/assignment/time/evidence rules still required.
- `withAccountCapacity` locks company→subscription, checks existing active-count limit and executes creator/postcheck in same transaction; overflow rolls back. It is a create boundary, not a separate billing engine. New ownership/activation routes must use it in26.
- `backend/src/middlewares/accountAccess.middleware.ts`: explicit tenant action policy; rejects operator context. No method/URL inference or user-supplied start timestamp.
- `backend/tests/accountCapacity.integration.ts`: local dedicated test DB guard, real quota concurrency/rollback, provider-window fixtures, persisted grant, downgrade retention and suspension proof. No actual Paddle call or qualification.
- Consumers15/24/26/39 use this contract; current legacy route/job gates are not yet replaced. Production-wide account enforcement is not claimed before composition/verification.
