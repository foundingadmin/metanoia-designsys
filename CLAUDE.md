# CLAUDE.md — Metanoia Design System

## Repo structure

```
/
├── index.html                   ← Single-page design system showcase (GitHub Pages root)
├── colors_and_type.css          ← Barrel file: @imports tokens/* + typography-utilities.css
├── typography-utilities.css     ← @font-face + .t-* classes (not synced with Figma)
├── tokens/                      ← Atomic token files — source of truth for sync
│   ├── color-primitives.css     ← Raw palette hex values (brand, navy, aqua, grey, status)
│   ├── color-semantic.css       ← Role aliases: bg / fg / border (var() references)
│   ├── typography.css           ← Font family, weight, size, line-height, letter-spacing
│   ├── spacing.css              ← Space scale, radii, shadows, layout containers
│   └── motion.css               ← Easing curves + duration tiers
├── sync/                        ← Figma ↔ CSS sync scripts
│   ├── token-map.js             ← CSS ↔ Figma variable mapping (organized by collection)
│   ├── sync-figma-to-repo.js   ← Figma → tokens/* diff + PR
│   └── sync-repo-to-figma.js   ← tokens/* → Figma diff + apply
├── README.md                    ← Brand guidelines, voice, visual foundations
├── SKILL.md                     ← Claude Code skill manifest
├── assets/                      ← Logos (SVG), identity guide PDF, type guide JPG
├── fonts/                       ← Figtree variable + italic TTFs
├── preview/                     ← Individual component/token preview cards (HTML)
└── uploads/                     ← Original brand files from client
```

### Token file responsibilities

| File | What it contains | Figma collections |
|---|---|---|
| `tokens/color-primitives.css` | Raw hex values only — never `var()` | Brand, Navy, Aqua, Grey, Status |
| `tokens/color-semantic.css` | Role aliases (`var()` references) | Background, Foreground, Border |
| `tokens/typography.css` | Font family, size, weight, line-height, letter-spacing | Font Size, Font Weight, Line Height, Letter Spacing |
| `tokens/spacing.css` | Space scale, radii, shadows, container widths | Spacing, Radius, Shadow, Layout |
| `tokens/motion.css` | Easing curves, duration tiers | Motion |
| `typography-utilities.css` | `@font-face` + `.t-*` classes | **Not synced** |

## Versioning rules

This system uses **Semantic Versioning**: `MAJOR.MINOR.PATCH`

| Bump | When |
|---|---|
| **MAJOR** | Breaking token renames (require find-and-replace in consuming code), component removal, or changes that break existing usage |
| **MINOR** | New components, new token categories, new variants on existing components, significant visual updates |
| **PATCH** | Copy/typo fixes, minor visual tweaks (spacing ≤4px, color shift ≤5%), doc-only updates, new examples within an existing card |

### How to update the version

1. Open `index.html` and update the two constants near the top of the `<script>` block:
   ```js
   const VERSION      = 'x.y.z';
   const LAST_UPDATED = 'Month D, YYYY';
   ```
2. Add a new entry at the **top** of the `CHANGELOG` array (newest first):
   ```js
   {
     version: 'x.y.z',
     date: 'YYYY-MM-DD',
     type: 'major' | 'minor' | 'patch',
     changes: [
       'Short imperative description of what changed',
     ],
   },
   ```
3. Commit: `chore: bump to vX.Y.Z — <one-line summary>`

Current version: **v1.5.1**

## Adding a new preview card

1. Create `preview/components-<name>.html` (or `colors-`, `spacing-`, etc.)
2. Link `../colors_and_type.css` — never hardcode hex values or font sizes.
3. Use `<script src="https://unpkg.com/lucide@latest"></script>` + `lucide.createIcons()` if icons are needed.
4. Add an entry to the `SECTIONS` array in `index.html`:
   ```js
   {
     id: 'name',          // matches <section id="..."> and sidebar link
     group: 'Components', // 'Foundations' | 'Components' (controls sidebar grouping)
     icon: 'lucide-icon-name',
     label: 'Display Name',
     desc: 'One sentence visible on the showcase page.',
     cols: 1,             // 1 | 2 | 3 | 4 (grid columns for card layout)
     cards: [
       { src: 'preview/components-name.html', label: 'Card label' },
     ],
   },
   ```
5. Bump version (MINOR if new component, PATCH if new variant on existing).

## Design rules (quick ref)

- **Font:** Figtree variable (300–900). Always `var(--font-sans)` — never hardcode.
- **Colors:** `var(--color-navy)` `var(--color-aqua)` `var(--color-light-aqua)` + token scale.
- **Wordmark:** always lowercase `metanoia`. Never `Metanoia` or `METANOIA` inside a logo context.
- **Icons:** Lucide only, 2px stroke, 16/20/24px, `currentColor`, never filled.
- **Spacing:** 4px grid. Use `var(--space-*)` tokens.
- **No emoji, no exclamation marks, no decorative gradients, no textures.**
- **Motion:** 120–200–320ms tiers, `var(--ease-standard)`. No bounces or spring overshoots.

