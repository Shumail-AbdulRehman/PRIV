# Billing dependency and ownership audit — final plan

All paths resolve against repository root. Global additive numbering44–63 lives in the separate specs-billing-onboarding/ queue to preserve the historical single e2e/final gate. Every consumed API/type is an existing module or owned by an actual dependency.

| Spec | Direct dependencies | Consumption | Wave |
| --- | --- | --- | --- |
| 44 | — | Record approved sandbox repair decisions consumes the contracts/screens/configuration from those dependencies; exact Reuses paths in its header | 0 |
| 45 | 44 | Publish additive billing lifecycle and catalog contracts consumes the contracts/screens/configuration from those dependencies; exact Reuses paths in its header | 1 |
| 46 | 44 | Stabilize browser SDK initialization and event subscriptions consumes the contracts/screens/configuration from those dependencies; exact Reuses paths in its header | 1 |
| 47 | 44 | Build scoped billing layout, tokens and translations consumes the contracts/screens/configuration from those dependencies; exact Reuses paths in its header | 1 |
| 48 | 44 | Qualify same-origin browser API transport on Netlify consumes the contracts/screens/configuration from those dependencies; exact Reuses paths in its header | 1 |
| 49 | 45 | Return authoritative readiness and safe checkout resume consumes the contracts/screens/configuration from those dependencies; exact Reuses paths in its header | 2 |
| 50 | 45 | Derive billing display states and exact provider prices consumes the contracts/screens/configuration from those dependencies; exact Reuses paths in its header | 2 |
| 51 | 45 | Own validated owner cache and recoverable polling consumes the contracts/screens/configuration from those dependencies; exact Reuses paths in its header | 2 |
| 52 | 47 | Restyle existing owner signup without changing auth semantics consumes the contracts/screens/configuration from those dependencies; exact Reuses paths in its header | 2 |
| 53 | 46, 51 | Coordinate single checkout, resume and provider events consumes the contracts/screens/configuration from those dependencies; exact Reuses paths in its header | 3 |
| 54 | 47, 50, 51 | Render real catalog plans and interval selection consumes the contracts/screens/configuration from those dependencies; exact Reuses paths in its header | 3 |
| 55 | 47, 50, 53 | Render order summary and Paddle checkout handoff consumes the contracts/screens/configuration from those dependencies; exact Reuses paths in its header | 4 |
| 56 | 46, 47, 50, 51 | Confirm server entitlement and recover polling consumes the contracts/screens/configuration from those dependencies; exact Reuses paths in its header | 3 |
| 57 | 47, 50, 51 | Render existing subscription and self-service portal consumes the contracts/screens/configuration from those dependencies; exact Reuses paths in its header | 3 |
| 58 | 47, 50, 53 | Render known-failure and uncertain-payment recovery consumes the contracts/screens/configuration from those dependencies; exact Reuses paths in its header | 4 |
| 59 | 52, 54, 55, 56, 57, 58 | Compose owner routes, aliases and workspace gates consumes the contracts/screens/configuration from those dependencies; exact Reuses paths in its header | 5 |
| 60 | 49 | Prove reservation and entitlement persistence in PostgreSQL consumes the contracts/screens/configuration from those dependencies; exact Reuses paths in its header | 3 |
| 61 | 48, 49, 59 | Prepare deployment diagnosis and sandbox release checks consumes the contracts/screens/configuration from those dependencies; exact Reuses paths in its header | 6 |
| 62 | 60, 61 | Prove every owner billing flow in the managed browser suite consumes the contracts/screens/configuration from those dependencies; exact Reuses paths in its header | 7 |
| 63 | 62 | Verify clean suites and deployed sandbox acceptance consumes the contracts/screens/configuration from those dependencies; exact Reuses paths in its header | 8 |

## Parallel safety

45 owns DTO/public type normalization;46 owns SDK singleton/events;47 owns shared shell/styles/translations;48 owns Netlify rewrite.49 alone edits backend billing/config/tests.50 owns pure view/price helpers.51 alone edits API/query files.52 edits signup form/tests while retaining existing mutation implementation.53 owns checkout controller.54–58 own separate page/test files.59 alone edits main/App/route/lazy aliases/monolithic billing/gate.60 edits only SQL integration script.61 edits deployment documentation.62 owns browser-only files/harness, then63 observes all results and folds the registry.

No page unit edits main.tsx, shared translation dictionaries, the shared token stylesheet or another page's tests. No runtime consumer relies on an unmerged source file; UI/hooks can unit-test published DTOs through boundary mocks before server49 is integrated.61 includes49 explicitly because its deployed contract/configuration is consumed, not because UI imports backend code.62 waits for SQL60 and release package61, whose transitive dependencies cover every implementation unit.63 waits for62. There are no source ownership collisions.

A source-only type contract keeps additive transport fields optional for existing fixtures; the new runtime guard fails closed, avoiding a broken build while later consumers land. The explicit authenticated resume ID may live in short-lived private query memory, never persistent browser storage; old blanket tests are updated at the integration owner rather than silently dropped.

## Every edge and the consumed artifact

| Consumer | Producer | Consumes |
| --- | --- | --- |
| 45 | 44 | confirmed scope, additive-contract decision and Sol profile |
| 46 | 44 | existing Paddle SDK choice, config/event boundary and runtime profile |
| 47 | 44 | approved no-help design and scoped-token decision |
| 48 | 44 | Netlify/Heroku first-party browser transport decision |
| 49 | 45 | explicit lifecycle/catalog/resume/permission DTO |
| 50 | 45 | validated wire shape and missing-field semantics |
| 51 | 45 | transport guard, DTO and nullable/legacy rules |
| 52 | 47 | shared setup shell and translated form vocabulary |
| 53 | 46 | singleton/event subscription seam |
| 53 | 51 | fresh owner lifecycle, checkout transport and cache refresh seam |
| 54 | 47 | setup shell/tokens/copy |
| 54 | 50 | pure selection/view/price helpers |
| 54 | 51 | owner lifecycle, catalog and availablePlans reads |
| 55 | 47 | payment shell/tokens/copy |
| 55 | 50 | exact recurring-price display |
| 55 | 53 | single checkout/reopen/action state controller |
| 56 | 46 | completion/close refresh event seam |
| 56 | 47 | confirmation shell/copy |
| 56 | 50 | safe pending/ready state classification |
| 56 | 51 | bounded polling/refresh lifecycle |
| 57 | 47 | settings shell/copy |
| 57 | 50 | current catalog price and actual-usage display |
| 57 | 51 | lifecycle/catalog and managed-portal API reads |
| 58 | 47 | recovery shell/copy |
| 58 | 50 | known/uncertain/restricted classification |
| 58 | 53 | safe retry/reopen/status controller |
| 59 | 52 | finished signup screen |
| 59 | 54 | finished plan-selection screen |
| 59 | 55 | finished payment screen |
| 59 | 56 | finished activation screen |
| 59 | 57 | finished subscriber settings |
| 59 | 58 | finished recovery screen |
| 60 | 49 | actual readiness/resume service under real SQL locks |
| 61 | 48 | deployed rewrite contract |
| 61 | 49 | actual server config/readiness contract |
| 61 | 59 | final owner URL/layout/alias composition |
| 62 | 60 | real-SQL evidence boundary used alongside browser provider fixtures |
| 62 | 61 | release/route/config acceptance contract and complete preceding implementation closure |
| 63 | 62 | passing integrated browser gate and all transitive unit/SQL artifacts |
