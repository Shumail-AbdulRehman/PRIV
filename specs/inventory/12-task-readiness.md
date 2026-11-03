# Spec12 reuse additions

### workspace-task-readiness
`backend/src/services/taskReadiness.service.ts` — readonly per-site derived setup/task counts, local-day windows and bounded site cursor; GET/api/location/readiness through taskReadiness.route.ts. Consume from setup28; never invoke generation on read.
