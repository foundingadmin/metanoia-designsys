import figma, { html } from "@figma/code-connect";

/**
 * Icon Placeholder — maps Figma size variants to Lucide icon usage.
 *
 * Figma file:  https://www.figma.com/design/c3ayt4AFrNKOmSkGBIyFi4
 * Component:   Icon Placeholder (node 97:23)
 *
 * Usage:
 *   <i data-lucide="circle" class="icon-16"></i>
 *   <i data-lucide="circle" class="icon-20"></i>
 *   <i data-lucide="circle" class="icon-24"></i>
 *
 * Requires:
 *   <script src="https://unpkg.com/lucide@latest"></script>
 *   <script>lucide.createIcons();</script>
 *
 * All icons use 2px stroke width and currentColor fill per design rules.
 * Replace "circle" with any Lucide icon name: https://lucide.dev/icons
 */

figma.connect(
  "https://www.figma.com/design/c3ayt4AFrNKOmSkGBIyFi4?node-id=97-23",
  {
    props: {
      size: figma.enum("Size", {
        "16": "16",
        "20": "20",
        "24": "24",
      }),
    },

    example: ({ size }) =>
      html`<i
  data-lucide="circle"
  class="icon-${size}"
  style="width:${size}px;height:${size}px;stroke-width:2"
></i>`,
  }
);
