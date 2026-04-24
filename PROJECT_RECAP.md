# 🏖️ Naturale Beach Club — Recap Completo del Progetto

> **Ultimo aggiornamento**: 25 Aprile 2026  
> **Stato**: ✅ Produzione — Online su Vercel  
> **URL**: https://poke-flow.vercel.app

---

## 📋 Cos'è questa App

Sistema di **gestione ordini in tempo reale** per il locale **Naturale Beach Club**.  
Permette allo staff di inserire ordini, gestirne lo stato (ricevuto → in preparazione → pronto → consegnato) e ai clienti di seguire il proprio ordine su un monitor pubblico.

---

## 🛠️ Stack Tecnologico

| Tecnologia     | Ruolo                                      |
| -------------- | ------------------------------------------ |
| **TypeScript** | Linguaggio principale                      |
| **Next.js 14** | Framework React full-stack                 |
| **React**      | Libreria UI (componenti reattivi)          |
| **Tailwind CSS** | Styling utility-first                    |
| **Supabase**   | Database PostgreSQL + Auth + Realtime      |
| **Vercel**     | Hosting con deploy automatico da GitHub    |

---

## 📁 Struttura del Progetto

```
PokeFlow/
├── app/
│   ├── layout.tsx              # Layout root (include OrdersProvider globale)
│   ├── globals.css             # Stili globali
│   ├── page.tsx                # Landing page pubblica "/"
│   ├── admin/
│   │   ├── page.tsx            # Dashboard admin (con auth guard client-side)
│   │   └── login/
│   │       └── page.tsx        # Pagina di login operatore
│   ├── api/
│   │   ├── orders/
│   │   │   ├── route.ts        # API GET/POST ordini
│   │   │   └── [id]/
│   │   │       └── route.ts    # API PATCH/DELETE singolo ordine
│   └── monitor/
│       └── page.tsx            # Pagina monitor pubblico (SSR)
├── components/
│   ├── admin/
│   │   ├── KanbanBoard.tsx     # Lavagna Kanban ordini (4 colonne)
│   │   ├── NewOrderForm.tsx    # Form inserimento rapido ordine
│   │   └── AnalyticsDashboard.tsx  # Sezione statistiche con filtri temporali
│   ├── monitor/
│   │   ├── MonitorLayout.tsx   # Layout monitor a 2 colonne adattive
│   │   ├── OrderCardMonitor.tsx # Card ordine per monitor (dimensione auto)
│   │   └── LiveBadge.tsx       # Badge "LIVE" animato
│   └── shared/
│       ├── Logo.tsx            # Logo con next/image ottimizzato
│       ├── StatusBadge.tsx     # Badge stato ordine (5 stati)
│       └── QRCode.tsx          # QR Code per il monitor
├── hooks/
│   ├── useOrders.ts            # Hook consumer del contesto ordini
│   └── useAuth.ts              # Hook autenticazione (login/logout/session)
├── providers/
│   └── OrdersProvider.tsx      # 🧠 Context Provider globale (single source of truth)
├── lib/
│   ├── audio.ts                # 🔔 Generatore suono notifica (Web Audio API)
│   ├── utils.ts                # Utility (cn per classNames)
│   └── supabase/
│       └── client.ts           # Client Supabase browser (singleton)
├── types/
│   └── index.ts                # Tipi TypeScript (Order, OrderStatus, ecc.)
├── middleware.ts                # Middleware Supabase SSR (refresh token)
├── tailwind.config.ts          # Configurazione Tailwind con palette custom
└── public/
    ├── icon-192.png            # Logo/Icona PWA
    ├── icon-512.png            # Logo/Icona alta risoluzione
    └── manifest.json           # Manifest PWA
```

---

## 🎨 Design & Branding

L'app è stata interamente rebrandizzata con l'estetica **Naturale Beach Club**:

- **Palette colori**: Toni naturali — legno scuro (`#3B2314`), crema (`#F7F2EA`), sabbia (`#D4A373`), oliva (`#586C4A`)
- **Font**: DM Serif Display (titoli) + DM Sans (corpo)
- **Logo**: Immagine caricata dal cliente, ottimizzata con `next/image`
- **Stile card monitor**: Gradienti premium, bordi arrotondati, ombre, overlay decorativi

---

## ⚙️ Funzionalità Implementate

### 1. Dashboard Admin (`/admin`)
- **Navigazione a Tab**: "Ordini Live" e "Statistiche"
- **Kanban Board**: 4 colonne (Ricevuto → In Preparazione → Pronto → Consegnato)
- **Form inserimento rapido**: Numero ordine + Nome cliente + Note
- **Tasti grandi e contrastati**: Ottimizzati per l'uso su tablet/touch
- **Protezione accesso**: Auth guard client-side (redirect a `/admin/login` se non autenticato)

### 2. Monitor Pubblico (`/monitor`)
- **2 colonne adattive**:
  - Sinistra: "In Coda / Preparazione" (status 0 e 1, con preparazione in alto)
  - Destra: "Pronto — Ritira Ora!" (status 2, con animazione pulse)
- **Dimensionamento automatico**: Le card si restringono in base al numero di ordini per evitare lo scroll
  - ≤4 ordini: dimensione piena
  - 5-6 ordini: compatte
  - 7+ ordini: ultra-compatte (note nascoste)
- **QR Code**: Angolo in basso a destra (solo desktop)
- **Badge LIVE**: Indicatore di connessione in tempo reale

