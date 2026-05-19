---
name: figma-component-build
description: >
  Use this skill when building or rebuilding Figma components from this
  design system repo. Covers the exact Figma Plugin API patterns, known gotchas,
  build order, variable binding patterns, and script structure required to
  generate a correct, variable-bound component set on the first attempt.
  Trigger: whenever asked to "build in Figma", "generate components", "push to Figma",
  or "initialize the Figma file" from repo source.
user-invocable: true
---

# Figma Component Build Skill
## Design System — Code-to-Figma Reference

This skill captures every lesson learned from building a Button component set
in Figma from repo CSS tokens. Follow these rules exactly to avoid the errors
that were hit in practice.

---

## Mandatory Build Order

Variables and styles must exist BEFORE any component that references them.
Run these phases in strict sequence — never skip ahead.

```
1. Figma Variables       — primitives first, then semantic aliases
2. Text Styles           — after variables (font binding requires variable IDs)
3. Effect Styles         — shadows from spacing.css
4. Icon/Placeholder atom — before ANY component that uses icon slots
5. Atoms                 — Button, Input, Tag, Badge
6. Molecules             — Card, Alert, Breadcrumb, Pagination, Tabs
7. Organisms             — Nav, Modal, Table, Hero, Empty States
```

To check what already exists before building, run:

```js
// Quick audit — paste into use_figma
const vars = figma.variables.getLocalVariables().length;
const styles = figma.getLocalTextStyles().length;
const effects = figma.getLocalEffectStyles().length;
const comps = figma.root.findAll(n => n.type === 'COMPONENT').length;
return { vars, styles, effects, comps };
```

---

## Script Skeleton (copy-paste starting point)

Every `use_figma` call should start with this structure:

```js
// ── 1. Load ALL fonts before touching any text ────────────────────
await Promise.all([
  figma.loadFontAsync({ family: 'Figtree', style: 'Light' }),
  figma.loadFontAsync({ family: 'Figtree', style: 'Regular' }),
  figma.loadFontAsync({ family: 'Figtree', style: 'Medium' }),
  figma.loadFontAsync({ family: 'Figtree', style: 'SemiBold' }),
  figma.loadFontAsync({ family: 'Figtree', style: 'Bold' }),
  figma.loadFontAsync({ family: 'Figtree', style: 'ExtraBold' }),
  figma.loadFontAsync({ family: 'Figtree', style: 'Black' }),
]);
// Skip fonts you won't use, but include all that any text style references.
// Omitting this causes: "Cannot write to node with unloaded font" error.

// ── 2. Core helpers ───────────────────────────────────────────────
function findVar(name) {
  return figma.variables.getLocalVariables().find(v => v.name === name) || null;
}

function hexRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
    a: 1,
  };
}

// Use this for fill color bindings — NOT node.setBoundVariable()
function bindFillColor(node, variable) {
  if (!node.fills || node.fills.length === 0) return;
  const paint = figma.variables.setBoundVariableForPaint(
    node.fills[0], 'color', variable
  );
  node.fills = [paint];
}

// Use this for stroke color bindings
function bindStrokeColor(node, variable) {
  if (!node.strokes || node.strokes.length === 0) return;
  const paint = figma.variables.setBoundVariableForPaint(
    node.strokes[0], 'color', variable
  );
  node.strokes = [paint];
}

// ── 3. Navigate to the correct page ──────────────────────────────
let dsPage = figma.root.children.find(p => p.name.toLowerCase() === 'ds')
          || figma.root.children.find(p => p.name.toLowerCase() === 'components')
          || figma.root.children[0];
await figma.setCurrentPageAsync(dsPage);
```

---

## Figma Plugin API: Correct Values

These are the most common mistakes. Use the corrected values.

### Sizing modes
```js
// ✅ Correct — 'AUTO' means "hug contents"
frame.primaryAxisSizingMode = 'AUTO';    // hug on primary axis
frame.counterAxisSizingMode = 'AUTO';    // hug on counter axis
frame.primaryAxisSizingMode = 'FIXED';   // fixed size

// ❌ Wrong — 'HUG' is NOT a valid value
frame.primaryAxisSizingMode = 'HUG';    // throws: Invalid enum value
```

### layoutSizingHorizontal / layoutSizingVertical
```js
// ✅ Valid only on TEXT nodes, or FRAMES that ARE themselves auto-layout
textNode.layoutSizingHorizontal = 'HUG';
textNode.layoutSizingVertical   = 'HUG';

autoLayoutFrame.layoutSizingHorizontal = 'HUG'; // only if frame has layoutMode != NONE

// ✅ FIXED is always valid for any auto-layout child
iconInstance.layoutSizingHorizontal = 'FIXED';
iconInstance.layoutSizingVertical   = 'FIXED';

// ❌ Wrong — regular non-autolayout frames can't use HUG
regularFrame.layoutSizingHorizontal = 'HUG'; // throws: HUG can only be set on auto-layout frames
```

