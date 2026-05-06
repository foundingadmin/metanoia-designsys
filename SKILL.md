---
name: metanoia-design
description: Use this skill to generate well-branded interfaces and assets for Metanoia, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

Metanoia is an asset-information software & services company (AIC platform + iBOM deliverables). The brand is industrial-but-approachable: lowercase wordmark, navy + aqua palette, Figtree typeface, generous whitespace, no emoji, no decorative gradients. The brandmark is two interlocking "M" shapes (navy left, aqua right) and is the only geometric motif the system leans on.

Key files:
- `README.md` — content fundamentals (voice, casing, examples), visual foundations (color, type, spacing, motion, etc), iconography, caveats
- `colors_and_type.css` — all design tokens. Link this into any HTML you generate.
- `assets/` — logos (brandmark, horizontal lockup, vertical lockup; color + mono variants), identity guide PDF
- `fonts/` — Figtree variable font (TTF) + italic
- `preview/` — design system reference cards

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. Always link `colors_and_type.css` and use the token CSS vars (e.g. `var(--color-navy)`, `var(--fs-36)`, `var(--shadow-sm)`) — do not hardcode hex values or font sizes. The wordmark "metanoia" must always be lowercase.

If working on production code, you can copy assets and read the rules in README.md to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.
