# **Plan v2: Build Complete Metanoia Design System in Figma**

## (Incorporating Full Feedback Pass)

---

## Context

The coded DS has 5 atomic token files. The Figma file (key: `c3ayt4AFrNKOmSkGBIyFi4`) has no variables, styles, or components. Before bootstrapping Figma, several token-level corrections are needed: adding 2 missing Display typography tokens, renaming the letter-spacing scale to be visually descriptive rather than use-case-named, and most critically, instating proper Light/Dark variable modes now to avoid downstream semantic debt. Phases run as sprints; a "RunDoc" frame on a Figma status page tracks progress for the wider team.

---

## Scope Overview

| Phase | What | Where |
| :---- | :---- | :---- |
| 0 | Token corrections \+ dark mode in CSS | tokens/\*.css, token-map.js, typography-utilities.css |
| 1 | Bootstrap 5 Figma variable collections (Light \+ Dark modes) | sync/init-figma.js → use\_figma |
| 2 | Text styles (11) \+ Effect styles (6) | use\_figma |
| 3 | Atoms: Buttons, Inputs, Tags, Icon library | use\_figma per component |
| 4 | Molecules: Cards, Alerts, Breadcrumb, Pagination, Tabs | use\_figma per component |
| 5 | Organisms: Nav, Modal, Table, Hero, Empty States | use\_figma per component |
| — | RunDoc frame updated at end of each sprint | use\_figma |

---

## Phase 0 — Token Corrections (CSS changes before Figma)

These must land in the repo before `init-figma.js` runs, so Figma variables are created from the correct values.

### 0a. Add missing Display typography tokens

Add to `tokens/typography.css`:

```css
--lh-display:  0.95;        /* Display-only line height, tighter than --lh-tight */
--ls-display: -0.035em;     /* Display-only letter spacing, tighter than --ls-tight */
```

Add to `sync/token-map.js`:

```javascript
{ css: '--lh-display', figma: 'Line Height/Display',       type: 'FLOAT', transform: parseFloat },
{ css: '--ls-display', figma: 'Letter Spacing/Display',    type: 'FLOAT', transform: emToNum },
```

### 0b. Rename letter-spacing tokens (visual descriptors, not use-cases)

| Old CSS var | Old value | New CSS var | Figma name |
| :---- | :---- | :---- | :---- |
| `--ls-tight` | \-0.02em | `--ls-tight` | Letter Spacing/Tight |
| `--ls-snug` | \-0.01em | `--ls-snug` | Letter Spacing/Snug |
| `--ls-normal` | 0 | `--ls-normal` | Letter Spacing/Normal |
| `--ls-wide` | 0.04em | `--ls-loose` | Letter Spacing/Loose |
| `--ls-eyebrow` | 0.12em | `--ls-wide` | Letter Spacing/Wide |

Changes needed:

- `tokens/typography.css`: rename `--ls-wide` → `--ls-loose`, `--ls-eyebrow` → `--ls-wide`  
- `typography-utilities.css`: update `.t-eyebrow { letter-spacing: var(--ls-wide); }` (was `--ls-eyebrow`)  
- `sync/token-map.js`: update both entries with new CSS var names and new Figma names  
- Any preview HTML using `--ls-eyebrow` or `--ls-wide` directly

### 0c. Instate Light/Dark modes in semantic tokens

**Decision:** Remove `--bg-inverse*`, `--fg-on-dark*`, `--border-on-dark` — these become the Dark mode values of the standard semantic tokens. Dark mode is toggled via `[data-theme="dark"]` on `<html>`.

Update `tokens/color-semantic.css` structure:

```css
/* ── Light mode (default) ── */
:root {
  --bg-canvas:       var(--color-white);
  --bg-subtle:       var(--color-grey-50);
  --bg-muted:        var(--color-grey-100);
  --fg-1:            var(--color-navy-900);
  --fg-2:            var(--color-grey-800);
  --fg-3:            var(--color-grey-600);
  --fg-4:            var(--color-grey-400);
  --fg-link:         var(--color-navy);
  --fg-link-hover:   var(--color-aqua-700);
  --fg-accent:       var(--color-aqua-700);
  --border-subtle:   var(--color-grey-200);
  --border-default:  var(--color-grey-300);
  --border-strong:   var(--color-grey-600);
  --border-accent:   var(--color-aqua);
  --bg-accent-soft:  var(--color-aqua-50);
  --bg-accent:       var(--color-aqua);
}

/* ── Dark mode ── */
[data-theme="dark"] {
  --bg-canvas:       var(--color-grey-900);   /* #131A21 */
  --bg-subtle:       var(--color-grey-800);   /* #232C35 */
  --bg-muted:        var(--color-grey-700);   /* #3A4754 */
  --fg-1:            var(--color-white);
  --fg-2:            rgba(255,255,255,0.88);
  --fg-3:            rgba(255,255,255,0.72);
  --fg-4:            rgba(255,255,255,0.48);
  --fg-link:         var(--color-light-aqua);
  --fg-link-hover:   var(--color-aqua);
  --fg-accent:       var(--color-aqua);
  --border-subtle:   rgba(255,255,255,0.10);
  --border-default:  var(--color-grey-700);
  --border-strong:   var(--color-grey-400);
  --border-accent:   var(--color-aqua);
  --bg-accent-soft:  rgba(50,203,237,0.12);
  --bg-accent:       var(--color-aqua);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    /* mirror [data-theme="dark"] values */
  }
}
```

**Tokens removed** (breaking — MAJOR bump to v2.0.0): `--bg-inverse`, `--bg-inverse-deep`, `--fg-on-dark`, `--fg-on-dark-2`, `--fg-on-dark-3`, `--border-on-dark`

**Preview HTML files** that use these removed tokens must be updated to use dark mode context (`data-theme="dark"` wrapper) instead.

**token-map.js**: Remove removed tokens; add Light and Dark mode mappings. The Semantic Figma collection will have 2 modes: `Light` and `Dark`.

**Version bump**: v2.0.0 (breaking token removal \+ dark mode)

---

## Phase 1 — Variable Bootstrap

### Create `sync/init-figma.js`

**White-labeled** — all brand-specific config is at the top (documented for reuse):

```javascript
// ── BRAND CONFIG ───────────────────────────────────────────
// To use in a different repo:
//   1. Point TOKEN_FILES to your token CSS files
//   2. Update COLLECTION_MAP to match your Figma collections
//   3. Ensure TOKEN_MAP is in your token-map.js
// ──────────────────────────────────────────────────────────
const CONFIG = {
  figmaFileKey: 'c3ayt4AFrNKOmSkGBIyFi4',
  tokenDir: path.resolve(__dirname, '../tokens'),
  collections: {
    Primitives: 'color-primitives.css',
    Semantic:   'color-semantic.css',
    Typography: 'typography.css',
    Spacing:    'spacing.css',
    Motion:     'motion.css',
  },
  modes: {
    Semantic: ['Light', 'Dark'],   // other collections: single mode only
  },
};
```

**Generated plugin script creates:**

- 5 `VariableCollection` objects — one per token file  
- `Semantic` collection gets 2 modes: `Light` and `Dark` (using `col.addMode('Dark')`)  
- Primitive COLOR/FLOAT/STRING variables with direct resolved values  
- Semantic COLOR variables as **Figma variable aliases** for `var()` references; direct RGBA for raw color values  
- Dark mode values set on the second mode of the Semantic collection

**Execution order** (must be sequential — aliases require source variables to exist first):

1. `use_figma` — create Primitives collection \+ all variables  
2. `use_figma` — create Semantic collection with Light \+ Dark modes, alias to Primitives  
3. `use_figma` — create Typography, Spacing, Motion collections

**Reuses from existing scripts** (no duplication):

- `parseCssVars()` — `sync-repo-to-figma.js`  
- `resolveAll()` — `sync-repo-to-figma.js`  
- `cssColorToFigma()` — `sync-repo-to-figma.js`  
- `remToPx`, `pxToNum`, `emToNum`, `msToNum` — `sync/token-map.js`  
- `TOKEN_MAP` — alias lookup table

