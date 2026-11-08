# Spec 47 — Billing layout, scoped tokens and translations

## Components

`frontend/src/pages/Subscription/onboarding/BillingSetupLayout.tsx` default-exports BillingSetupLayout. Setup props: currentStep `account | plan | payment | confirmation`, optional completedSteps (otherwise earlier steps are completed); settings props: variant `settings`, no setup steps. Existing-subscriber settings exposes real /subscription and /account/security links. Supply one screen-owned h1 through children; navigation and footer are ReactNode slots. No pathname inference, API query or billing authorization. Use instead of copying a rail/topbar/footer into each screen.

Optional environment `sandbox | production` is presentation supplied by the caller after validating environment facts; omitted/production never claims a sandbox. BillingSetupStep and BillingSetupLayoutProps are exported project types. A skip link targets the unique focusable main. Completed steps include nonvisual text; mobile visually hides step text without removing accessible names. LanguageChoice and BrandLogo are reused; LanguageProvider remains the sole preference/direction owner and child content is never keyed by language.

Policy destinations come from the existing pure serviceInformation validator, not its fetching hook. Only approved configured Terms/Privacy links render; no placeholders, public-support request or extra policy prerequisite is introduced. Use existing headless commercial guards in53; shell links do not grant purchase permission.

## Scoped styles / exact mapping

`frontend/src/pages/Subscription/onboarding/billing-setup.css` defines all styles below .billing-onboarding. Approved source --canvas/paper/ink/muted/line/blue/blue-hover/wash/green/green-wash/amber/amber-wash/red/radius/font/ease-out map to --billing-{same-name}. --billing-font resolves the already bundled Inter Variable family before Inter/Arial/sans-serif; --billing-font-arabic uses bundled Noto Sans Arabic and the same fallback. Additional approved selection/interval-shadow/illustration-shadow/backdrop/action-label colors have matching --billing- names. No global palette, font, body-overflow rule or workspace recolor.

Consumed spacing mapping: --billing-space-xs/sm/md/lg/xl/panel/section/wide/main/rail =4/8/12/16/20/24/28/32/48/64px. Role tokens: --billing-main-top44, rail-top30, rail-bottom22, rail-title-gap26, rail-width240, main-width1100, topbar-height88, title-size32, section-size18, body-size15, label-size13, caption-size12, step-size28, control-radius7px. Responsive overrides retain approved1600/1200/1000/760/580/350 thresholds and settings main-width950. Future screen owners may consume these tokens and add owned page composition; do not copy the prototype scripts, sample prices or mock card forms.

Existing data-slot button/input primitives receive the approved scoped control treatment with48px actions, visible focus, guarded hover and140ms press feedback only when reduced motion permits. Reading text, prices and language changes have no animation. Existing brand assets are used unchanged.

## Translation boundary

`frontend/src/i18n/billingTranslations.ts` adds65 new EN-key/Urdu-value entries for shell/steps, plan/interval/capacity selection, payment handoff, confirmation/recovery and account billing. Existing keys remain intact. Use through useLanguage().t; interpolate quantities with `{count}`. New copy needs no contact/support/FAQ or fake policy destinations. Existing unrelated legacy strings are preserved for their current consumers.

## Verification

17 focused layout tests passed; full frontend64 Node +514 Vitest tests across37 files passed; tsc -b, scoped ESLint and production build passed (exact commands in spec47 Log). Local isolated visual preview at320 RTL/390/768 settings/1440/1920 showed no horizontal overflow and48px language buttons; preview content was illustrative shell content only, with no checkout/network fixture or routing change. This is not integrated billing/e2e/provider acceptance. Browser-flow ownership remains62; route mounting remains59.
