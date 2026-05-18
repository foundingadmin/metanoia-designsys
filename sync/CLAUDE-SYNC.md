# DS Sync — Claude Code Instructions

This section extends the main CLAUDE.md with instructions for running
design token syncs between `colors_and_type.css` and the Figma file.

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
git add colors_and_type.css
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

When a new CSS var is added to `colors_and_type.css`, it also needs:
1. A corresponding Figma variable created in the correct collection
2. A new entry in `sync/token-map.js`

Claude Code can handle all three steps when asked:
"Add a new token --color-coral: #FF6B6B to the design system"

---

## Warnings to watch for

| Warning | Meaning | Action |
|---|---|---|
| `CSS_MISSING` | Token in map but not in CSS | Add to CSS or remove from map |
| `FIGMA_MISSING` | Token in map but not in Figma | Create variable in Figma or remove from map |
| `NOT_A_COLOR` | CSS value isn't a parseable color | Check for var() alias chain or non-color token |
