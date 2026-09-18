/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#f7f7fb',
    tint: '#3b8fff',

    // Core surfaces
    background: '#111015',
    foreground: '#f7f7fb',

    // Cards / elevated surfaces
    card: '#1f1f27',
    cardForeground: '#f7f7fb',

    // Primary action color (buttons, links, active states)
    primary: '#3b8fff',
    primaryForeground: '#ffffff',
    heroStart: '#bf0058',
    heroEnd: '#76003c',
    heroGlass: '#ffffff20',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#1b1b23',
    secondaryForeground: '#f7f7fb',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#1b1b23',
    mutedForeground: '#aaa8b4',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#2b2b36',
    accentForeground: '#f7f7fb',

    // Destructive actions (delete, error states)
    destructive: '#ff7187',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#30303a',
    input: '#3a3a46',

    // Transaction detail surface (kept dark to match the payment reference)
    detailBackground: '#111015',
    detailCard: '#1f1f27',
    detailSurface: '#1b1b23',
    detailBorder: '#30303a',
    detailForeground: '#f7f7fb',
    detailMutedForeground: '#aaa8b4',
    detailAccent: '#3b8fff',
    detailHeroStart: '#bf0058',
    detailHeroEnd: '#76003c',
    detailHeroGlass: '#ffffff20',
  },
  dark: {
    text: '#f5f8ff',
    tint: '#63a1ff',
    background: '#0c1220',
    foreground: '#f5f8ff',
    card: '#151e30',
    cardForeground: '#f5f8ff',
    primary: '#63a1ff',
    primaryForeground: '#071021',
    heroStart: '#780040',
    heroEnd: '#b90060',
    heroGlass: '#ffffff26',
    secondary: '#192944',
    secondaryForeground: '#d9e8ff',
    muted: '#1b263a',
    mutedForeground: '#9cafc9',
    accent: '#203b67',
    accentForeground: '#d9e8ff',
    destructive: '#ff7288',
    destructiveForeground: '#210912',
    border: '#273751',
    input: '#304466',

    detailBackground: '#111015',
    detailCard: '#1f1f27',
    detailSurface: '#1b1b23',
    detailBorder: '#30303a',
    detailForeground: '#f7f7fb',
    detailMutedForeground: '#aaa8b4',
    detailAccent: '#3b8fff',
    detailHeroStart: '#bf0058',
    detailHeroEnd: '#76003c',
    detailHeroGlass: '#ffffff20',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 16,
};

export default colors;