**Variable count after Phase 1:** \~154 (152 original \+ 2 new Display tokens)

---

## Phase 2 — Text Styles \+ Effect Styles

### 2a. Text Styles (14 styles, fully variable-bound)

All use Figtree font family. No hardcoded values.

**Display & Heading styles:**

| Style | Font Size | Weight | Line Height | Letter Spacing |
| :---- | :---- | :---- | :---- | :---- |
| Display | Font Size/120 Display XL | Font Weight/600 Semibold | Line Height/Display | Letter Spacing/Display |
| H1 | Font Size/56 H1 | Font Weight/700 Bold | Line Height/Tight | Letter Spacing/Tight |
| H2 | Font Size/36 H2 | Font Weight/700 Bold | Line Height/Snug | Letter Spacing/Snug |
| H3 | Font Size/28 H3 | Font Weight/600 Semibold | Line Height/Snug | Letter Spacing/Snug |
| H4 | Font Size/24 H4 | Font Weight/600 Semibold | Line Height/Snug | Letter Spacing/Normal |
| H5 | Font Size/18 Body LG | Font Weight/600 Semibold | Line Height/Snug | Letter Spacing/Normal |

**Body & UI styles:**

| Style | Font Size | Weight | Line Height | Letter Spacing |
| :---- | :---- | :---- | :---- | :---- |
| Lead | Font Size/20 | Font Weight/400 Regular | Line Height/Relaxed | Letter Spacing/Normal |
| Body | Font Size/16 Body | Font Weight/400 Regular | Line Height/Relaxed | Letter Spacing/Normal |
| Body SM | Font Size/14 Small | Font Weight/400 Regular | Line Height/Normal | Letter Spacing/Normal |
| Caption | Font Size/12 Micro | Font Weight/400 Regular | Line Height/Normal | Letter Spacing/Normal |
| Eyebrow | Font Size/13 Caption | Font Weight/600 Semibold | Line Height/Snug | Letter Spacing/Wide |

**Button-specific styles** (semibold weight; separate from body copy so button text is always distinct):

| Style | Font Size | Weight | Line Height | Letter Spacing |
| :---- | :---- | :---- | :---- | :---- |
| Button/LG | Font Size/16 Body | Font Weight/600 Semibold | Line Height/Normal | Letter Spacing/Normal |
| Button/MD | Font Size/14 Small | Font Weight/600 Semibold | Line Height/Normal | Letter Spacing/Normal |
| Button/SM | Font Size/13 Caption | Font Weight/600 Semibold | Line Height/Normal | Letter Spacing/Normal |

Method: `figma.createTextStyle()` \+ `textStyle.setBoundVariable('fontSize', var)` per dimension.

### 2b. Effect Styles (6 shadow styles)

| Style | CSS token |
| :---- | :---- |
| Shadow/XS | `--shadow-xs` |
| Shadow/SM | `--shadow-sm` |
| Shadow/MD | `--shadow-md` |
| Shadow/LG | `--shadow-lg` |
| Shadow/XL | `--shadow-xl` |
| Shadow/Focus | `--shadow-focus` |

Method: `figma.createEffectStyle()` with parsed box-shadow values → Figma drop shadow objects. Multi-value shadows (sm, md, lg, xl) become multiple effects on one style.

---

## Phase 3 — Atoms

Creation order: Variables and styles MUST exist before atoms. Each component is one `use_figma` call.

### 3a. Logo

**Variants:** Mark \[Brandmark, Horizontal Lockup, Vertical Lockup\] × Color \[Full Color, Mono White, Mono Dark\]

9 total combinations. Each variant is a component wrapping the SVG artwork from `assets/`. Wordmark text layers use a dedicated `Wordmark` text style (Figtree Bold, lowercase, `Letter Spacing/Tight`). These are atoms — referenced inside organisms like Nav and Hero.

