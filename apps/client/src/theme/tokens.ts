export const colors = {
  accent: "#38bdf8",
  accentDeep: "#0284c7",
  accentSoft: "#e0f2fe",
  background: "#f0f9ff",
  border: "#bae6fd",
  canvas: "#ffffff",
  chip: "#e0f2fe",
  danger: "#ef4444",
  dangerSoft: "#fee2e2",
  muted: "#64748b",
  panel: "#f8fafc",
  primary: "#0f172a",
  secondaryAccent: "#0ea5e9",
  success: "#16a34a",
  successSoft: "#dcfce7"
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