### Binding variables to fill/stroke colors
```js
// ✅ Correct — use setBoundVariableForPaint
const colorVar = findVar('Brand/Navy');
const paint = figma.variables.setBoundVariableForPaint(
  node.fills[0], 'color', colorVar
);
node.fills = [paint];

// ❌ Wrong — setBoundVariable does not work for fill color
node.setBoundVariable('fill', colorVar);     // no effect
node.setBoundVariable('fillColor', colorVar); // no effect
```

### Binding variables to layout properties
```js
// ✅ Correct — use setBoundVariable for scalar layout props
node.setBoundVariable('cornerRadius', radiusVar);
node.setBoundVariable('paddingTop',   spacingVar);
node.setBoundVariable('paddingBottom',spacingVar);
node.setBoundVariable('paddingLeft',  spacingVar);
node.setBoundVariable('paddingRight', spacingVar);
node.setBoundVariable('itemSpacing',  spacingVar);
```

---

## Line Height: The Critical Gotcha

**The problem:** Figma interprets FLOAT variables bound to `lineHeight` as
**pixel values**, NOT percentage multipliers. If the variable stores `1.45`,
the line height is `1.45px` (essentially nothing → text appears as 2px tall).
If you change it to `145`, the line height is `145px` (enormous).

**The fix:** Set line height directly on text styles as an explicit PERCENT
object. Do NOT bind `lineHeight` to a variable.

```js
// ✅ Correct — explicit PERCENT unit
textStyle.lineHeight = { unit: 'PERCENT', value: 145 }; // = 1.45×

// ✅ Correct — explicit PIXELS unit (use when you know the exact px value)
textStyle.lineHeight = { unit: 'PIXELS', value: 20 };

// ❌ Wrong — variable binding makes Figma use px, not %
textStyle.setBoundVariable('lineHeight', lhVar); // lhVar=1.45 → 1.45px line height

// ❌ Wrong — ×100 trick doesn't help
// lhVar=145 → 145px line height (still broken)
```

**Reference line height values for Metanoia text styles:**

| Style | PERCENT value |
|---|---|
| Display | 95% |
| H1 | 105% |
| H2, H3, H4, H5 | 120% |
| Eyebrow | 120% |
| Lead, Body | 160% |
| Body SM, Caption | 145% |
| Button/SM, Button/MD, Button/LG | 145% |

Line height FLOAT variables in the Typography collection store the CSS
unitless multiplier (e.g. `1.45`) for sync purposes only — they are not
bound to any text style.

---

## Text Node Setup for Button Labels

Every button label text node needs these settings or the button height will
be wrong:

```js
const txt = figma.createText();
txt.fontName         = { family: 'Figtree', style: 'SemiBold' };
txt.fontSize         = 14;                                  // or from variable
txt.lineHeight       = { unit: 'PERCENT', value: 145 };    // explicit — never variable-bound
txt.textAutoResize   = 'WIDTH_AND_HEIGHT';                  // REQUIRED — prevents 2px height bug
txt.layoutSizingHorizontal = 'HUG';                        // text in autolayout parent
txt.layoutSizingVertical   = 'HUG';
txt.characters       = 'Medium button';                     // representative placeholder text
```

Omitting `textAutoResize = 'WIDTH_AND_HEIGHT'` causes the text node to render
at 2px tall (the default fixed height), making icon-slot variants appear much
taller than no-icon variants of the same size.

---

## Button Component Anatomy

```
COMPONENT_SET  name='Button'
  layoutMode='HORIZONTAL', layoutWrap='WRAP'
  primaryAxisSizingMode='FIXED'   ← must be FIXED, not AUTO, for wrap to work
  width = (computed from variant grid)

  └── COMPONENT  name='Type=Primary, Size=MD, Icon=None, State=Default'
        layoutMode='HORIZONTAL'
        primaryAxisSizingMode='AUTO'    ← hug width
        counterAxisSizingMode='AUTO'    ← hug height
        primaryAxisAlignItems='CENTER'
        counterAxisAlignItems='CENTER'
        paddingTop/Bottom = 12          ← bound to Spacing/3
        paddingLeft/Right = 20          ← bound to Spacing/5
        itemSpacing = 8                 ← bound to Spacing/2
        cornerRadius = 8               ← bound to Radius/MD

        └── [INSTANCE: Icon/Placeholder Size=16]  only when Icon=Leading
              layoutSizingHorizontal='FIXED'
              layoutSizingVertical='FIXED'

        └── TEXT  'Medium primary'
              textAutoResize='WIDTH_AND_HEIGHT'
              layoutSizingHorizontal='HUG'
              layoutSizingVertical='HUG'
              textStyleId = (Button/MD style ID)

        └── [INSTANCE: Icon/Placeholder Size=16]  only when Icon=Trailing
              layoutSizingHorizontal='FIXED'
              layoutSizingVertical='FIXED'
```