### 3b. Icon Component Library

Minimal Lucide proxy set (most common icons used across the DS components):

- `icon-arrow-right`, `icon-check`, `icon-x`, `icon-chevron-down`, `icon-chevron-right`, `icon-search`, `icon-plus`, `icon-info`, `icon-alert-triangle`, `icon-alert-circle`, `icon-check-circle`, `icon-external-link`, `icon-menu`, `icon-more-horizontal`, `icon-upload`, `icon-download`, `icon-eye`, `icon-eye-off`, `icon-trash-2`, `icon-edit-2`, `icon-user`, `icon-inbox`, `icon-home`

Structure: Each icon is a component with a single vector layer at 16/20/24px. A master `Icon` component wraps them with a `Size [16, 20, 24]` property. One `Icon/Placeholder` component used everywhere icons appear in other components for easy designer swap.

### 3c. Buttons

**Variants:** Type \[Primary, Secondary, Ghost, Destructive\] × Size \[SM, MD, LG\] × Icon \[None, Leading, Trailing\] × State \[Default, Hover, Active, Focus, Disabled\] \= **180 variant combinations**  
**Plus:** Icon-only button (separate component set): Type \[Primary, Secondary, Ghost, Destructive\] × Size \[SM, MD, LG\] × State \= 60 combinations

Size specs (padding and radius scale with size):

- SM: 6px/12px padding, `Radius/SM`, text layer uses **Button/SM** text style  
- MD: 8px/16px padding, `Radius/MD`, text layer uses **Button/MD** text style  
- LG: 12px/24px padding, `Radius/LG`, text layer uses **Button/LG** text style

Bindings: color variables for bg/fg/border per type+state, appropriate shadow effect style on hover. Icon slots use `Icon/Placeholder` atom instances.

### 3d. Form Inputs

**Variants:**

- Text Input: State \[Default, Focus, Filled, Error, Disabled\]  
- Textarea: State \[Default, Focus, Filled, Error, Disabled\]  
- Select: State \[Default, Open, Filled, Error, Disabled\]  
- Checkbox: State \[Unchecked, Checked, Indeterminate, Disabled\]  
- Radio: State \[Unselected, Selected, Disabled\]  
- Toggle: State \[Off, On, Disabled\]

Text style assignments inside each component:

- Field label: **Body SM** text style  
- Input text (the value inside the field): **Body** text style  
- Placeholder text: **Body** text style (using `Foreground/Tertiary` color)  
- Helper text: **Caption** text style  
- Error message: **Caption** text style (using status error color variable)

Bindings: `Border/Default`, `Border/Accent` (focus), `Background/Canvas`, shadow-focus on focus ring, `Radius/MD`.

### 3e. Tags & Badges

**Variants:** Color \[Success, Warning, Error, Info, Neutral\] × Size \[SM, MD\] × Style \[Subtle, Bold\]

Bindings: Status color variables (e.g. `Status/Success/200` for subtle bg, `Status/Success/800` for text), `Radius/Pill`. Text uses **Caption** text style (SM) or **Body SM** (MD).

---

## Phase 4 — Molecules

Each molecule uses nested atom instances — no recreating from scratch.

### 4a. Cards

**Variants:** Elevation \[Flat, Raised, Floating\] Note: Previously "Surface \[Light, Dark\]" — replaced by variable modes (apply Dark mode at the design level, not as a variant). Each elevation uses the appropriate shadow effect style.

Bindings: `Background/Canvas`, `Border/Subtle`, shadow effect styles. Text layers use Body, Body SM, H4 text styles. Footer slot uses Button atom instances.

### 4b. Alerts

**Variants:** Type \[Info, Success, Warning, Error\] × Style \[Inline, Banner\]

Structure: Icon/Placeholder atom instance \+ title (using **Body** text style, semibold) \+ body (**Body SM** text style) \+ optional dismiss (Button atom, Ghost, Trailing Icon variant). Bindings: status color variables per type.

### 4c. Breadcrumb

