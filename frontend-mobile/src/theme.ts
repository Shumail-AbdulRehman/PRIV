export const colors = {
  ink: "#16211d",
  inkMuted: "#66736d",
  inkSoft: "#8a9188",
  canvas: "#f3efe6",
  canvasDeep: "#e8dfcf",
  surface: "#fffaf0",
  surfaceSoft: "#f8f1e5",
  surfacePressed: "#eee4d3",
  line: "#ddd0bb",
  lineStrong: "#c7b89d",
  forest: "#163f36",
  forestDeep: "#0b2a24",
  teal: "#0f7668",
  mint: "#cdebe2",
  sage: "#dce7cf",
  amber: "#f2d38b",
  amberDeep: "#8c5e10",
  clay: "#b85f35",
  rust: "#8f3b2f",
  danger: "#9c342b",
  dangerSoft: "#f3d7d1",
  white: "#fffdf8",
  black: "#050706",
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 14,
  md: 20,
  lg: 26,
  xl: 32,
  pill: 999,
};

export const typography = {
  eyebrow: {
    fontSize: 11,
    fontWeight: "900" as const,
    letterSpacing: 1.1,
    textTransform: "uppercase" as const,
  },
  title: {
    fontSize: 34,
    lineHeight: 39,
    fontWeight: "900" as const,
    letterSpacing: -0.7,
  },
  screenTitle: {
    fontSize: 30,
    lineHeight: 35,
    fontWeight: "900" as const,
    letterSpacing: -0.5,
  },
  sectionTitle: {
    fontSize: 21,
    lineHeight: 26,
    fontWeight: "900" as const,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500" as const,
  },
  small: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700" as const,
  },
};

export const shadow = {
  panel: {
    shadowColor: "#14211d",
    shadowOpacity: 0.09,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6,
  },
  lifted: {
    shadowColor: "#14211d",
    shadowOpacity: 0.14,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 18 },
    elevation: 10,
  },
};

export const cardShell = {
  borderRadius: radius.xl,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.72)",
  backgroundColor: "rgba(255,255,255,0.28)",
  padding: 6,
};

export const cardCore = {
  borderRadius: radius.lg,
  borderWidth: 1,
  borderColor: colors.line,
  backgroundColor: colors.surface,
};
