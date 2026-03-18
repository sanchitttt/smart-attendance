export const UI = {
  colors: {
    slate50: "#f8fafc",
    slate100: "#f1f5f9",
    slate200: "#e2e8f0",
    slate400: "#475569",
    slate500: "#475569",
    slate600: "#475569",
    slate700: "#334155",
    slate800: "#334155",
    slate900: "#0f172a",
    white: "#ffffff",
    indigo600: "#4f46e5",
    indigo700: "#4338ca",
    blue600: "#2563eb",
    green600: "#16a34a",
    amber600: "#f59e0b",
    red600: "#ef4444",
  },
  radius: {
    card: 18,
    pill: 999,
    button: 18,
  },
  shadow: {
    card: {
      // shadowColor: "#0f172a",
      // shadowOffset: { width: 0, height: 10 },
      // shadowOpacity: 0.08,
      // shadowRadius: 18,
      // elevation: 6,
    },
    button: {
      shadowColor: "#4f46e5",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.22,
      shadowRadius: 20,
      elevation: 10,
    },
  },
  spacing: {
    pageX: 20,
    pageY: 18,
  },
  type: {
    title: { fontSize: 28, fontWeight: "700" as const, letterSpacing: -0.3 },
    subtitle: { fontSize: 16, fontWeight: "500" as const },
    body: { fontSize: 14, fontWeight: "400" as const },
    label: { fontSize: 12, fontWeight: "600" as const },
  },
};

