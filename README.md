# Metanoia Design System

Visual + content foundations and reusable UI for **Metanoia** — the asset-information software & services company.

> Metanoia transforms the way asset-intensive businesses create, manage, and access asset information through a unique combination of Software and Services. For 25+ years Metanoia has been the world's most experienced catalog conversion agency — building **Interactive Bills of Materials (iBOMs)** that are accessible through **Asset Information Center (AIC)**, an industry-leading platform purpose-built for asset information management.
>
> Metanoia's mission is to empower the world's most critical industries to run smarter, leaner, and with greater confidence — by making the right parts, the right data, and the right knowledge available to the right people, at the right time.

---

## Products represented

| Product | What it is |
|---|---|
| **AIC — Asset Information Center** | The industry-leading software platform for asset information management. Houses iBOMs and structured catalog data; the consumption surface for engineers, planners, technicians and procurement. |
| **iBOM — Interactive Bill of Materials** | The deliverable produced by Metanoia's Services team. Catalog conversion: legacy / paper / PDF parts books → structured, searchable, image-linked BOMs. |
| **Marketing site / brand surfaces** | Public-facing presence — visual identity guide, sales decks, and the site at metanoia.com. The brand we're systematizing in this folder. |

> No production codebase or Figma file was provided for this project — only the brand identity package (logos, fonts, identity guide). The UI kits in `ui_kits/` are therefore **not** in this initial pass; once the user provides product code or design context for AIC / iBOM, we'll add them. See **Caveats** at the bottom of this file.

---

## What's in this folder

```
.
├── README.md                  ← you are here
├── SKILL.md                   ← skill manifest (Claude Code compatible)
├── colors_and_type.css        ← all CSS tokens (color, type, spacing, radii, shadow, motion)
├── assets/                    ← logos, identity guide PDF, type guide JPG
│   ├── logo-brandmark.svg            (navy + aqua, multi-color positive)
│   ├── logo-brandmark-navy.svg       (single-shade navy, on light)
│   ├── logo-brandmark-white.svg      (single-shade white, on dark)
│   ├── logo-lockup-horiz.svg         (wordmark + brandmark, horizontal)
│   ├── logo-lockup-vert.svg          (wordmark + brandmark, vertical)
│   ├── Fonts-Figtree-TypeGuide.jpg
│   └── Metanoia Visual Identity Guide 2025 v1.pdf
├── fonts/
│   ├── Figtree-VariableFont_wght.ttf
│   └── Figtree-Italic-VariableFont_wght.ttf
└── preview/                   ← cards rendered into the Design System tab
```

---

## Source material

These were provided by the user and copied into `assets/`:

- `Metanoia Visual Identity Guide 2025 v1.pdf` — the canonical brand book (logos, lockups, color, type)
- `Fonts-Figtree-TypeGuide.jpg` — typography example sheet ("metanoia" wordmark + sample layout)
- `Figtree-VariableFont_wght.ttf` + italic — variable font files
- `MetanoiaLogo-v2.0-*.svg` — brandmark + horizontal + vertical lockups

> A `Brand Background Stills.zip` was referenced in the brief but did not arrive in the project filesystem. **If you have it, please re-attach it via the Import menu** so we can pull in the official background imagery and document its usage.

No Figma file, codebase, or marketing site URL was provided. If you have any of these, attach them and I'll layer in the live UI patterns.

---

## CONTENT FUNDAMENTALS

How Metanoia writes.

### Voice
- **Confident, plain-spoken, expert.** Metanoia talks like a 25-year veteran who's seen every parts book — calm authority, never breathless. Industries served (oil & gas, utilities, mining, defense, manufacturing) demand precision, so the voice favors specificity over hype.
- **Approachable, not corporate.** The all-lowercase wordmark is intentional — per the type guide it "implies approachability" and the brand explicitly positions itself as **"not crazy complicated tech…mellow and approachable."** Carry that into copy: short sentences, contractions ("we're", "you'll"), no jargon-stacking.
- **Outcome-led.** Lead with what the customer gets — *uptime, fewer wrong-part orders, faster mean-time-to-repair* — then explain the mechanism. Asset-info is dry; the win is operational.

### Casing
- **Wordmark is always lowercase**: `metanoia`. Never "Metanoia" inside the logo, never all-caps "METANOIA". (In running prose, capitalize the proper noun normally.)
- **Product names are capitalized**: `Asset Information Center`, `AIC`, `Interactive Bill of Materials`, `iBOM` (lowercase i, capital BOM — like iPhone).
- **Sentence case for everything else** — buttons, headings, nav. No Title Case On Every Word. Avoid SHOUTY all-caps except the eyebrow micro-label (12–13px, +0.12em tracking).

### Person
- **"You" for the reader**, **"we" for Metanoia.** Direct address. "Your team", "your assets", "your facility". Avoid passive third-person ("users will be able to…").

