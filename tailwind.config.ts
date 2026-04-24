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
        // ── Colori stati ordine (Eleganti/Naturali) ────────────────────────
        status: {
          preso: "#D4A373",  // warm sand
          prep: "#8A6A4B",   // muted wood/caramel
          ready: "#586C4A",  // sage/olive green
        },
        // ── Brand Naturale ───────────────────────────────
        brand: {
          DEFAULT: "#1A1A1A", // Quasi nero per bottoni ed elementi principali
          light: "#333333",   // Grigio scuro per hover
          dark: "#000000",    // Nero assoluto
          accent: "#C8A882",  // Oro/Sabbia (uguale a wood.pale) per dettagli
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
