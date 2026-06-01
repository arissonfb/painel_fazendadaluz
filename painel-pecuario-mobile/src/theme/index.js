export const colors = {
  primary: "#375b43",
  primaryLight: "#4a7558",
  primaryDark: "#243d2c",
  primaryFaded: "#e8f0ea",

  accent: "#c98c4f",
  accentLight: "#e0aa6e",
  accentFaded: "#faf2e8",

  blue: "#5b8db8",
  blueFaded: "#e8f0f8",

  danger: "#8c4b38",
  dangerLight: "#b05e49",
  dangerFaded: "#faeae7",

  success: "#375b43",
  successFaded: "#e8f0ea",

  background: "#f2f5f2",
  card: "#ffffff",
  surface: "#f9fbf9",

  text: "#1a2e1f",
  textSecondary: "#56705c",
  textLight: "#8fa494",
  textInverse: "#ffffff",

  border: "#dae6dd",
  divider: "#eaf2eb",

  overlay: "rgba(26,46,31,0.55)",
  shadow: "rgba(26,46,31,0.12)",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: "700", color: colors.text, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: "700", color: colors.text, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: "600", color: colors.text },
  h4: { fontSize: 15, fontWeight: "600", color: colors.text },
  body: { fontSize: 15, fontWeight: "400", color: colors.text },
  bodySmall: { fontSize: 13, fontWeight: "400", color: colors.textSecondary },
  caption: { fontSize: 11, fontWeight: "500", color: colors.textLight, letterSpacing: 0.5 },
  label: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, letterSpacing: 0.3 },
  number: { fontSize: 26, fontWeight: "700", color: colors.text },
  numberLg: { fontSize: 32, fontWeight: "800", color: colors.text },
};

export const shadow = {
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
};
