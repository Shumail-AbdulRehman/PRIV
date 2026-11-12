# Dependency graph draft, 2026-11-11

Every edge names what the dependent spec consumes from the dependency. The validator's computed schedule is in `validator.md`.

| Spec | Depends on | Consumes |
|---|---|---|
| 00 Decisions | — | decision recorded |
| 01 Test command and shared component test harness | Spec 00 | decisions |
| 02 Design tokens | Spec 00 | decisions |
| 03 Bold Inter and Manrope fonts | Spec 00 | decisions |
| 04 Urdu copy for the redesign | Spec 00 | decisions |
| 05 Time, date and duration formatting | Spec 00 | decisions |
| 06 Task display state | Spec 00 | decisions (types in src/types.ts already exist) |
| 07 Navigation contract | Spec 00 | decisions |
| 08 Photo row state | Spec 00 | decisions (verification modules already exist) |
| 09 Profile read for Part 1 | Spec 00 | decisions |
| 10 History and profile summary client contract | Spec 00 | API contract in ARCHITECTURE.md |
| 11 Staff task history service | Spec 00 | decisions |
| 12 Staff attendance month service | Spec 11 | staffMonth.ts from 11 |
| 13 Staff profile summary service | Spec 11 | staffMonth.ts from 11 |
| 14 Text roles and name lines | Spec 01, Spec 02, Spec 03 | test harness (01), tokens (02), fontFor (03) |
| 15 My day next-step decision | Spec 05, Spec 06 | format helpers (05), taskDisplay (06) |
| 16 Check-in and check-out action hook | Spec 01 | test harness (01) |
| 17 History, attendance month and profile summary queries | Spec 10 | types and parsers (10) |
| 18 Staff history, attendance month and profile routes | Spec 11, Spec 12, Spec 13 | the three services (11, 12, 13) |
| 19 Action button and bottom dock | Spec 02, Spec 14 | tokens (02), StaffText (14) |
| 20 Pills, status markers and avatar | Spec 02, Spec 06, Spec 14 | tokens (02), displayFor (06), StaffText (14) |
| 21 Top bar, segmented control and language toggle | Spec 02, Spec 14 | tokens (02), StaffText (14) |
| 22 Text field | Spec 02, Spec 14 | tokens (02), StaffText (14) |
| 23 Bottom sheet and sign-out dialog | Spec 19 | ActionButton (19) |
| 24 Message bar, offline banner, skeleton, empty and error states | Spec 19 | ActionButton (19) |
| 25 Task row | Spec 05, Spec 20 | timeRange (05), Pill and StatusMarker (20) |
| 26 Receipt layout | Spec 19, Spec 20 | ActionButton (19), Pill (20) |
| 27 Access code and password replacement form | Spec 19, Spec 22 | ActionButton (19), Field (22) |
| 28 Sign in screen | Spec 19, Spec 21, Spec 22 | ActionButton (19), LanguageToggle (21), Field (22) |
| 29 My day top area | Spec 05, Spec 15, Spec 20, Spec 21 | format (05), nowState (15), Avatar (20), LanguageToggle (21) |
| 30 Today's work sheet on My day | Spec 25 | TaskRow (25) |
| 31 Check-in and check-out screens | Spec 16, Spec 23, Spec 26 | useAttendanceAction (16), BottomSheet (23), Moment (26) |
| 32 Tasks screen | Spec 07, Spec 19, Spec 24, Spec 25 | routeNames (07), ActionButton (19), Feedback (24), TaskRow (25) |
| 33 Task details screen | Spec 07, Spec 19, Spec 20, Spec 21, Spec 24 | routeNames (07), ActionButton (19), Pill (20), TopBar (21), Feedback (24) |
| 34 Scan the task QR and cleaning started | Spec 19, Spec 21, Spec 23 | ActionButton (19), TopBar (21), BottomSheet (23) |
| 35 Task photo list | Spec 08, Spec 19, Spec 20 | photoRow (08), ActionButton (19), Pill (20) |
| 36 Work submitted receipt | Spec 26 | Moment (26) |
| 37 Profile screen | Spec 07, Spec 09, Spec 20, Spec 21, Spec 23, Spec 24 | routeNames (07), profile query (09), Avatar (20), LanguageToggle (21), ConfirmDialog (23), Feedback (24) |
| 38 Task alerts screen | Spec 07, Spec 19, Spec 21 | routeNames (07), ActionButton (19), TopBar (21) |
| 39 Help screen | Spec 07, Spec 21 | routeNames (07), TopBar (21) |
| 40 Change password screen | Spec 07, Spec 21, Spec 27 | routeNames (07), TopBar (21), LaunchRecovery (27) |
| 41 Task history list | Spec 17, Spec 21, Spec 24, Spec 25 | history queries (17), TopBar and segmented (21), Feedback (24), TaskRow (25) |
| 42 Attendance history with calendar | Spec 05, Spec 17, Spec 20, Spec 23, Spec 24, Spec 41 | format (05), history queries (17), Pill (20), BottomSheet (23), Feedback (24), MonthBar (41) |
| 43 Finished task details | Spec 07, Spec 17, Spec 20, Spec 21 | routeNames (07), history queries (17), Pill (20), TopBar (21) |
| 44 Profile "This month" and "My work" sections | Spec 05, Spec 17, Spec 20 | format (05), history queries (17), StaffText via 20 |
| 45 Task photo capture screen | Spec 08, Spec 19, Spec 21, Spec 23, Spec 35, Spec 36 | photoRow (08), ActionButton (19), TopBar (21), BottomSheet (23), photo list (35), receipt (36) |
| 46 My day screen | Spec 15, Spec 16, Spec 19, Spec 23, Spec 24, Spec 29, Spec 30, Spec 31 | nowState (15), hook (16), ActionButton (19), BottomSheet (23), Feedback (24), DayHeader (29), TodayWork (30), attendance views (31) |
| 47 History screen | Spec 05, Spec 07, Spec 21, Spec 41, Spec 42 | format (05), routeNames (07), SegmentedControl (21), both history views (41, 42) |
| 48 Navigation wiring for Part 1 | Spec 07, Spec 24, Spec 33, Spec 37, Spec 38, Spec 39, Spec 40 | types (07), Snackbar provider (24), the screens it registers (33, 37, 38, 39, 40) |
| 49 Retire unused old parts and sweep strings | Spec 28, Spec 32, Spec 34, Spec 45, Spec 46, Spec 48 | every screen that replaced an old part (28, 32, 34, 45, 46) and the new navigator (48) |
| 50 Part 1 release check | Spec 49 | clean Part 1 tree (49) |
| 51 Part 2 wiring: History tab and profile sections | Spec 18, Spec 43, Spec 44, Spec 47, Spec 50 | routes live (18), HistoryTask (43), profile sections (44), HistoryScreen (47), Part 1 gate (50) |
| 52 End-to-end suite | 01-51 | everything (01-51) |
| 53 Verification pass | 00-52 | everything (00-52) |
