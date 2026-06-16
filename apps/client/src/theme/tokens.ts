export const colors = {
  accent: "#d97757",
  background: "#faf9f5",
  border: "#e8e6dc",
  canvas: "#ffffff",
  green: "#788c5d",
  muted: "#b0aea5",
  primary: "#141413",
  secondaryAccent: "#6a9bcc"
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32
} as const;

export const typography = {
  body: {
    fontFamily: "Georgia",
    fontSize: 16,
    lineHeight: 24
  },
  heading: {
    fontFamily: "Arial",
    fontSize: 24,
    fontWeight: "700" as const,
    lineHeight: 30
  },
  label: {
    fontFamily: "Arial",
    fontSize: 13,
    fontWeight: "600" as const,
    letterSpacing: 0.2
  }
} as const;
