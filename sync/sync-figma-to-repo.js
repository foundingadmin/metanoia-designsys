#!/usr/bin/env node
/**
 * sync-figma-to-repo.js
 * Metanoia Design System — Figma → CSS sync
 *
 * Reads live variable values from the Figma file via MCP, diffs them
 * against colors_and_type.css, writes changes, bumps the version,
 * commits to a branch, and opens a PR.
 *
 * Usage (from repo root, with Claude Code + Figma MCP):
 *   Trigger by saying: "sync Figma → repo" or "run figma-to-repo sync"
 *
 * Claude Code will:
 *   1. Call the Figma MCP to read all variable values
 *   2. Run this script's diff logic
 *   3. Write the updated CSS
 *   4. Commit + push branch + open PR via GitHub CLI
 *
 * Prerequisites:
 *   - Figma MCP connected in Claude Code config
 *   - `gh` CLI authenticated (gh auth login)
 *   - Repo cloned locally
 */

const fs   = require('fs');
const path = require('path');

// ── Config ────────────────────────────────────────────────────────────────────
const CSS_FILE    = path.resolve(__dirname, '../colors_and_type.css');
const FIGMA_FILE  = 'c3ayt4AFrNKOmSkGBIyFi4';
const BRANCH_PREFIX = 'sync/figma-to-css';

// ── Utilities ─────────────────────────────────────────────────────────────────

/**
 * Convert a Figma COLOR value {r,g,b,a} (0–1 floats) to hex or rgba string.
 * Matches the format used in colors_and_type.css.
 */
