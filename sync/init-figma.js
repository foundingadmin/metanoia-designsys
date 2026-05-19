#!/usr/bin/env node
/**
 * sync/init-figma.js
 * Metanoia Design System — Bootstrap Figma variable collections.
 *
 * Reads CSS tokens and generates three Figma plugin scripts to run
 * (in order) via the Figma MCP `use_figma` tool:
 *
 *   Script 1 — Primitives collection   (~49 COLOR variables, direct hex values)
 *   Script 2 — Semantic collection     (16 COLOR variables, Light + Dark modes, aliases)
 *   Script 3 — Typography + Spacing + Motion collections (~85 FLOAT + STRING variables)
 *
 * White-labeled: update CONFIG at the top to reuse in another repo.
 * Reuses: parseCssVars, resolveAll, cssColorToFigma  from sync-repo-to-figma.js
 *         TOKEN_MAP, remToPx, pxToNum, emToNum, msToNum  from token-map.js
 *
 * Usage:
 *   node sync/init-figma.js              → print all 3 scripts to stdout
 *   node sync/init-figma.js --script 2   → print only Script 2
 *   node sync/init-figma.js --save       → write to sync/.init-scripts/
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { TOKEN_MAP }                                 = require('./token-map.js');
const { parseCssVars, cssColorToFigma, resolveAll } = require('./sync-repo-to-figma.js');

// ── BRAND CONFIG ─────────────────────────────────────────────────────────────
// To use in a different repo:
//   1. Point tokenDir to your tokens/ directory
//   2. Update collections to map Figma collection names → CSS filenames
//   3. Ensure TOKEN_MAP in token-map.js uses matching CSS var names + Figma paths
// ─────────────────────────────────────────────────────────────────────────────
const CONFIG = {
  tokenDir: path.resolve(__dirname, '../tokens'),
  collections: {
    Primitives: 'color-primitives.css',
    Semantic:   'color-semantic.css',
    Typography: 'typography.css',
    Spacing:    'spacing.css',
    Motion:     'motion.css',
  },
  // Semantic collection has two modes; all others get a single 'Value' mode.
  semanticModes: ['Light', 'Dark'],
  // CSS selector → mode name. Each key must be a literal CSS selector block.
  semanticSelectors: {
    Light: ':root',
    Dark:  '[data-theme="dark"]',
  },
};
// ─────────────────────────────────────────────────────────────────────────────

function readTokenFile(filename) {
  return fs.readFileSync(path.join(CONFIG.tokenDir, filename), 'utf8');
}

// Extract vars defined inside a specific selector block (non-nested).
function parseCssBlock(cssText, selector) {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Match selector + whitespace + { content } (stops at first closing brace)
  const m = new RegExp(esc + '\\s*\\{([^}]+)\\}').exec(cssText);
  return m ? parseCssVars(m[1]) : {};
}

// Build: CSS primitive var name  →  Figma variable name (e.g. '--color-white' → 'Brand/White')
function buildPrimLookup() {
  const primCss      = readTokenFile('color-primitives.css');
  const primVarNames = new Set(Object.keys(parseCssVars(primCss)));
  const lookup       = {};
  for (const entry of TOKEN_MAP) {
    if (primVarNames.has(entry.css)) lookup[entry.css] = entry.figma;
  }
  return lookup;
}

// ── Script 1: Primitives collection ──────────────────────────────────────────

function buildScript1() {
  const primCss      = readTokenFile('color-primitives.css');
  const primVars     = parseCssVars(primCss);
  const primVarNames = new Set(Object.keys(primVars));
  const entries      = TOKEN_MAP.filter(e => primVarNames.has(e.css));

  const lines = [
    '// ── Script 1: Create Primitives collection ──────────────────────────────────',
    `// ${entries.length} COLOR variables — raw hex/rgba values from color-primitives.css`,
    '// Run this first. Scripts 2 depends on these variables existing.',
    '',
    "const col  = figma.variables.createVariableCollection('Primitives');",
    'const mode = col.modes[0].modeId;',
    "col.renameMode(mode, 'Value');",
    'const created = {};',
    '',
    'function mk(name, r, g, b, a) {',
    "  const v = figma.variables.createVariable(name, col, 'COLOR');",
    '  v.setValueForMode(mode, {r, g, b, a});',
    '  created[name] = v;',
    '}',
    '',
  ];

  for (const entry of entries) {
    const rawVal = primVars[entry.css];
    const rgba   = cssColorToFigma(rawVal);
    if (!rgba) {
      lines.push(`// SKIP ${entry.css} = ${rawVal} (not a parseable color)`);
      continue;
    }
    const { r, g, b, a } = rgba;
    lines.push(
      `mk(${JSON.stringify(entry.figma)}, ${r.toFixed(4)}, ${g.toFixed(4)}, ${b.toFixed(4)}, ${a.toFixed(4)});`
    );
  }

  lines.push(
    '',
    "figma.notify('✓ Primitives: ' + Object.keys(created).length + ' variables created');"
  );
  return lines.join('\n');
}

// ── Script 2: Semantic collection (Light + Dark modes, aliases) ───────────────

function buildScript2() {
  const semCss   = readTokenFile('color-semantic.css');
  const lightVars = parseCssBlock(semCss, CONFIG.semanticSelectors.Light);
  const darkVars  = parseCssBlock(semCss, CONFIG.semanticSelectors.Dark);
  const primLookup = buildPrimLookup();

  const semEntries = TOKEN_MAP.filter(e =>
    e.figma.startsWith('Background/') ||
    e.figma.startsWith('Foreground/') ||
    e.figma.startsWith('Border/')
  );

  // Resolve a CSS value to {type:'ALIAS', figmaName} or {type:'COLOR', color}
  function resolve(cssValue) {
    if (!cssValue) return null;
    const ref = cssValue.match(/^var\((--[a-z0-9-]+)\)$/);
    if (ref) {
      const figmaName = primLookup[ref[1]];
      return figmaName ? { type: 'ALIAS', figmaName } : null;
    }
    const color = cssColorToFigma(cssValue);
    return color ? { type: 'COLOR', color } : null;
  }

  const lines = [
    '// ── Script 2: Create Semantic collection (Light + Dark modes) ───────────────',
    `// ${semEntries.length} COLOR variables — aliases to Primitives collection variables`,
    '// Run AFTER Script 1 (requires Primitives variables to exist).',
    '',
    'const allVars  = figma.variables.getLocalVariables();',
    'function getPrim(name) { return allVars.find(v => v.name === name); }',
    '',
    "const col       = figma.variables.createVariableCollection('Semantic');",
    'const lightMode = col.modes[0].modeId;',
    "col.renameMode(lightMode, 'Light');",
    "const darkMode  = col.addMode('Dark');",
    'const created   = {};',
    '',
  ];

  for (const entry of semEntries) {
    const lightVal = resolve(lightVars[entry.css]);
    const darkVal  = resolve(darkVars[entry.css]);

    lines.push(`{`);
    lines.push(`  const v = figma.variables.createVariable(${JSON.stringify(entry.figma)}, col, 'COLOR');`);

    if (lightVal) {
      if (lightVal.type === 'ALIAS') {
        lines.push(`  { const p = getPrim(${JSON.stringify(lightVal.figmaName)}); if (p) v.setValueForMode(lightMode, {type:'VARIABLE_ALIAS', id:p.id}); }`);
      } else {
        const { r, g, b, a } = lightVal.color;
        lines.push(`  v.setValueForMode(lightMode, {r:${r.toFixed(4)},g:${g.toFixed(4)},b:${b.toFixed(4)},a:${a.toFixed(4)}});`);
      }
    }

    if (darkVal) {
      if (darkVal.type === 'ALIAS') {
        lines.push(`  { const p = getPrim(${JSON.stringify(darkVal.figmaName)}); if (p) v.setValueForMode(darkMode, {type:'VARIABLE_ALIAS', id:p.id}); }`);
      } else {
        const { r, g, b, a } = darkVal.color;
        lines.push(`  v.setValueForMode(darkMode, {r:${r.toFixed(4)},g:${g.toFixed(4)},b:${b.toFixed(4)},a:${a.toFixed(4)}});`);
      }
    }

    lines.push(`  created[${JSON.stringify(entry.figma)}] = v;`);
    lines.push(`}`);
  }

  lines.push(
    '',
    "figma.notify('✓ Semantic: ' + Object.keys(created).length + ' variables, 2 modes (Light + Dark)');"
  );
  return lines.join('\n');
}

// ── Script 3: Typography, Spacing, Motion collections ────────────────────────

function buildScript3() {
  const cssFiles = {
    Typography: readTokenFile('typography.css'),
    Spacing:    readTokenFile('spacing.css'),
    Motion:     readTokenFile('motion.css'),
  };

  // Merge all non-semantic vars into one lookup
  const allVars = {};
  for (const css of Object.values(cssFiles)) {
    Object.assign(allVars, parseCssVars(css));
  }

  // Figma variable path prefix → collection name
  const prefixToCollection = {
    'Font Size':      'Typography',
    'Font Weight':    'Typography',
    'Line Height':    'Typography',
    'Letter Spacing': 'Typography',
    'Spacing':        'Spacing',
    'Radius':         'Spacing',
    'Shadow':         'Spacing',
    'Layout':         'Spacing',
    'Motion':         'Motion',
  };

  // Group TOKEN_MAP entries by collection
  const groups = { Typography: [], Spacing: [], Motion: [] };
  for (const entry of TOKEN_MAP) {
    const prefix = entry.figma.split('/')[0];
    const col    = prefixToCollection[prefix];
    if (col) groups[col].push(entry);
  }

  const lines = [
    '// ── Script 3: Create Typography, Spacing, Motion collections ────────────────',
    '// FLOAT + STRING variables from typography.css, spacing.css, motion.css',
    '// Run AFTER Script 2 (collections are independent; order within this script matters).',
    '',
  ];

  for (const [colName, entries] of Object.entries(groups)) {
    lines.push(`// ── ${colName} ─────────────────────────────────────────────────────────────────`);
    lines.push(`{`);
    lines.push(`  const col  = figma.variables.createVariableCollection(${JSON.stringify(colName)});`);
    lines.push(`  const mode = col.modes[0].modeId;`);
    lines.push(`  col.renameMode(mode, 'Value');`);
    lines.push(`  let n = 0;`);

    for (const entry of entries) {
      const rawVal = allVars[entry.css];
      if (rawVal === undefined) {
        lines.push(`  // SKIP ${entry.css} — not found in CSS`);
        continue;
      }

      if (entry.type === 'STRING') {
        lines.push(
          `  { const v = figma.variables.createVariable(${JSON.stringify(entry.figma)}, col, 'STRING');` +
          ` v.setValueForMode(mode, ${JSON.stringify(rawVal)}); n++; }`
        );
      } else {
        // FLOAT — apply transform (or parseFloat as default)
        const transform = entry.transform ?? parseFloat;
        const num       = transform(rawVal);
        if (isNaN(num)) {
          lines.push(`  // SKIP ${entry.css} = ${rawVal} (transform returned NaN)`);
          continue;
        }
        lines.push(
          `  { const v = figma.variables.createVariable(${JSON.stringify(entry.figma)}, col, 'FLOAT');` +
          ` v.setValueForMode(mode, ${num}); n++; }`
        );
      }
    }

    lines.push(`  figma.notify('✓ ${colName}: ' + n + ' variables created');`);
    lines.push(`}`);
    lines.push('');
  }

  return lines.join('\n');
}

// ── CLI entry ─────────────────────────────────────────────────────────────────

const args       = process.argv.slice(2);
const scriptFlag = args.includes('--script') ? parseInt(args[args.indexOf('--script') + 1]) : null;
const saveFlag   = args.includes('--save');

const scripts = {
  1: buildScript1,
  2: buildScript2,
  3: buildScript3,
};

if (saveFlag) {
  const outDir = path.join(__dirname, '.init-scripts');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  for (const [n, fn] of Object.entries(scripts)) {
    const outFile = path.join(outDir, `script${n}.js`);
    fs.writeFileSync(outFile, fn());
    console.log(`Wrote ${outFile}`);
  }
} else if (scriptFlag) {
  const fn = scripts[scriptFlag];
  if (!fn) { console.error(`Unknown script: ${scriptFlag}. Use 1, 2, or 3.`); process.exit(1); }
  console.log(fn());
} else {
  for (const [n, fn] of Object.entries(scripts)) {
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`Script ${n}:`);
    console.log('─'.repeat(80));
    console.log(fn());
  }
}