**Variant naming format** (Figma creates properties from this):
```
Type=Primary, Size=MD, Icon=None, State=Default
```

**Variant matrix** (4 × 3 × 3 × 5 = 180):
- Type: Primary, Secondary, Ghost, Destructive
- Size: SM, MD, LG
- Icon: None, Leading, Trailing
- State: Default, Hover, Active, Focus, Disabled

**Size specs matching HTML CSS (`preview/components-buttons.html`):**

| Size | paddingV | paddingH | gap | iconSize | Radius var |
|---|---|---|---|---|---|
| SM | 8px (Spacing/2) | 14px (explicit) | 8px | 16px | Radius/MD |
| MD | 12px (Spacing/3) | 20px (Spacing/5) | 8px | 16px | Radius/MD |
| LG | 14px (explicit) | 24px (Spacing/6) | 8px | 20px | Radius/MD |

**Expected rendered heights** (after line height fix):
- SM: 35px (8 + 19 + 8)
- MD: 44px (12 + 20 + 12)
- LG: 51px (14 + 23 + 14)

---

## Icon/Placeholder Component

Must be created BEFORE building buttons. Designers swap this component instance
in the properties panel to replace placeholders with actual Lucide icons.

```js
function makeIconPlaceholder(size) {
  const comp = figma.createComponent();
  comp.name = `Size=${size}`;
  comp.resize(size, size);
  comp.layoutMode = 'HORIZONTAL';
  comp.primaryAxisAlignItems = 'CENTER';
  comp.counterAxisAlignItems = 'CENTER';
  comp.primaryAxisSizingMode = 'FIXED';
  comp.counterAxisSizingMode = 'FIXED';
  comp.cornerRadius = 3;
  comp.fills   = [{ type: 'SOLID', color: hexRgb('#ECEFF2') }]; // grey-100
  comp.strokes = [{ type: 'SOLID', color: hexRgb('#B6BEC6') }]; // grey-300
  comp.strokeWeight = 1;
  comp.strokeAlign = 'INSIDE';
  comp.clipsContent = true;

  // Cross (+) visual — two rectangles forming a plus sign
  const cs = Math.max(Math.round(size * 0.5), 6);
  const cf = figma.createFrame();
  cf.name = 'cross'; cf.resize(cs, cs); cf.fills = []; cf.layoutMode = 'NONE';

  const hb = figma.createRectangle();
  hb.resize(cs, 2); hb.fills = [{ type: 'SOLID', color: hexRgb('#6E7A86') }];
  hb.cornerRadius = 1; hb.x = 0; hb.y = Math.round((cs - 2) / 2);

  const vb = figma.createRectangle();
  vb.resize(2, cs); vb.fills = [{ type: 'SOLID', color: hexRgb('#6E7A86') }];
  vb.cornerRadius = 1; vb.x = Math.round((cs - 2) / 2); vb.y = 0;

  cf.appendChild(hb); cf.appendChild(vb);
  comp.appendChild(cf);
  // cf is a non-autolayout child of an autolayout parent → use FIXED
  cf.layoutSizingHorizontal = 'FIXED';
  cf.layoutSizingVertical   = 'FIXED';

  return comp;
}

const iconVariants = [16, 20, 24].map(makeIconPlaceholder);
const iconSet = figma.combineAsVariants(iconVariants, dsPage);
iconSet.name = 'Icon/Placeholder';
```

---

## combineAsVariants: Layout Fix

`figma.combineAsVariants()` stacks all variants at position (0, 0). The
resulting COMPONENT_SET needs layout set manually:

```js
const set = figma.combineAsVariants(variants, page);
set.name = 'Button';

// Enable wrap layout so variants don't overlap or extend infinitely wide
set.layoutMode = 'HORIZONTAL';
set.layoutWrap = 'WRAP';

// IMPORTANT: primaryAxisSizingMode must be FIXED (not AUTO) for wrap to work.
// With AUTO, all variants stay in one infinite row regardless of layoutWrap.
set.primaryAxisSizingMode = 'FIXED';
set.resize(/* desired width */, set.height); // set a sensible fixed width

set.itemSpacing = 16;           // gap between variants horizontally
set.counterAxisSpacing = 16;    // gap between rows
set.paddingTop = set.paddingBottom = set.paddingLeft = set.paddingRight = 16;
set.counterAxisSizingMode = 'AUTO'; // height hugs the rows
```

---

## Replacing Child Nodes (icon slots)

When replacing an existing child (e.g., a rectangle) with an instance,
insert the new node at the same index BEFORE removing the old one:

```js
// ✅ Correct — preserves child order
const idx = [...comp.children].indexOf(rect);
const inst = iconComponent.createInstance();
inst.layoutSizingHorizontal = 'FIXED';
inst.layoutSizingVertical   = 'FIXED';
comp.insertChild(idx, inst);  // inst now at idx, rect shifts to idx+1
rect.remove();

// Process multiple replacements in REVERSE order to keep indices stable
for (let i = toReplace.length - 1; i >= 0; i--) {
  const { node, idx } = toReplace[i];
  // ... replace ...
}
```

---

## Color Token Reference for Buttons

| Button type + state | Background variable | Text variable | Border variable |
|---|---|---|---|
| Primary / Default | Navy/700 | Brand/White | — |
| Primary / Hover | Navy/500 | Brand/White | — |
| Primary / Active | Navy/900 | Brand/White | — |
| Secondary / Default | Brand/White | Navy/900 | Navy/700 |
| Secondary / Hover | Navy/100 | Navy/900 | Navy/900 |
| Ghost / Default | transparent | Navy/700 | Grey/300 |
| Ghost / Hover | Grey/100 | Navy/700 | Grey/300 |
| Destructive / Default | Status/Error/600 | Brand/White | — |
| Destructive / Hover | Status/Error/700 | Brand/White | — |
| Destructive / Active | Status/Error/800 | Brand/White | — |
| Any / Focus | default bg | default text | + focus ring effect |
| Any / Disabled | default bg at 40% opacity | default text at 40% opacity | — |

Status/Error/700 (`#B83C24`) was MISSING from the original token scale and
had to be added. Always check that hover/active states have a corresponding
primitive variable before referencing them in a component.

---

## Focus Ring

The WCAG-compliant focus ring is a double-ring drop shadow effect:

```js
const focusRing = [
  // Inner white gap — visible on any background
  {
    type: 'DROP_SHADOW',
    color: { r: 1, g: 1, b: 1, a: 1 },
    offset: { x: 0, y: 0 },
    radius: 0,
    spread: 2,
    visible: true,
    blendMode: 'NORMAL',
  },
  // Outer colored ring — aqua brand color
  {
    type: 'DROP_SHADOW',
    color: { r: 0.196, g: 0.796, b: 0.929, a: 0.85 }, // aqua #32CBED at 85%
    offset: { x: 0, y: 0 },
    radius: 1,
    spread: 4,
    visible: true,
    blendMode: 'NORMAL',
  },
];
comp.effects = focusRing;
```

---

## Semantic Variable Aliases

When semantic variables (Background, Foreground, Border collections) alias
primitive variables, they must be set as VARIABLE_ALIAS values, not direct
colors. Semantic variables need to exist in the correct collection with the
alias pointing to the current primitive variable ID.

```js
const primVar = findVar('Navy/700');
const semanticVar = findVar('Background/Primary'); // or create it

// Set semantic var to alias the primitive
const modeId = semanticCollection.defaultModeId;
semanticVar.setValueForMode(modeId, {
  type: 'VARIABLE_ALIAS',
  id: primVar.id,
});
```

If the primitive collection is ever deleted and recreated, ALL semantic
aliases break (they point to stale IDs). Fix: delete and rebuild the
semantic collection, looking up fresh IDs via `findVar()`.

---

## Pre-flight Checklist (run before building any component)

```js
// Verify everything needed is in place
const allVars = figma.variables.getLocalVariables();
const required = [
  'Brand/Navy', 'Brand/White', 'Navy/700', 'Navy/900', 'Navy/500', 'Navy/100',
  'Status/Error/600', 'Status/Error/700', 'Status/Error/800',
  'Grey/100', 'Grey/300',
  'Radius/MD', 'Spacing/2', 'Spacing/3', 'Spacing/5', 'Spacing/6',
];
const missing = required.filter(name => !allVars.find(v => v.name === name));

const textStyles = figma.getLocalTextStyles();
const requiredStyles = ['Button/SM', 'Button/MD', 'Button/LG', 'Body', 'Body SM'];
const missingStyles = requiredStyles.filter(
  name => !textStyles.find(s => s.name === name || s.name.endsWith('/' + name))
);

const iconSet = figma.root.findOne(n => n.type === 'COMPONENT_SET' && n.name === 'Icon/Placeholder');

return {
  variables: { total: allVars.length, missing },
  textStyles: { total: textStyles.length, missing: missingStyles },
  iconPlaceholder: iconSet ? 'found' : 'MISSING — build before buttons',
};
```

If anything is missing, build it before proceeding. Missing primitives →
buttons will have hardcoded colors. Missing text styles → button text will
have no style binding. Missing Icon/Placeholder → icon slots will use
raw rectangles that designers can't swap.