### Sentence shape
- Short. Often fragments. One idea per sentence.
- Em-dashes are fine — used sparingly — for an aside or a beat.
- Numbers as numerals when they carry weight ("25+ years", "3M+ parts indexed"). Spell out under ten in soft prose.

### Examples (in-voice)
> the right parts. the right data. the right knowledge. at the right time.

> Stop hunting for part numbers in 600-page PDFs. AIC turns your catalog into a searchable, structured iBOM your team can actually use.

> 25 years of catalog conversion. Built into one platform.

> Your maintenance team shouldn't have to be librarians. We turn your parts books into searchable iBOMs, so the right component is one click — not one phone call — away.

### Examples (out of voice — avoid)
> ❌ "Metanoia leverages cutting-edge AI to revolutionize the asset information paradigm." (jargon stack, hype)
> ❌ "Click here to learn more!!" (exclamation, vague CTA)
> ❌ "We are excited to announce…" (corporate filler)
> ❌ "METANOIA — TRANSFORMING INDUSTRY" (all-caps, vague)

### Emoji & icon-language
- **No emoji** in product UI or marketing copy. Industrial brand; emoji read as too consumer.
- **No exclamation marks** as default; reserve for genuine surprise.
- **Unicode glyphs sparingly** — `→` arrows in CTAs are fine; nothing decorative.

---

## VISUAL FOUNDATIONS

### Color
- **Primary:** Navy `#094B77` is the brand. It carries headlines, primary buttons, dark backgrounds, the brandmark. Aqua `#32CBED` is the accent — used in the brandmark's right-half "M", as a highlight color, and as the system info color.
- **Secondary:** Light Aqua `#9BEBF9` for soft washes and tinted backgrounds; Dark Grey `#666666` and Grey `#999999` for body and secondary text; white and black as system anchors.
- **Pairing rule:** Navy + aqua + white is the canonical combination (mirrors the brandmark). Light aqua washes are the only "soft" backdrop the system officially has — they sit at ~10–20% perceived density vs. white.
- **Semantic:** success / warning / error are extended (not in the guide); aqua doubles as `info`. See `colors_and_type.css`.

### Typography
- **One typeface:** **Figtree** (variable weight 300–900). Variable italic available.
- The type guide explicitly chooses Figtree because it is "the most approachable, friendly, easy-to-talk to" sans of the bunch — wider letterforms, even rhythm, no serifs.
- **Wordmark:** Figtree Black, lowercase, tight tracking. Always.
- **Hierarchy:** Display & H1 use bold/black + tight tracking. Body uses regular at 16/26. Eyebrow labels are small + uppercase + tracked.
- No serif, no monospace in marketing — mono only for code/IDs in product UI (we ship JetBrains Mono as a system fallback; no licensed mono is in the brand kit).

### Backgrounds
- **Primary:** white. The brand reads as clean, almost editorial — lots of whitespace, generous breathing room.
- **Inverse:** solid navy `#094B77` for hero panels, footers, dark sections. Avoid gradient fills as a default — the brand background stills (when re-attached) should provide any imagery for hero/full-bleed.
- **No textures, no grain, no hand-drawn illustrations, no repeating patterns.** The brandmark's two angular "M"s ARE the visual signature; respect that and don't compete with it.
- **Soft washes:** the only acceptable "tinted" background is a flat `#ECFAFD` (aqua-50) or `#DCEAF3` (navy-100) panel.

### Brandmark as motif
The brandmark is two interlocking "M" shapes — a navy left half, an aqua right half, separated by a notch. This is the **only** geometric motif you should lean on. Acceptable uses:
- As a watermark at very low opacity (~6%) on dark navy hero backgrounds
- As a corner accent at 1–2% canvas size
- As a loading state (rotating, single color)

Never reconstruct the angles into custom illustrations or icon shapes — keep the mark sacred.

### Spacing & rhythm
- 4px grid base. Token scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128 px.
- Section padding on marketing surfaces: 96–128px vertical, 48–64px horizontal at desktop.
- Component padding: cards 24–32px, buttons 12×24px, inputs 12×16px.

### Corner radii
- **Pragmatic, not soft.** 8px is the workhorse for cards, inputs, buttons. 4px for tags/chips. 12–16px reserved for hero panels and modals. Pill (`999px`) for status pills and avatars.
- Avoid extreme rounding — the brandmark itself has sharp 90° angles, so the system reads as confident/structural, not bubbly.

