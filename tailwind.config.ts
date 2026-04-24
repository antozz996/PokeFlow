import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Palette Wood ──────────────────────────────
        wood: {
          dark: "#3B2314",   // bg header, nav bar
          med: "#6B4226",   // testi secondari, bordi
          light: "#A0714F",   // accenti, placeholder
          pale: "#C8A882",   // dividers, tints
        },
        cream: {
          DEFAULT: "#F7F2EA", // background principale
          dark: "#EDE5D8",   // card bg, footer
        },
        // ── Colori stati ordine ────────────────────────
        status: {
          preso: "#D4955A",  // amber — preso in carico
          prep: "#2563EB",  // blue  — in preparazione
          ready: "#16A34A",  // green — pronto/ritira
        },
        // ── Verde brand ───────────────────────────────
        poke: {
          DEFAULT: "#5A9160",
          light: "#7BAE7F",
          dark: "#3D6644",
        },
      },
      fontFamily: {
        display: ["DM Serif Display", "Georgia", "serif"],
        body: ["DM Sans", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Monitor (grandi schermi)
        "monitor-num": ["4rem", { lineHeight: "1", fontWeight: "700" }],
        "monitor-name": ["1.5rem", { lineHeight: "1.3", fontWeight: "500" }],
        "monitor-col": ["0.7rem", { lineHeight: "1", letterSpacing: "0.12em" }],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      animation: {
        "ready-pulse": "readyPulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
        "fade-in": "fadeIn 0.3s ease both",
        "slide-up": "slideUp 0.3s ease both",
      },
      keyframes: {
        readyPulse: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(22, 163, 74, 0.4)" },
          "50%": { boxShadow: "0 0 0 12px rgba(22, 163, 74, 0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
