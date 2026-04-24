# POKEFLOW — MASTER SPEC v1.0
> Blueprint tecnico completo per sviluppo con Antigravity IDE  
> Ultimo aggiornamento: 2025 — Autore: Antonio Avella

---

## 0. CONTESTO RAPIDO

**PokeFlow** è una PWA per la gestione degli ordini in un Poke Shop, ispirata al modello McDonald's.  
Separa la fase di ordinazione dal ritiro tramite un monitor pubblico real-time e un pannello operatore protetto.  
Stack: **Next.js 14 + Supabase (PostgreSQL + Realtime) + Vercel**. Budget infrastruttura: **€0**.

---

## 1. STACK TECNOLOGICO

| Layer | Tecnologia | Note |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR + RSC dove utile |
| UI Library | React 18 | Hooks, no class components |
| Styling | Tailwind CSS v3 | Config custom con design tokens |
| Database | Supabase PostgreSQL | Piano Free |
| Auth | Supabase Auth | Email/Password per admin |
| Realtime | Supabase Realtime (WebSocket) | Canal `orders` con broadcast |
| Hosting | Vercel (Piano Free) | Deploy automatico da GitHub |
| QR Code | `qrcode.react` | Generazione lato client |
| Font | Google Fonts CDN | DM Serif Display + DM Sans |
| Icons | Lucide React | Tree-shakeable |

### Dipendenze package.json

```json
{
  "dependencies": {
    "next": "14.2.x",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@supabase/supabase-js": "^2.43.0",
    "@supabase/ssr": "^0.3.0",
    "qrcode.react": "^3.1.0",
    "lucide-react": "^0.383.0",
    "clsx": "^2.1.1"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

## 2. STRUTTURA DIRECTORY

```
pokeflow/
├── app/
│   ├── layout.tsx                 # Root layout — font, metadata
│   ├── page.tsx                   # Redirect → /monitor
│   ├── monitor/
│   │   └── page.tsx               # Vista pubblica clienti
│   ├── admin/
│   │   ├── page.tsx               # Pannello operatore (auth-gated)
│   │   └── login/
│   │       └── page.tsx           # Login form
│   └── api/
│       └── orders/
│           ├── route.ts           # GET + POST ordini
│           └── [id]/
│               └── route.ts       # PATCH (avanza stato) + DELETE
├── components/
│   ├── monitor/
│   │   ├── MonitorLayout.tsx      # Layout colonne monitor
│   │   ├── OrderCardMonitor.tsx   # Card singolo ordine (monitor)
│   │   └── LiveBadge.tsx          # Badge "● LIVE"
│   ├── admin/
│   │   ├── KanbanBoard.tsx        # Board 3 colonne
│   │   ├── KanbanColumn.tsx       # Colonna singola
│   │   ├── OrderCardAdmin.tsx     # Card con bottone avanza
│   │   └── NewOrderForm.tsx       # Form inserimento rapido
│   └── shared/
│       ├── Logo.tsx               # Logo PokeFlow
│       ├── QRCode.tsx             # QR wrapper
│       └── StatusBadge.tsx        # Pill stato colorata
├── hooks/
│   ├── useOrders.ts               # Fetch + Realtime subscription
│   └── useAuth.ts                 # Session Supabase
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Browser client
│   │   ├── server.ts              # Server client (RSC/Route)
│   │   └── middleware.ts          # Refresh session
│   └── utils.ts                   # cn(), formatTime(), ecc.
├── types/
│   └── index.ts                   # Order, OrderStatus, User
├── middleware.ts                  # Protezione rotte /admin
├── tailwind.config.ts             # Design tokens custom
├── .env.local                     # Variabili Supabase (non committare)
└── supabase/
    └── migrations/
        └── 001_initial.sql        # Schema + RLS + seed
```

---

## 3. DATABASE SCHEMA

### Tabella `orders`

```sql
-- supabase/migrations/001_initial.sql

