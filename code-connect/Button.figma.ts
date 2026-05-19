import figma, { html } from "@figma/code-connect";

/**
 * Button — maps Figma variants to HTML class-based API.
 *
 * Figma file:  https://www.figma.com/design/c3ayt4AFrNKOmSkGBIyFi4
 * Component:   Button (node 91:489)
 *
 * Usage:
 *   <button class="btn primary">Label</button>
 *   <button class="btn secondary lg">Label</button>
 *   <button class="btn ghost sm"><i data-lucide="arrow-left"></i> Back</button>
 *
 * CSS classes:
 *   Type   → primary | secondary | ghost | danger
 *   Size   → (none=MD) | sm | lg
 *   State  → :hover :active :focus-visible :disabled (CSS-only, no class needed)
 *
 * Requires:
 *   <link rel="stylesheet" href="colors_and_type.css">
 *   <script src="https://unpkg.com/lucide@latest"></script>
 *   <script>lucide.createIcons();</script>
 */

// ── Icon=None ───────────────────────────────────────────────────────────────
figma.connect(
  "https://www.figma.com/design/c3ayt4AFrNKOmSkGBIyFi4?node-id=91-489",
  {
    variant: { Icon: "None" },
    props: {
      buttonType: figma.enum("Type", {
        Primary: "primary",
        Secondary: "secondary",
        Ghost: "ghost",
        Destructive: "danger",
      }),
      // Leading space so `${type}${size}` composes cleanly without a gap for MD
      size: figma.enum("Size", {
        SM: " sm",
        MD: "",
        LG: " lg",
      }),
    },
    example: ({ buttonType, size }) =>
      html`<button class="btn ${buttonType}${size}">Label</button>`,
  }
);

// ── Icon=Leading ────────────────────────────────────────────────────────────
figma.connect(
  "https://www.figma.com/design/c3ayt4AFrNKOmSkGBIyFi4?node-id=91-489",
  {
    variant: { Icon: "Leading" },
    props: {
      buttonType: figma.enum("Type", {
        Primary: "primary",
        Secondary: "secondary",
        Ghost: "ghost",
        Destructive: "danger",
      }),
      size: figma.enum("Size", {
        SM: " sm",
        MD: "",
        LG: " lg",
      }),
    },
    example: ({ buttonType, size }) =>
      html`<button class="btn ${buttonType}${size}">
  <i data-lucide="arrow-right"></i>
  Label
</button>`,
  }
);

// ── Icon=Trailing ───────────────────────────────────────────────────────────
figma.connect(
  "https://www.figma.com/design/c3ayt4AFrNKOmSkGBIyFi4?node-id=91-489",
  {
    variant: { Icon: "Trailing" },
    props: {
      buttonType: figma.enum("Type", {
        Primary: "primary",
        Secondary: "secondary",
        Ghost: "ghost",
        Destructive: "danger",
      }),
      size: figma.enum("Size", {
        SM: " sm",
        MD: "",
        LG: " lg",
      }),
    },
    example: ({ buttonType, size }) =>
      html`<button class="btn ${buttonType}${size}">
  Label
  <i data-lucide="arrow-right"></i>
</button>`,
  }
);