function figmaColorToCss(color) {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = color.a ?? 1;

  if (Math.abs(a - 1) < 0.005) {
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`.toUpperCase();
  }
  // Semi-transparent — format as rgba() with 2 decimal places
  return `rgba(${r},${g},${b},${parseFloat(a.toFixed(2))})`;
}

/**
 * Parse all CSS custom properties from a :root block.
 * Returns { '--var-name': 'value' }
 */
function parseCssVars(cssText) {
  const vars = {};
  const re = /--([a-z0-9-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(cssText)) !== null) {
    vars[`--${m[1]}`] = m[2].trim();
  }
  return vars;
}

/**
 * Resolve a CSS value that may be a var() alias.
 * e.g. 'var(--color-navy)' → '#094B77'
 */
function resolveCssAlias(value, allVars) {
  const varRef = value.match(/^var\((--[a-z0-9-]+)\)$/);
  if (varRef) return allVars[varRef[1]] ?? value;
  return value;
}

/**
 * Normalise a hex color to uppercase 6-char for comparison.
 */
function normaliseHex(hex) {
  return hex.toUpperCase().replace(/^#/, '').padStart(6, '0');
}

// ── Main diff function (called by Claude Code after fetching Figma vars) ──────

/**
 * figmaVars: array of { name: 'Brand/Navy', resolvedType: 'COLOR'|'FLOAT', value: ... }
 *   value for COLOR is { r, g, b, a } (0–1)
 *   value for FLOAT is a number
 *
 * Returns { changes: [...], cssUpdated: string }
 */
function diffAndPatch(figmaVars, tokenMap, cssText) {
  const cssVars  = parseCssVars(cssText);
  const changes  = [];

  // Build a lookup from Figma name → value
  const figmaByName = {};
  for (const v of figmaVars) figmaByName[v.name] = v;

  let updatedCss = cssText;

  for (const mapping of tokenMap) {
    const figmaVar = figmaByName[mapping.figma];
    if (!figmaVar) {
      // Variable exists in map but not in Figma — flag it
      changes.push({ css: mapping.css, figma: mapping.figma, status: 'FIGMA_MISSING' });
      continue;
    }

    const cssRaw = cssVars[mapping.css];
    if (cssRaw === undefined) {
      changes.push({ css: mapping.css, figma: mapping.figma, status: 'CSS_MISSING' });
      continue;
    }

    if (figmaVar.resolvedType === 'COLOR') {
      const figmaHex = figmaColorToCss(figmaVar.value);
      const cssResolved = resolveCssAlias(cssRaw, cssVars);

      // Normalize both for comparison
      const figmaIsRgba = figmaHex.startsWith('rgba');
      const cssIsRgba   = cssResolved.startsWith('rgba');

      let isDifferent = false;
      if (!figmaIsRgba && !cssIsRgba) {
        isDifferent = normaliseHex(figmaHex) !== normaliseHex(cssResolved.replace(/^#/, '').split(';')[0]);
      } else {
        // For rgba, do string comparison after normalizing spaces
        isDifferent = figmaHex.replace(/\s/g,'') !== cssResolved.replace(/\s/g,'');
      }

      if (isDifferent) {
        changes.push({
          css: mapping.css,
          figma: mapping.figma,
          status: 'CHANGED',
          from: cssResolved,
          to: figmaHex,
        });
        // Patch the CSS — replace the value on the correct line
        const re = new RegExp(`(${escapeRegex(mapping.css)}\\s*:\\s*)([^;]+)(;)`, 'g');
        updatedCss = updatedCss.replace(re, (_, prop, _val, semi) => `${prop}${figmaHex}${semi}`);
      }

    } else if (figmaVar.resolvedType === 'FLOAT') {
      // Convert CSS value using the mapping's transform function, compare as number
      const transform = mapping.transform ?? (v => parseFloat(v));
      const cssNum    = transform(resolveCssAlias(cssRaw, cssVars));
      const figmaNum  = figmaVar.value;

      if (Math.abs(cssNum - figmaNum) > 0.01) {
        // Determine the CSS output format from the current value
        const isRem = cssRaw.includes('rem');
        const isPx  = cssRaw.includes('px');
        let newVal;
        if (isRem)      newVal = `${(figmaNum / 16).toFixed(4).replace(/\.?0+$/, '')}rem`;
        else if (isPx)  newVal = `${figmaNum}px`;
        else            newVal = String(figmaNum);

        changes.push({
          css: mapping.css,
          figma: mapping.figma,
          status: 'CHANGED',
          from: cssRaw,
          to: newVal,
        });
        const re = new RegExp(`(${escapeRegex(mapping.css)}\\s*:\\s*)([^;]+)(;)`, 'g');
        updatedCss = updatedCss.replace(re, (_, prop, _val, semi) => `${prop}${newVal}${semi}`);
      }
    }
  }

  return { changes, cssUpdated: updatedCss };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ── Version bump helper ───────────────────────────────────────────────────────

/**
 * Determine semver bump type from the changes array.
 * Token renames = MAJOR, value changes = PATCH.
 */
function bumpType(changes) {
  const hasRename = changes.some(c => c.status === 'CSS_MISSING' || c.status === 'FIGMA_MISSING');
  return hasRename ? 'MAJOR' : 'PATCH';
}

// ── Entry point for Claude Code to call ──────────────────────────────────────

/**
 * Claude Code calls this after fetching figmaVars via Figma MCP.
 *
 * Steps:
 * 1. Run diff
 * 2. If no changes → report and exit
 * 3. Write updated CSS
 * 4. Shell out: git checkout -b, git add, git commit, git push, gh pr create
 */
async function run(figmaVars, tokenMap) {
  const cssText = fs.readFileSync(CSS_FILE, 'utf8');
  const { changes, cssUpdated } = diffAndPatch(figmaVars, tokenMap, cssText);

  const realChanges = changes.filter(c => c.status === 'CHANGED');
  const warnings    = changes.filter(c => c.status !== 'CHANGED');

  // ── Report ──────────────────────────────────────────────────────────────────
  console.log('\n── Metanoia DS: Figma → CSS Sync ──────────────────────────────');
  if (realChanges.length === 0) {
    console.log('✓ No token differences found. CSS is in sync with Figma.');
    if (warnings.length) {
      console.log('\nWarnings (mapping gaps):');
      warnings.forEach(w => console.log(`  ${w.status}: ${w.css} ↔ ${w.figma}`));
    }
    return;
  }

  console.log(`\n${realChanges.length} token(s) changed:\n`);
  realChanges.forEach(c => {
    console.log(`  ${c.css}`);
    console.log(`    Figma: ${c.figma}`);
    console.log(`    ${c.from}  →  ${c.to}\n`);
  });

  if (warnings.length) {
    console.log(`\n${warnings.length} mapping warning(s):`);
    warnings.forEach(w => console.log(`  ${w.status}: ${w.css} ↔ ${w.figma}`));
  }

  // ── Write CSS ───────────────────────────────────────────────────────────────
  fs.writeFileSync(CSS_FILE, cssUpdated, 'utf8');
  console.log('\n✓ colors_and_type.css updated.');

  // ── Git + PR ────────────────────────────────────────────────────────────────
  const date   = new Date().toISOString().slice(0, 10);
  const branch = `${BRANCH_PREFIX}-${date}`;
  const bump   = bumpType(realChanges);
  const summary = realChanges.length === 1
    ? `update ${realChanges[0].css}`
    : `update ${realChanges.length} tokens`;

  const prBody = [
    '## Figma → CSS Token Sync',
    '',
    `Automated sync from Figma design system (file \`${FIGMA_FILE}\`).`,
    '',
    '### Changed tokens',
    ...realChanges.map(c => `- \`${c.css}\`: \`${c.from}\` → \`${c.to}\``),
    '',
    warnings.length ? `### Mapping warnings\n${warnings.map(w=>`- ${w.status}: \`${w.css}\` ↔ \`${w.figma}\``).join('\n')}` : '',
    '',
    '---',
    '_Generated by Claude Code · Metanoia DS sync script_',
  ].join('\n');

  const commitMsg = `${bump === 'MAJOR' ? 'feat' : 'fix'}: figma→css sync — ${summary}`;

  // Claude Code executes these shell commands
  const cmds = [
    `git checkout -b ${branch}`,
    `git add colors_and_type.css`,
    `git commit -m "${commitMsg}"`,
    `git push -u origin ${branch}`,
    `gh pr create --title "DS Sync: ${summary}" --body '${prBody.replace(/'/g, "\\'")}' --base main --head ${branch}`,
  ];

  console.log('\n── Git commands to run ─────────────────────────────────────────');
  cmds.forEach(cmd => console.log(`  $ ${cmd}`));
  console.log('\nReturn { branch, commitMsg, prBody, changes } for Claude Code to execute.');

  return { branch, commitMsg, prBody, changes: realChanges, warnings, bump };
}

module.exports = { run, diffAndPatch, figmaColorToCss, parseCssVars, bumpType };