CREATE TABLE orders (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_num   SMALLINT NOT NULL,
  customer_name TEXT NOT NULL,
  status      SMALLINT NOT NULL DEFAULT 0,
  -- 0 = preso_in_carico
  -- 1 = in_preparazione
  -- 2 = pronto (RITIRA)
  -- 3 = consegnato (soft, poi delete)
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Aggiorna updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Index per ordinamento display
CREATE INDEX orders_status_created_idx ON orders(status, created_at ASC);
```

### Row Level Security (RLS)

```sql
-- Abilita RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Chiunque può leggere (monitor pubblico)
CREATE POLICY "public_select"
  ON orders FOR SELECT
  USING (true);

-- Solo utenti autenticati possono inserire
CREATE POLICY "auth_insert"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Solo utenti autenticati possono aggiornare
CREATE POLICY "auth_update"
  ON orders FOR UPDATE
  TO authenticated
  USING (true);

-- Solo utenti autenticati possono eliminare
CREATE POLICY "auth_delete"
  ON orders FOR DELETE
  TO authenticated
  USING (true);
```

### Realtime

```sql
-- Abilita Realtime sulla tabella orders
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
```

---

## 4. TYPESCRIPT TYPES

```typescript
// types/index.ts

export type OrderStatus = 0 | 1 | 2 | 3;

export const STATUS_LABELS: Record<OrderStatus, string> = {
  0: "Preso in carico",
  1: "In Preparazione",
  2: "Ritira",
  3: "Consegnato",
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  0: "amber",
  1: "blue",
  2: "green",
  3: "wood",
};

export interface Order {
  id: string;
  order_num: number;
  customer_name: string;
  status: OrderStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface NewOrderInput {
  order_num: number;
  customer_name: string;
  notes?: string;
}
```

---

## 5. DESIGN TOKENS — TAILWIND CONFIG

```typescript
// tailwind.config.ts

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Palette Wood ──────────────────────────────
        wood: {
          dark:  "#3B2314",   // bg header, nav bar
          med:   "#6B4226",   // testi secondari, bordi
          light: "#A0714F",   // accenti, placeholder
          pale:  "#C8A882",   // dividers, tints
        },
        cream: {
          DEFAULT: "#F7F2EA", // background principale
          dark:    "#EDE5D8", // card bg, footer
        },
        // ── Colori stati ordine ────────────────────────
        status: {
          preso:  "#D4955A",  // amber — preso in carico
          prep:   "#2563EB",  // blue  — in preparazione
          ready:  "#16A34A",  // green — pronto/ritira
        },
        // ── Verde brand ───────────────────────────────
        poke: {
          DEFAULT: "#5A9160",
          light:   "#7BAE7F",
          dark:    "#3D6644",
        },
      },
      fontFamily: {
        display: ["DM Serif Display", "Georgia", "serif"],
        body:    ["DM Sans", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Monitor (grandi schermi)
        "monitor-num":  ["4rem",   { lineHeight: "1",    fontWeight: "700" }],
        "monitor-name": ["1.5rem", { lineHeight: "1.3",  fontWeight: "500" }],
        "monitor-col":  ["0.7rem", { lineHeight: "1",    letterSpacing: "0.12em" }],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      animation: {
        "ready-pulse": "readyPulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
        "fade-in":     "fadeIn 0.3s ease both",
        "slide-up":    "slideUp 0.3s ease both",
      },
      keyframes: {
        readyPulse: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(22, 163, 74, 0.4)" },
          "50%":      { boxShadow: "0 0 0 12px rgba(22, 163, 74, 0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 6. VARIABILI D'AMBIENTE

```bash
# .env.local — NON committare su GitHub

NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # solo server-side, mai esposta al client

# URL pubblica per generazione QR
NEXT_PUBLIC_APP_URL=https://pokeflow.vercel.app
```

---

## 7. SUPABASE CLIENT

```typescript
// lib/supabase/client.ts — uso nei componenti browser
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

```typescript
// lib/supabase/server.ts — uso in Server Components e Route Handlers
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
```

---

## 8. HOOK useOrders — CUORE REALTIME

```typescript
// hooks/useOrders.ts

"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Order, NewOrderInput } from "@/types";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Fetch iniziale
  const fetchOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .lt("status", 3)           // esclude consegnati
      .order("created_at", { ascending: true });
    if (!error && data) setOrders(data as Order[]);
    setLoading(false);
  }, [supabase]);

  // Sottoscrizione Realtime
  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setOrders((prev) => [...prev, payload.new as Order]);
          }
          if (payload.eventType === "UPDATE") {
            const updated = payload.new as Order;
            if (updated.status >= 3) {
              // Rimuovi dalla lista quando consegnato
              setOrders((prev) => prev.filter((o) => o.id !== updated.id));
            } else {
              setOrders((prev) =>
                prev.map((o) => (o.id === updated.id ? updated : o))
              );
            }
          }
          if (payload.eventType === "DELETE") {
            setOrders((prev) =>
              prev.filter((o) => o.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders, supabase]);

  // CRUD actions — solo admin
  const addOrder = async (input: NewOrderInput) => {
    const { error } = await supabase.from("orders").insert([input]);
    if (error) throw error;
  };

  const advanceStatus = async (id: string, currentStatus: number) => {
    const nextStatus = currentStatus + 1;
    if (nextStatus > 3) return;
    const { error } = await supabase
      .from("orders")
      .update({ status: nextStatus })
      .eq("id", id);
    if (error) throw error;
    // Se consegnato, elimina dopo 2s (animazione uscita)
    if (nextStatus === 3) {
      setTimeout(async () => {
        await supabase.from("orders").delete().eq("id", id);
      }, 2000);
    }
  };

  const deleteOrder = async (id: string) => {
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) throw error;
  };

  return { orders, loading, addOrder, advanceStatus, deleteOrder };
}
```

---

## 9. MIDDLEWARE — PROTEZIONE ROTTE ADMIN

```typescript
// middleware.ts

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Proteggi /admin (tranne /admin/login)
  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/admin/login") &&
    !user
  ) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Se già loggato e va su /admin/login, redirect ad /admin
  if (request.nextUrl.pathname === "/admin/login" && user) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