## GitHub Pages

The site is served from `index.html` at the repo root.  
URL: `https://foundingadmin.github.io/metanoia-designsys/`

Enable Pages in repo Settings → Pages → Source: **Deploy from branch**, branch: **main**, folder: **/ (root)**.

# DS Sync — Claude Code Instructions

This section extends the main CLAUDE.md with instructions for running
design token syncs between `tokens/` and the Figma file.

**Figma File Key:** `c3ayt4AFrNKOmSkGBIyFi4`
**Sync scripts:** `sync/token-map.js`, `sync/sync-figma-to-repo.js`, `sync/sync-repo-to-figma.js`

---

## Triggering a Sync

| What you say | What runs |
|---|---|
| "sync Figma → repo" | Reads Figma variables, diffs CSS, opens PR |
| "sync repo → Figma" | Reads CSS, diffs Figma variables, updates Figma directly |
| "show me the diff" | Runs either diff without writing anything |

---

## Figma → Repo (opens PR)

### Step 1 — Fetch Figma variables
Use `Figma:use_figma` to read all local variables:

```js
const collections = figma.variables.getLocalVariableCollections();
const allVars = [];
for (const col of collections) {
  for (const id of col.variableIds) {
    const v = figma.variables.getVariableById(id);
    const modeId = Object.keys(v.valuesByMode)[0];
    const raw = v.valuesByMode[modeId];
    allVars.push({
      name: v.name,
      resolvedType: v.resolvedType,
      value: raw,
    });
  }
}
return allVars;
```

### Step 2 — Run the diff
```js
const { TOKEN_MAP } = require('./sync/token-map.js');
const { run } = require('./sync/sync-figma-to-repo.js');
const result = run(figmaVars, TOKEN_MAP); // figmaVars from Step 1
```

### Step 3 — If no changes
Report "✓ CSS is in sync with Figma." and stop.

### Step 4 — If changes found
Show the diff to the user. Then execute these shell commands in order:

```bash
git checkout -b {result.branch}
git add tokens/
git commit -m "{result.commitMsg}"
git push -u origin {result.branch}
gh pr create \
  --title "DS Sync: {summary}" \
  --body "{result.prBody}" \
  --base main \
  --head {result.branch}
```

Report the PR URL to the user. Done — human reviews and merges.

### Version bump
After the PR is merged, remind the user to bump the version in `index.html`
per the versioning rules in CLAUDE.md (`PATCH` for value changes, `MAJOR` for renames).

---

## Repo → Figma (writes directly, no PR)

### Step 1 — Fetch Figma variables
Same as above (Step 1 of Figma→Repo).

### Step 2 — Run the diff
```js
const { TOKEN_MAP } = require('./sync/token-map.js');
const { run } = require('./sync/sync-repo-to-figma.js');
const result = run(figmaVars, TOKEN_MAP);
```

### Step 3 — Dry run first
**Always show the diff and ask for confirmation before writing to Figma.**
Say: "I found X variable(s) that differ. Here's what will change: [list].
Shall I apply these updates to Figma?"

### Step 4 — Apply via Figma MCP
Execute `result.script` using `Figma:use_figma`:
```js
// result.script is ready-to-run Figma plugin JS
// Pass it directly as the `code` parameter
```

Report: "✓ Updated X variables in Figma."

---

## Adding New Tokens

When a new CSS var is added, three things must happen together:
1. Add it to the correct file in `tokens/` (match the category)
2. Create the corresponding Figma variable in the right collection
3. Add a new entry in `sync/token-map.js` with the correct `type`

| Token category | CSS file | Figma collection |
|---|---|---|
| Raw color | `tokens/color-primitives.css` | Brand / Navy / Aqua / Grey / Status |
| Role color | `tokens/color-semantic.css` | Background / Foreground / Border |
| Typography | `tokens/typography.css` | Font Size / Font Weight / Line Height / Letter Spacing |
| Space / shape | `tokens/spacing.css` | Spacing / Radius / Shadow / Layout |
| Motion | `tokens/motion.css` | Motion |

Claude Code can handle all three steps when asked:
"Add a new token --color-coral: #FF6B6B to the design system"

---

## Warnings to watch for

| Warning | Meaning | Action |
|---|---|---|
| `CSS_MISSING` | Token in map but not in CSS | Add to CSS or remove from map |
| `FIGMA_MISSING` | Token in map but not in Figma | Create variable in Figma or remove from map |
| `NOT_A_COLOR` | CSS value isn't a parseable color | Check for var() alias chain or non-color token |
