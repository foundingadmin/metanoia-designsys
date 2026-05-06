# CLAUDE.md — Metanoia Design System

## Repo structure

```
/
├── index.html              ← Single-page design system showcase (GitHub Pages root)
├── colors_and_type.css     ← All design tokens — the source of truth
├── README.md               ← Brand guidelines, voice, visual foundations
├── SKILL.md                ← Claude Code skill manifest
├── assets/                 ← Logos (SVG), identity guide PDF, type guide JPG
├── fonts/                  ← Figtree variable + italic TTFs
├── preview/                ← Individual component/token preview cards (HTML)
└── uploads/                ← Original brand files from client
```

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

Current version: **v1.1.0**

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
URL: `https://foundingadmin.github.io/designsystem-metanoia/`

Enable Pages in repo Settings → Pages → Source: **Deploy from branch**, branch: **main**, folder: **/ (root)**.