### 3. Sezione Analytics (`/admin` → tab "Statistiche")
- **Filtri temporali**: Oggi, 7 Giorni, 30 Giorni, Tutto
- **Metriche calcolate**:
  - Totale ordini
  - Completati (status 3)
  - In corso (status 0-2)
  - Annullati (status 4)
- **Tasso di completamento**: Grafico ad anello SVG con percentuale
- **Tempo medio di preparazione**: Calcolato dalla differenza `created_at` → `updated_at`

### 4. Soft Delete
- Il cestino NON cancella più fisicamente gli ordini dal database
- Imposta `status: 4` (Annullato) → l'ordine scompare dalla UI ma resta tracciabile nelle statistiche
- Permette analisi precise su ordini persi/annullati

### 5. Notifica Sonora 🔔
- Quando arriva un nuovo ordine via Realtime, viene emesso un suono "Ding!" 
- Generato al volo tramite **Web Audio API** (nessun file audio esterno)
- Fondamentale per ambienti rumorosi (beach club, cucina)

---

## 🔒 Sicurezza & Autenticazione

| Componente       | Meccanismo                                                       |
| ---------------- | ---------------------------------------------------------------- |
| **Login**        | Email + Password via Supabase Auth (`signInWithPassword`)        |
| **Protezione Admin** | Auth guard client-side in `app/admin/page.tsx` (controlla `useAuth().user`) |
| **Middleware**   | Solo refresh token SSR (nessun redirect server-side per evitare problemi di cookie sync) |
| **Logout**       | Pulsante "Esci" nell'header admin → `signOut()` + redirect       |

> **Nota tecnica**: Il middleware era stato inizialmente configurato per fare redirect server-side, ma causava un loop infinito perché Supabase SSR non riusciva a leggere i cookie di sessione appena creati dal browser client. La soluzione definitiva è stata spostare la protezione **client-side**.

---

## 🧠 Architettura Dati (Performance)

### OrdersProvider (Single Source of Truth)
```
OrdersProvider (1 sola istanza nell'app)
    │
    ├── 1 singola connessione WebSocket (Supabase Realtime)
    ├── 1 singolo fetch iniziale dal database
    ├── Stato condiviso in RAM (React Context)
    │
    └── Consumatori (leggono senza costi di rete):
        ├── KanbanBoard
        ├── NewOrderForm  
        ├── MonitorLayout
        └── Qualsiasi altro componente (useOrders())
```

**Prima**: Ogni componente apriva la sua connessione WebSocket e faceva il suo fetch → 3-4 connessioni duplicate, lag, sprechi di RAM.  
**Dopo**: Un unico Provider centralizzato → zero lag, zero sprechi, sincronizzazione perfetta.

---

## 📊 Database (Supabase)

### Tabella `orders`
| Campo           | Tipo       | Descrizione                           |
| --------------- | ---------- | ------------------------------------- |
| `id`            | UUID       | Primary key                           |
| `order_num`     | integer    | Numero ordine visibile al cliente     |
| `customer_name` | text       | Nome del cliente                      |
| `notes`         | text       | Note aggiuntive (opzionale)           |
| `status`        | integer    | Stato dell'ordine (0-4)               |
| `created_at`    | timestamp  | Data/ora creazione                    |
| `updated_at`    | timestamp  | Data/ora ultimo aggiornamento         |

### Stati dell'ordine
| Codice | Label           | Colore Card    | Descrizione                    |
| ------ | --------------- | -------------- | ------------------------------ |
| 0      | Ricevuto        | Sabbia chiara  | Ordine appena inserito         |
| 1      | In Preparazione | Legno/Caramello | Lo staff sta lavorando         |
| 2      | Pronto          | Verde oliva    | Pronto per il ritiro (pulse!)  |
| 3      | Consegnato      | —              | Sparisce dalla UI dopo 2 sec   |
| 4      | Annullato       | Rosso          | Soft delete, visibile solo nelle statistiche |

---

## 🚀 Deploy & CI/CD

- **Repository**: GitHub → `antozz996/PokeFlow`
- **Branch**: `main`
- **Deploy**: Automatico su **Vercel** ad ogni `git push`
- **Variabili d'ambiente** (su Vercel):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 📝 Note per lo Sviluppatore Futuro

1. **Per aggiungere un nuovo stato ordine**: Modifica `types/index.ts` (aggiungere al tipo `OrderStatus`, al mapping `ORDER_STATUS_LABELS` e `ORDER_STATUS_COLORS`), poi aggiorna `StatusBadge.tsx` e `OrderCardMonitor.tsx`.

2. **Per cambiare le soglie di compattamento del monitor**: Modifica la funzione `getCompactLevel()` in `MonitorLayout.tsx`.

3. **Per cambiare il suono della notifica**: Modifica le frequenze e il tipo d'onda in `lib/audio.ts`.

4. **Per riattivare la protezione server-side (middleware)**: Attenzione — il redirect nel middleware causa un loop di cookie con Supabase SSR. Se vuoi riattivarlo, devi prima risolvere il problema di sincronizzazione dei cookie tra `createBrowserClient` e `createServerClient`.

5. **Il file si chiama ancora "PokeFlow"** nel `package.json` — è il nome originale del progetto prima del rebranding. Non influisce su nulla.

---

*Documento creato il 25/04/2026 — Buon lavoro!* 🏖️
