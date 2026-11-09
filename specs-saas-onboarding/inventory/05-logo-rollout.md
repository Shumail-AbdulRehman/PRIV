# Spec 05 — New Hygene Ops logo

## Shared identity assets

- `frontend/public/brand/hygene-ops-mark.svg` and `frontend/public/favicon.svg` are byte-for-byte copies of the approved `design/saas-onboarding/assets/hygene-ops-mark.svg`. Keep the full 48×48 viewBox: the coloured tick extends beyond the rounded checkbox box.
- Existing `frontend/src/components/common/BrandLogo.tsx` continues to supply the shared web identity. Its image sizing and `brand.css` already preserve the full mark; reuse them without additional logo markup.
- `frontend-mobile/assets/hygene-ops-icon.png` remains 1024×1024, `hygene-ops-mark.png` 192×192 and `hygene-ops-favicon.png` 48×48. Each renders the approved SVG directly at its output size, with transparency preserved.
- `frontend-mobile/assets/hygene-ops-adaptive.png` remains a transparent 1024×1024 layer. The approved SVG renders at 480×480 and is centred at (272, 272), retaining at least the original 232px edge padding and keeping every visible pixel, including the tip, inside Android's central 66dp circular safe zone on the 108dp layer.
- The PNGs were generated with the backend's already-installed `sharp`, without adding a dependency. Rasterize the SVG with density `72 * outputSize / 48`; the adaptive foreground uses density 720 before compositing. Preserve transparency and the approved artwork when regenerating.
- The single-colour `hygene-ops-notification.*` assets are separate notification artwork and remain unchanged.

## Documentation and regression checks

- `DESIGN.md` Overview records the approved mark gradients and scoped Fresh aurora table / Mint sky panel as sanctioned exceptions to workspace rules. Onboarding colours remain defined by the existing closed design-system tokens in `flow.css`.
- `frontend/tests/brand-assets.test.mjs` provides seven Node tests for exact SVG copies, removal of the legacy mark colour, original PNG dimensions, visible box/tick/tip pixels, transparency and the adaptive safe zone. It reuses the backend's installed Sharp to decode PNGs; it runs in both the focused command and the existing frontend unit suite.
