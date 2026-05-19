# Feature: Figma-First Component Sync (figma → repo)

**Status:** Scheduled / not started  
**Origin:** Phase 3d build session — 2026-05-19  
**Scope:** Extend the existing token sync engine to also sync Figma component
sets into repo code, completing a true bi-directional design ↔ code pipeline.

---

## Problem

The current sync (`sync-figma-to-repo.js` / `sync-repo-to-figma.js`) handles
**design tokens only** — CSS custom properties ↔ Figma variables. Components
built Figma-first (e.g. Checkbox, Radio, Toggle, Tags) have no code equivalent
in the repo until someone manually writes it. This creates drift.

---

## Goal

One unified `sync-figma-to-repo.js` that handles both:
1. Variable/token diffs → `tokens/*.css` (already works)
2. Component diffs → `preview/components-*.html` + a future framework output

The designer builds in Figma. The sync engine reads component structure and
generates the matching HTML/CSS preview and (eventually) framework components.

---

## Proposed Architecture

### New file: `sync/component-map.js`

Parallel to `token-map.js`. Maps Figma component set names to repo output files
and describes how to translate variant properties to CSS classes.

```js
// component-map.js
module.exports.COMPONENT_MAP = [
  {
    figmaName: 'Form/Checkbox',       // Figma COMPONENT_SET name
    previewFile: 'preview/components-forms.html',
    cssClass: 'checkbox',
    variantProps: {
      State: {
        Unchecked:     '',
        Checked:       'is-checked',
        Indeterminate: 'is-indeterminate',
        Disabled:      'is-disabled',
      },
    },
  },
  {
    figmaName: 'Form/Toggle',
    previewFile: 'preview/components-forms.html',
    cssClass: 'toggle',
    variantProps: {
      State: { Off: '', On: 'is-on', Disabled: 'is-disabled' },
    },
  },
  {
    figmaName: 'Form/Tags',
    previewFile: 'preview/components-tags.html',
    cssClass: 'tag',
    variantProps: {
      Color:  { Success: 'success', Warning: 'warning', Error: 'error', Info: 'info', Neutral: 'neutral' },
      Size:   { SM: 'sm', MD: 'md' },
      Style:  { Subtle: 'subtle', Bold: 'bold' },
    },
  },
  // … one entry per component set
];
```

### Extended `sync-figma-to-repo.js`

Add a second pass after the existing token diff:

```
Phase 1 (existing): Figma variables → CSS token diff
Phase 2 (new):      Figma components → preview HTML diff
```

Phase 2 logic:
1. Read each entry in `COMPONENT_MAP`
2. Fetch the Figma component set via `figma.variables` / component API
3. For each variant, extract: layer structure, bound variables, text styles
4. Diff against the existing preview HTML
5. If diffs exist, regenerate the HTML block and open a PR

### What gets generated

For each component set, the generator produces:
- An HTML section in the target preview file with all variant combinations
- CSS using token variables (never hardcoded hex)
- If Lucide icons are used in the Figma component, the generated HTML includes
  `<i data-lucide="...">` slots with `lucide.createIcons()` at the bottom

### Framework output (phase 2, later)

Once preview HTML generation is stable, add a secondary generator for:
- **React**: one `.tsx` file per component with typed props from variant names
- **Web components**: `<ds-checkbox>` etc. using the same CSS token API

---

## Implementation Notes

### Reading Figma component structure

```js
// In sync-figma-to-repo.js — new section
const compSets = figma.root.findAll(n => n.type === 'COMPONENT_SET');
for (const set of compSets) {
  const entry = COMPONENT_MAP.find(m => m.figmaName === set.name);
  if (!entry) continue;

  for (const variant of set.children) {
    // variant.name = "Color=Success, Size=SM, Style=Subtle"
    const props = Object.fromEntries(
      variant.name.split(', ').map(p => p.split('='))
    );
    const cssClasses = Object.entries(props)
      .map(([k, v]) => entry.variantProps[k]?.[v] ?? '')
      .filter(Boolean)
      .join(' ');

    // Extract visual properties from layers:
    const fills   = variant.findAll(n => n.boundVariables?.fills);
    const strokes = variant.findAll(n => n.boundVariables?.strokes);
    const texts   = variant.findAll(n => n.type === 'TEXT');
    // … map bound variable names back to CSS custom property names via TOKEN_MAP
  }
}
```

### Reverse-mapping Figma variables → CSS

Use `TOKEN_MAP` from `token-map.js` in reverse:
```js
const figmaToCss = Object.fromEntries(TOKEN_MAP.map(t => [t.figma, t.css]));
// e.g. 'Status/Success/200' → '--color-success-200'
```

This means every variable-bound layer auto-generates the correct CSS token
reference, with no hardcoded values in the output.

---

## Files to Create / Modify

| Action | File |
|---|---|
| CREATE | `sync/component-map.js` |
| MODIFY | `sync/sync-figma-to-repo.js` — add Phase 2 component pass |
| MODIFY | `sync/token-map.js` — ensure all component-used tokens are mapped |
| MODIFY | `CLAUDE.md` — add "sync components" trigger phrase |
| POSSIBLY CREATE | `preview/components-forms.html` — generated form component showcase |

---

## Acceptance Criteria

- [ ] Running "sync Figma → repo" also checks for component structure diffs
- [ ] A Figma-first component (e.g. new Toggle variant) generates a matching
      HTML preview automatically via PR
- [ ] Generated CSS uses only `var(--...)` tokens, never hex
- [ ] All existing token sync behaviour is unchanged

---

## Related

- `sync/PRINT-DS-IN-FIGMA.md` — manual build plan this feature will eventually automate
- `sync/token-map.js` — existing variable mapping to extend
- `sync/sync-figma-to-repo.js` — file to extend (do not create a separate script)