**Variants:** State \[Default, With Home Icon\] Separator: Chevron only (slash variant removed).

Uses Icon/Placeholder for home icon and chevron separators. Text uses **Body SM** text style.

### 4d. Pagination

**Variants:** Type \[Numbered, Prev/Next, Compact\] Uses Button atom instances (Ghost type) for page number buttons and prev/next controls, preserving correct state variants. Row-count selector uses Select input atom.

### 4e. Tabs — RENAMED

- **View Tabs** (was "Underline") — top-level live area switching, full-width underline indicator  
- **Section Tabs** (was "Pill") — subsection switching within a live area, pill-shaped

**Variants for each:** State per tab item \[Default, Active, Hover, Disabled\] × optional Count badge

Text uses **Body SM** text style (semibold for active).

---

## Phase 5 — Organisms

Each organism uses nested molecule AND atom instances.

### 5a. Navigation

**Top Nav:** Uses Button atoms (Ghost, icon variants) for action items. Icon/Placeholder for nav logo. Text uses H5 and Body SM text styles. **Sidebar Nav:** Icon/Placeholder atoms baked into each nav item. Group labels use Eyebrow text style. Nav items use Body SM text style with Body text style on hover/active. Note: Dark mode applied at design level via variable mode switch — not a separate variant.

### 5b. Modal / Dialog

**Variants:** Type \[Confirm, Destructive, Form, Success\]

Structure:

- Header: H4 text style title \+ Icon/Placeholder atom (context icon) \+ close button (Button, Icon-only, Ghost)  
- Body: Body text style  
- Footer: Button atoms — primary action \+ secondary action. Some variants use Trailing Icon button variant.

### 5c. Table — Full Atomic Breakdown

**Atoms:**

- Table Cell: Variants by Content \[Text, Mono, Status Tag, Action, Checkbox, Number\] × Align \[Left, Center, Right\]  
- Table Header Cell: Variants by Sort \[None, Ascending, Descending\] \+ same Content types

**Molecules:**

- Table Row: Variants by State \[Default, Hover, Selected, Disabled\]  
- Table Header Row  
- Table Footer Row (with pagination molecule)

**Organisms (3 table types):**

- **Data Table** — granular records, mono IDs, status tags, sortable columns, row checkboxes, responsive via horizontal scroll with sticky first column  
- **Pricing Table** — feature comparison, checkmark cells, tier headers, accent highlight column  
- **Feature Matrix** — similar to pricing but for attribute/spec comparisons

Responsive strategy: at narrow breakpoints, horizontal overflow scroll with sticky first column. Mobile (\<480px): option to convert to accordion rows.

### 5d. Hero

**Modes:** Light and Dark (via variable modes — not separate variants) **Variants:** Layout \[Full Bleed, Split Panel\]

Note: "Dark theme" hero \= Dark variable mode applied to the frame. "Split panel" \= left side Light mode, right side Dark mode, achieved via nested frames with mode overrides.

### 5e. Empty States

**Variants:** Type \[First Use, No Results, Error, Loading/Skeleton\] Uses Icon/Placeholder atom, Button atoms (CTA), H4 \+ Body \+ Body SM text styles. Content matches the preview/components-empty.html showcase.

---

## Sprint / RunDoc System

**Each sprint \= one `use_figma` session.** At the start of Sprint 1, a `DS Status` page is created in the Figma file. A `RunDoc` frame on that page is updated at the end of every sprint:

```
Metanoia DS — Build RunDoc
Sprint: [N] / [Total]
Last run: [date]
Status: [In Progress / Complete / Blocked]

Completed:
  ✓ Phase 0 — Token corrections (v2.0.0)
  ✓ Phase 1 — Variables (154 vars, 5 collections, Light/Dark modes)
  ✓ Phase 2 — Text styles (11) + Effect styles (6)
  ...

In progress:
  → Phase 3a — Icon library

Next:
  Phase 3b — Buttons

Notes / Blockers:
  [any issues from last run]
```

This gives the team a persistent, in-Figma record of build state without needing to refer back to this chat.