### Borders
- **1px hairlines** at `--border-subtle` (#E0E0E0) for table rows, card outlines, and dividers.
- **1.5px** focus rings using aqua: `0 0 0 3px rgba(50,203,237,0.45)`.
- No double-borders, no dashed decoratives.

### Shadows
A single light-cool shadow stack (tinted with navy at low opacity) — see `--shadow-xs` through `--shadow-xl`. Cards typically use `--shadow-sm`; modals use `--shadow-lg`; popovers use `--shadow-md`. Never combine multiple shadow systems.

### Cards
- White surface, `--shadow-sm`, `--radius-lg` (12px), 1px border `--border-subtle`. Internal padding 24px.
- On dark surfaces: `rgba(255,255,255,0.06)` background, 1px `--border-on-dark` border, no shadow.

### Hover states
- **Buttons:** subtle background darken (~8%) + same shadow. No transform, no scale.
- **Cards / list rows:** lift `translateY(-1px)` + `--shadow-md`. 200ms `--ease-standard`.
- **Links:** color shifts from navy → aqua-700 (`#1FA8C9`). Underline persists.

### Press states
- Buttons: 1px translateY-down + shadow drop, no scale-down. 120ms ease.
- Toggleable items: aqua-50 background fill.

### Focus
- 3px aqua ring at 45% opacity. Always visible — accessibility first, this is industrial software where keyboard users are common.

### Motion
- Quiet. 120–200–320ms tiers. `cubic-bezier(0.2, 0, 0, 1)` standard ease.
- Fades + small translates only. **No bounces, no spring overshoots.** The brand voice is "mellow and approachable" — UI motion mirrors that, not playful.
- No background parallax, no scroll-jacking.

### Transparency & blur
- Used sparingly. Sticky headers may use `backdrop-filter: blur(12px)` over a 90% white surface.
- Modal overlays: navy at 40% opacity (`rgba(9,75,119,0.4)`).
- Glass effects discouraged for product UI — they read as consumer.

### Imagery vibe
- When the user re-attaches background stills: expect cool, clean, industrial-photo aesthetic. Likely neutral / cool-leaning, not warm. Until then, imagery is **off-system** and should be flagged when used.

### Layout rules
- 12-column grid at 1440px max canvas. 24px column gutter at desktop, 16px on mobile.
- Sticky top nav (64px tall on desktop, 56px mobile).
- Generous left/right gutters — the brand favors editorial whitespace over edge-to-edge density.

---

## ICONOGRAPHY

**No proprietary icon set was provided by Metanoia.** The identity guide covers logos, type and color only; it does not specify an icon library.

**Substitution (FLAGGED — please confirm):**
- We use **Lucide** (lucide.dev) as the default icon set throughout the design system.
  - **Why Lucide:** clean 1.5–2px stroke, square geometry that complements the brandmark's angularity, broad coverage for industrial/technical iconography (gear, wrench, server, file, chart, link), tree-shakeable, free.
  - **Style rules when using Lucide here:**
    - Stroke weight: 2px
    - Size: 16px (inline), 20px (UI controls), 24px (section icons)
    - Color: inherits `currentColor` — use `var(--fg-2)` for default, `var(--color-navy)` for emphasis, `var(--color-aqua-700)` for accents.
    - Never fill — Metanoia icons are stroked outlines only.
- Loaded via CDN: `<script src="https://unpkg.com/lucide@latest"></script>` then `<i data-lucide="settings"></i>`.

**No icon font, no PNG icons, no emoji.** Inline SVG only (via Lucide or hand-pasted from a source).

**Asset list in `assets/`:**
- Logos (5 SVGs — brandmark + horiz + vert, plus mono navy / mono white brandmarks we generated)
- Identity guide PDF + type guide JPG (reference only, not for product use)

> **If Metanoia has an internal icon set or has standardized on a different library (Material Symbols, Font Awesome, custom set), tell me and I'll swap Lucide out.**

---

## Index — what to read next

| File | Purpose |
|---|---|
| `colors_and_type.css` | All design tokens — drop into any HTML file with `<link>` |
| `SKILL.md` | Skill manifest; usable as an Agent Skill in Claude Code |
| `assets/` | Logos, identity guide PDF, type guide JPG |
| `fonts/` | Figtree TTFs (variable + italic) |
| `preview/*.html` | Design System tab cards — type, color, spacing, components |

UI kits and slide templates are **not** included in this initial pass — see Caveats below.

---

## Caveats

1. **No product UI source.** No codebase, Figma, or live URL was attached for AIC or the iBOM viewer, so `ui_kits/` is intentionally empty. To add high-fidelity UI kits, please attach the product source via the Import menu.
2. **Background stills missing.** `Brand Background Stills.zip` was referenced but never landed in the project — please re-attach via Import.
3. **Iconography substituted.** Lucide is a stand-in; confirm or correct.
4. **Semantic colors are an extension.** The identity guide doesn't define success/warning/error — the values in `colors_and_type.css` are tasteful additions tuned to sit beside the brand palette. Confirm or replace.
5. **No mono typeface in the kit.** We fall back to JetBrains Mono / system mono for code & technical IDs; if Metanoia has a preferred mono, swap in.
6. **No sample slide deck provided**, so `slides/` is omitted. Send a deck and we'll template it.