---

## 10. LAYOUT PAGINE

### 10.1 Root Layout

```typescript
// app/layout.tsx

import type { Metadata } from "next";
import { DM_Serif_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
});

const dmSans = DM_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "PokeFlow",
  description: "Sistema gestione ordini per Poke Shop",
  manifest: "/manifest.json",
  themeColor: "#3B2314",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${dmSerif.variable} ${dmSans.variable}`}>
      <body className="font-body bg-cream">{children}</body>
    </html>
  );
}
```

### 10.2 Pagina Monitor `/monitor`

**Layout:** Full-screen, landscape-first, divide verticale 50/50.

```
┌─────────────────────────────────────────────────┐
│  HEADER: Logo + "STATO ORDINI" + Badge LIVE     │ h-16
├────────────────────┬────────────────────────────┤
│  ⏳ IN PREPARAZIONE│  ✓ PRONTO — RITIRA ORA!   │ flex-1
│                    │                            │
│  [card ordine]     │  [card ordine — pulsante]  │
│  [card ordine]     │  [card ordine — pulsante]  │
│  [card ordine]     │                            │
│                    │                            │
└────────────────────┴────────────────────────────┘
```

**Specifiche Layout Monitor:**
- Background: `bg-[#0D1117]` (dark, visibile anche in ambienti luminosi)
- Header: `bg-wood-dark h-16 px-6 flex items-center justify-between`
- Colonna sinistra header: `bg-[#1D4ED8]` (blu)
- Colonna destra header: `bg-status-ready` (verde)
- Ordini "Pronto": animazione `animate-ready-pulse` + bordo verde
- Font numero ordine: `font-display text-monitor-num` (molto grande, leggibile a distanza)
- Font nome: `font-body text-monitor-name font-medium`
- Colonne: `grid grid-cols-2 flex-1`
- Card ordine monitor — colonna prep: `bg-[#1E3A5F] rounded-xl p-4 mb-3`
- Card ordine monitor — colonna ready: `bg-status-ready rounded-xl p-4 mb-3 animate-ready-pulse`

### 10.3 Pannello Admin `/admin`

**Layout:** Mobile-first, scroll verticale, sticky header.

```
┌──────────────────────────────────┐
│  HEADER sticky: Logo + Badge     │ h-14
├──────────────────────────────────┤
│  FORM: N° ordine | Nome | +Add   │ h-14
├────────────┬──────────┬──────────┤
│  PRESO     │  IN PREP │  RITIRA  │ flex-1 scroll
│            │          │          │
│  [card]    │  [card]  │  [card]  │
│  [card]    │  [card]  │          │
│            │  [card]  │          │
└────────────┴──────────┴──────────┘
```

**Specifiche Layout Admin:**
- Background: `bg-cream`
- Header sticky: `bg-wood-dark sticky top-0 z-50 h-14 px-4 flex items-center justify-between`
- Form bar: `bg-cream-dark border-b border-wood-pale/30 px-4 py-2 flex gap-2`
- Input: `bg-white border border-wood-pale/50 rounded-lg px-3 py-2 text-sm font-body`
- Bottone Add: `bg-poke text-white rounded-lg px-4 py-2 text-sm font-bold`
- Kanban: `grid grid-cols-3 flex-1 overflow-hidden`
- Ogni colonna: `flex flex-col min-h-0`
- Header colonna Preso: `bg-amber-100 text-status-preso text-xs font-bold uppercase tracking-wider py-2 text-center`
- Header colonna Prep: `bg-blue-50 text-status-prep text-xs font-bold uppercase tracking-wider py-2 text-center`
- Header colonna Ritira: `bg-green-50 text-status-ready text-xs font-bold uppercase tracking-wider py-2 text-center`
- Body colonna: `flex-1 overflow-y-auto p-2 space-y-2 bg-cream`
- Card admin: `bg-white rounded-xl p-3 shadow-sm flex flex-col gap-1 relative cursor-pointer active:scale-95 transition-transform`
- Card ready: `bg-green-50 border border-status-ready/30`
- Bottone avanza: `absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg text-sm font-bold flex items-center justify-center`

### 10.4 Login Admin `/admin/login`

```
┌──────────────────────────────────┐
│                                  │
│  [Logo PokeFlow — centrato]      │
│                                  │
│  ┌────────────────────────────┐  │
│  │  Email                     │  │
│  ├────────────────────────────┤  │
│  │  Password                  │  │
│  ├────────────────────────────┤  │
│  │  [Accedi]                  │  │
│  └────────────────────────────┘  │
│                                  │
└──────────────────────────────────┘
```

**Specifiche Layout Login:**
- Background: `bg-wood-dark min-h-screen flex items-center justify-center`
- Card: `bg-cream rounded-2xl p-8 w-full max-w-sm shadow-2xl`
- Logo: `font-display text-3xl text-wood-dark text-center mb-8`
- Input: `w-full bg-white border border-wood-pale/50 rounded-xl px-4 py-3 font-body text-sm`
- Submit: `w-full bg-poke hover:bg-poke-dark text-white rounded-xl py-3 font-bold transition-colors`

---

## 11. COMPONENTI CHIAVE

### OrderCardMonitor

```tsx
// components/monitor/OrderCardMonitor.tsx

interface Props {
  order: Order;
  isReady: boolean;
}

// Classi Tailwind:
// Container: clsx(
//   "rounded-xl p-4 mb-3 animate-fade-in",
//   isReady
//     ? "bg-status-ready animate-ready-pulse"
//     : "bg-[#1E3A5F]"
// )
// Numero: "font-display text-monitor-num leading-none"
// Nome:   "font-body text-monitor-name font-medium mt-1"
// Tag:    "text-xs font-bold tracking-wide mt-2 opacity-80"
// Colori testo: isReady ? "text-white" : colonna-specifica
```

### OrderCardAdmin

```tsx
// components/admin/OrderCardAdmin.tsx

interface Props {
  order: Order;
  onAdvance: (id: string, status: number) => void;
}

// Il bottone avanza deve:
// - Mostrare →  per status 0 e 1
// - Mostrare ✓  per status 2 (consegna)
// - Scomparire a status 3 (non dovrebbe esistere in lista)
// Colore bottone segue STATUS_COLORS
```

### NewOrderForm

```tsx
// components/admin/NewOrderForm.tsx

// Input N° ordine: type="number" min="1" max="99" — larghezza fissa w-16
// Input nome: type="text" — flex-1
// Submit: solo se entrambi i campi valorizzati
// Dopo submit: reset form + focus su input N°
// Gestione errori: toast inline (no librerie esterne, state locale)
```

### LiveBadge

```tsx
// components/monitor/LiveBadge.tsx

// Dot verde animato (animate-pulse) + testo "LIVE"
// Background: bg-poke/20 border border-poke/40 rounded-full px-3 py-1
// Testo: text-poke-light text-xs font-bold tracking-widest
```

---

## 12. ROUTE HANDLERS API

```typescript
// app/api/orders/route.ts

// GET /api/orders — ritorna ordini attivi (status < 3)
// POST /api/orders — crea nuovo ordine (richiede auth)

// app/api/orders/[id]/route.ts

// PATCH /api/orders/:id — { status: number } — avanza stato
// DELETE /api/orders/:id — elimina ordine
```

> **Nota:** Le operazioni admin passano anche direttamente dal client Supabase (con auth token in sessione), le API route servono come fallback e per operazioni server-side future.

---

## 13. GENERAZIONE QR CODE

Il QR Code viene generato lato client sulla pagina `/monitor` e si riferisce all'URL pubblico del monitor stesso.

```tsx
// components/shared/QRCode.tsx
import { QRCodeSVG } from "qrcode.react";

const monitorUrl = `${process.env.NEXT_PUBLIC_APP_URL}/monitor`;

// Props QRCodeSVG:
// value={monitorUrl}
// size={120}
// bgColor="transparent"
// fgColor="#C8A882"  ← wood-pale, visibile su sfondo scuro
// level="M"
```

Posizionamento sul monitor: angolo in basso a destra, con label "Scansiona per seguire il tuo ordine" sopra il QR.

---

## 14. PWA MANIFEST

```json
// public/manifest.json
{
  "name": "PokeFlow",
  "short_name": "PokeFlow",
  "description": "Gestione ordini Poke Shop",
  "start_url": "/admin",
  "display": "standalone",
  "background_color": "#3B2314",
  "theme_color": "#3B2314",
  "orientation": "portrait",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## 15. GLOBAL CSS

```css
/* app/globals.css */

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: var(--font-body);
    -webkit-font-smoothing: antialiased;
  }

  /* Previeni zoom su input iOS */
  input, select, textarea {
    font-size: 16px;
  }
}

