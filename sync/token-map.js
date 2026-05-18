/**
 * token-map.js
 * Metanoia Design System — Figma ↔ CSS Token Bridge
 *
 * Maps every CSS custom property in colors_and_type.css to its
 * corresponding Figma variable name (Collection/Name format).
 *
 * Rules:
 * - CSS vars that are aliases (e.g. --bg-canvas: var(--color-white)) are
 *   resolved to their final hex value before comparison.
 * - Figma FLOAT variables (spacing, typography) are compared as numbers.
 * - rgba() values in CSS are converted to {r,g,b,a} for Figma comparison.
 * - CSS vars with no Figma counterpart are flagged as UNMAPPED.
 */

const TOKEN_MAP = [
  // ── Brand Colors ──────────────────────────────────────────────────────────
  { css: '--color-navy',       figma: 'Brand/Navy' },
  { css: '--color-aqua',       figma: 'Brand/Aqua' },
  { css: '--color-light-aqua', figma: 'Brand/Light Aqua' },
  { css: '--color-white',      figma: 'Brand/White' },
  { css: '--color-black',      figma: 'Brand/Black' },
  { css: '--color-grey',       figma: 'Brand/Grey' },
  { css: '--color-dark-grey',  figma: 'Brand/Dark Grey' },

  // ── Navy Scale ────────────────────────────────────────────────────────────
  { css: '--color-navy-900',   figma: 'Navy/900' },
  { css: '--color-navy-700',   figma: 'Navy/700' },
  { css: '--color-navy-500',   figma: 'Navy/500' },
  { css: '--color-navy-100',   figma: 'Navy/100' },

  // ── Aqua Scale ────────────────────────────────────────────────────────────
  { css: '--color-aqua-700',   figma: 'Aqua/700' },
  { css: '--color-aqua-500',   figma: 'Aqua/500' },
  { css: '--color-aqua-200',   figma: 'Aqua/200' },
  { css: '--color-aqua-50',    figma: 'Aqua/50' },

  // ── Grey Scale ────────────────────────────────────────────────────────────
  { css: '--color-grey-900',   figma: 'Grey/900' },
  { css: '--color-grey-800',   figma: 'Grey/800' },
  { css: '--color-grey-700',   figma: 'Grey/700' },
  { css: '--color-grey-600',   figma: 'Grey/600' },
  { css: '--color-grey-500',   figma: 'Grey/500' },
  { css: '--color-grey-400',   figma: 'Grey/400' },
  { css: '--color-grey-300',   figma: 'Grey/300' },
  { css: '--color-grey-200',   figma: 'Grey/200' },
  { css: '--color-grey-100',   figma: 'Grey/100' },
  { css: '--color-grey-50',    figma: 'Grey/50' },

  // ── Status ────────────────────────────────────────────────────────────────
  { css: '--color-success',    figma: 'Status/Success' },
  { css: '--color-warning',    figma: 'Status/Warning' },
  { css: '--color-error',      figma: 'Status/Error' },
  { css: '--color-info',       figma: 'Status/Info' },

  // ── Semantic Backgrounds ──────────────────────────────────────────────────
  { css: '--bg-canvas',        figma: 'Background/Canvas' },
  { css: '--bg-subtle',        figma: 'Background/Subtle' },
  { css: '--bg-muted',         figma: 'Background/Muted' },
  { css: '--bg-inverse',       figma: 'Background/Inverse' },
  { css: '--bg-inverse-deep',  figma: 'Background/Inverse Deep' },
  { css: '--bg-accent-soft',   figma: 'Background/Accent Soft' },
  { css: '--bg-accent',        figma: 'Background/Accent' },

  // ── Foreground / Text ─────────────────────────────────────────────────────
  { css: '--fg-1',             figma: 'Foreground/Primary' },
  { css: '--fg-2',             figma: 'Foreground/Body' },
  { css: '--fg-3',             figma: 'Foreground/Secondary' },
  { css: '--fg-4',             figma: 'Foreground/Tertiary' },
  { css: '--fg-on-dark',       figma: 'Foreground/On Dark' },
  { css: '--fg-on-dark-2',     figma: 'Foreground/On Dark 2' },
  { css: '--fg-on-dark-3',     figma: 'Foreground/On Dark 3' },
  { css: '--fg-link',          figma: 'Foreground/Link' },
  { css: '--fg-link-hover',    figma: 'Foreground/Link Hover' },
  { css: '--fg-accent',        figma: 'Foreground/Accent' },

  // ── Borders ───────────────────────────────────────────────────────────────
  { css: '--border-subtle',    figma: 'Border/Subtle' },
  { css: '--border-default',   figma: 'Border/Default' },
  { css: '--border-strong',    figma: 'Border/Strong' },
  { css: '--border-accent',    figma: 'Border/Accent' },
  { css: '--border-on-dark',   figma: 'Border/On Dark' },

  // ── Typography — Font Size ────────────────────────────────────────────────
  { css: '--fs-12',  figma: 'Font Size/12 Micro',    type: 'FLOAT', transform: remToPx },
  { css: '--fs-13',  figma: 'Font Size/13 Caption',  type: 'FLOAT', transform: remToPx },
  { css: '--fs-14',  figma: 'Font Size/14 Small',    type: 'FLOAT', transform: remToPx },
  { css: '--fs-15',  figma: 'Font Size/15',          type: 'FLOAT', transform: remToPx },
  { css: '--fs-16',  figma: 'Font Size/16 Body',     type: 'FLOAT', transform: remToPx },
  { css: '--fs-18',  figma: 'Font Size/18 Body LG',  type: 'FLOAT', transform: remToPx },
  { css: '--fs-20',  figma: 'Font Size/20',          type: 'FLOAT', transform: remToPx },
  { css: '--fs-22',  figma: 'Font Size/22',          type: 'FLOAT', transform: remToPx },
  { css: '--fs-24',  figma: 'Font Size/24 H4',       type: 'FLOAT', transform: remToPx },
  { css: '--fs-28',  figma: 'Font Size/28 H3',       type: 'FLOAT', transform: remToPx },
  { css: '--fs-32',  figma: 'Font Size/32',          type: 'FLOAT', transform: remToPx },
  { css: '--fs-36',  figma: 'Font Size/36 H2',       type: 'FLOAT', transform: remToPx },
  { css: '--fs-44',  figma: 'Font Size/44',          type: 'FLOAT', transform: remToPx },
  { css: '--fs-56',  figma: 'Font Size/56 H1',       type: 'FLOAT', transform: remToPx },
  { css: '--fs-72',  figma: 'Font Size/72 Display',  type: 'FLOAT', transform: remToPx },
  { css: '--fs-96',  figma: 'Font Size/96 Hero',     type: 'FLOAT', transform: remToPx },

  // ── Typography — Font Weight ──────────────────────────────────────────────
  { css: '--fw-light',    figma: 'Font Weight/300 Light',    type: 'FLOAT' },
  { css: '--fw-regular',  figma: 'Font Weight/400 Regular',  type: 'FLOAT' },
  { css: '--fw-medium',   figma: 'Font Weight/500 Medium',   type: 'FLOAT' },
  { css: '--fw-semibold', figma: 'Font Weight/600 Semibold', type: 'FLOAT' },
  { css: '--fw-bold',     figma: 'Font Weight/700 Bold',     type: 'FLOAT' },

  // ── Spacing ───────────────────────────────────────────────────────────────
  { css: '--space-0',  figma: 'Spacing/0',  type: 'FLOAT', transform: pxToNum },
  { css: '--space-1',  figma: 'Spacing/1',  type: 'FLOAT', transform: pxToNum },
  { css: '--space-2',  figma: 'Spacing/2',  type: 'FLOAT', transform: pxToNum },
  { css: '--space-3',  figma: 'Spacing/3',  type: 'FLOAT', transform: pxToNum },
  { css: '--space-4',  figma: 'Spacing/4',  type: 'FLOAT', transform: pxToNum },
  { css: '--space-5',  figma: 'Spacing/5',  type: 'FLOAT', transform: pxToNum },
  { css: '--space-6',  figma: 'Spacing/6',  type: 'FLOAT', transform: pxToNum },
  { css: '--space-8',  figma: 'Spacing/8',  type: 'FLOAT', transform: pxToNum },
  { css: '--space-10', figma: 'Spacing/10', type: 'FLOAT', transform: pxToNum },
  { css: '--space-12', figma: 'Spacing/12', type: 'FLOAT', transform: pxToNum },
  { css: '--space-16', figma: 'Spacing/16', type: 'FLOAT', transform: pxToNum },
  { css: '--space-20', figma: 'Spacing/20', type: 'FLOAT', transform: pxToNum },
  { css: '--space-24', figma: 'Spacing/24', type: 'FLOAT', transform: pxToNum },
  { css: '--space-32', figma: 'Spacing/32', type: 'FLOAT', transform: pxToNum },

  // ── Radius ────────────────────────────────────────────────────────────────
  { css: '--radius-xs',   figma: 'Radius/XS',   type: 'FLOAT', transform: pxToNum },
  { css: '--radius-sm',   figma: 'Radius/SM',   type: 'FLOAT', transform: pxToNum },
  { css: '--radius-md',   figma: 'Radius/MD',   type: 'FLOAT', transform: pxToNum },
  { css: '--radius-lg',   figma: 'Radius/LG',   type: 'FLOAT', transform: pxToNum },
  { css: '--radius-xl',   figma: 'Radius/XL',   type: 'FLOAT', transform: pxToNum },
  { css: '--radius-2xl',  figma: 'Radius/2XL',  type: 'FLOAT', transform: pxToNum },
  { css: '--radius-pill', figma: 'Radius/Pill', type: 'FLOAT', transform: pxToNum },
];

// ── Transform helpers ─────────────────────────────────────────────────────────
function remToPx(val) {
  // '1.5rem' → 24  (assumes 16px root)
  return parseFloat(val) * 16;
}
function pxToNum(val) {
  // '8px' → 8
  return parseFloat(val);
}

module.exports = { TOKEN_MAP, remToPx, pxToNum };