---

## Files to Create/Modify

### Phase 0 (code changes, before Figma):

- **MODIFY** `tokens/typography.css` — add `--lh-display`, `--ls-display`; rename `--ls-wide` → `--ls-loose`, `--ls-eyebrow` → `--ls-wide`  
- **MODIFY** `tokens/color-semantic.css` — add dark mode overrides, remove inverse/on-dark tokens  
- **MODIFY** `typography-utilities.css` — update `.t-eyebrow` letter-spacing var reference; update `.t-wordmark` if using removed vars  
- **MODIFY** `sync/token-map.js` — add display tokens, rename ls- entries, remove inverse/on-dark entries, add dark mode Figma mode references  
- **MODIFY** `preview/*.html` — replace removed `--bg-inverse`, `--fg-on-dark*`, `--border-on-dark` references  
- **MODIFY** `index.html` — version bump v2.0.0 \+ changelog entry

### Phase 1:

- **CREATE** `sync/init-figma.js` — white-labeled variable bootstrap generator with brand config block at top

### Post-execution:

- **MODIFY** `CLAUDE.md` — add "initialize Figma variables" trigger phrase, document init-figma.js config for future brands  
- **MODIFY** `index.html` — patch-level changelog entries per sprint

---

## Reusable Code (no duplication)

- `parseCssVars(cssText)` — `sync-repo-to-figma.js:24`  
- `resolveAll(vars)` — `sync-repo-to-figma.js:34`  
- `cssColorToFigma(val)` — `sync-repo-to-figma.js:52`  
- `remToPx`, `pxToNum`, `emToNum`, `msToNum` — `sync/token-map.js` (exported)  
- `TOKEN_MAP` — `sync/token-map.js` (alias lookup)

---

## Verification Checklist

### After Phase 0:

- [ ] `--ls-wide` \= 0.12em in CSS; `--ls-loose` \= 0.04em  
- [ ] `.t-eyebrow` uses `var(--ls-wide)` and renders correctly  
- [ ] `[data-theme="dark"]` applied to `<html>` inverts canvas/fg/border tokens correctly  
- [ ] No references to removed tokens (`--bg-inverse`, `--fg-on-dark`, etc.) in any file  
- [ ] Version \= v2.0.0

### After Phase 1:

- [ ] `figma.variables.getLocalVariables().length` \= 154  
- [ ] 5 collections visible in Figma: Primitives, Semantic, Typography, Spacing, Motion  
- [ ] Semantic collection has 2 modes: Light and Dark  
- [ ] `Background/Canvas` Light mode \= alias to `Brand/White`; Dark mode \= alias to `Grey/900`  
- [ ] `Font Size/16 Body` \= 16 (FLOAT)  
- [ ] `Motion/Duration Fast` \= 120 (FLOAT)  
- [ ] Run sync diff (`sync-repo-to-figma.js`) → 0 differences, 0 FIGMA\_MISSING

### After Phase 2:

- [ ] 14 text styles visible in Figma (11 Display/Body/UI \+ 3 Button/SM/MD/LG), all bound to Typography variables (no hardcoded px)  
- [ ] 6 effect styles visible; multi-value shadows have multiple effects stacked  
- [ ] Apply `Body` text style to a text layer → renders Figtree 16px/relaxed  
- [ ] Apply `Button/MD` text style → renders Figtree 14px/semibold (distinct from Body)

### After Phases 3–5:

- [ ] Edit `--color-navy` in CSS → run `sync-repo-to-figma.js` → Figma `Brand/Navy` updates → Button Primary background updates automatically via alias chain  
- [ ] Toggle Dark mode on a design frame → all semantic tokens flip correctly  
- [ ] Hero organism: Light mode \= white canvas; Dark mode \= grey-900 canvas (same component, mode switched)  
- [ ] Organism uses molecule instances; molecules use atom instances (no recreated layers)  
- [ ] Icon/Placeholder component is swappable with any Lucide icon component  
- [ ] Table responsive: horizontal scroll with sticky first column at \<768px

