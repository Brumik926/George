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
    text: '#12213a',
    tint: '#2368e8',

    // Core surfaces
    background: '#f5f8ff',
    foreground: '#12213a',

    // Cards / elevated surfaces
    card: '#ffffff',
    cardForeground: '#12213a',

    // Primary action color (buttons, links, active states)
    primary: '#2368e8',
    primaryForeground: '#ffffff',
    heroStart: '#b80063',
    heroEnd: '#ed087e',
    heroGlass: '#ffffff2b',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#eaf1ff',
    secondaryForeground: '#173e83',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#edf2fb',
    mutedForeground: '#6c7b96',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#dce9ff',
    accentForeground: '#173e83',

    // Destructive actions (delete, error states)
    destructive: '#c93e57',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#dce5f3',
    input: '#d2dff4',

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