@layer components {
  /* Scrollbar custom — visibile solo su desktop */
  .custom-scroll::-webkit-scrollbar { width: 4px; }
  .custom-scroll::-webkit-scrollbar-track { background: transparent; }
  .custom-scroll::-webkit-scrollbar-thumb {
    background: #C8A882;
    border-radius: 2px;
  }
}

@layer utilities {
  /* Utility per il monitor full-screen su TV */
  .monitor-fullscreen {
    height: 100dvh;
    width: 100dvw;
    overflow: hidden;
  }
}
```

---

## 16. FLUSSO DI STATO ORDINE

```
INSERT status=0          UPDATE status=1       UPDATE status=2        DELETE
[Preso in carico]  ──→  [In Preparazione]  ──→  [RITIRA]  ──→  [Eliminato da DB]
    (Admin)                 (Admin)              (Admin)       (dopo 2s da status=3)

  Monitor: nascosto     Monitor: col.SX       Monitor: col.DX
  Admin:   col.SX       Admin:   col.CENTRO   Admin:   col.DX
  QR:      in attesa    QR:      in attesa    QR:      BANNER VERDE
```

---

## 17. DATA HYGIENE — PULIZIA AUTOMATICA

Per rientrare nel piano free Supabase, gli ordini completati vengono eliminati in due modi:

1. **Lato client** (già implementato in `advanceStatus`): dopo 2 secondi da `status=3`, `DELETE` automatico.
2. **Cron Supabase** (opzionale, pg_cron): elimina tutto ciò che ha `status=3` o `created_at` più vecchio di 12h.

```sql
-- Attivare pg_cron su Supabase Dashboard → Database → Extensions
SELECT cron.schedule(
  'cleanup-completed-orders',
  '0 * * * *',   -- ogni ora
  $$
    DELETE FROM orders
    WHERE status = 3
       OR created_at < now() - interval '12 hours';
  $$
);
```

---

## 18. DEPLOY CHECKLIST

### Supabase Setup
- [ ] Creare progetto Supabase (regione `eu-west-1` per latenza minima da IT)
- [ ] Eseguire `001_initial.sql` nell'editor SQL
- [ ] Verificare RLS attivato sulla tabella `orders`
- [ ] Verificare `supabase_realtime` publication attiva
- [ ] Creare utente admin: Dashboard → Authentication → Users → Invite
- [ ] Copiare `SUPABASE_URL` e `ANON_KEY` da Settings → API

### Vercel Setup
- [ ] Collegare repo GitHub
- [ ] Aggiungere variabili d'ambiente (`.env.local` → Vercel Environment Variables)
- [ ] Deploy automatico su push `main`
- [ ] Verificare URL generato e aggiornare `NEXT_PUBLIC_APP_URL`

### Test pre-apertura
- [ ] Aprire `/monitor` su Smart TV o secondo monitor
- [ ] Aprire `/admin` su tablet operatore
- [ ] Aprire `/monitor` su smartphone via QR
- [ ] Inserire ordine da admin → verificare comparsa immediata su monitor
- [ ] Avanzare ordine a "Ritira" → verificare animazione pulse su monitor
- [ ] Completare ordine → verificare scomparsa da tutti i display

---

## 19. NOTE PER ANTIGRAVITY IDE

- **Usa questo file come contesto primario** per ogni sessione di sviluppo.
- Inizia sempre dalla struttura directory (§2) per creare i file nella sequenza corretta.
- Implementa prima il database (§3) e poi `useOrders` (§8) — tutto il resto dipende da questi.
- I design token (§5) vanno configurati **prima** di scrivere qualsiasi componente.
- Per ogni componente, parti dai layout wireframe (§10) e applica le classi Tailwind custom definite sopra.
- La pagina `/monitor` deve funzionare correttamente anche **senza JavaScript abilitato** (progressive enhancement) — usa SSR per il render iniziale degli ordini.
- Testa sempre il Realtime in locale con due finestre browser affiancate.

---

*Fine MASTER_SPEC v1.0 — PokeFlow*
