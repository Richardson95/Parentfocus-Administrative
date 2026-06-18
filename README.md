# ParentFocus — Owner Admin Panel

The **platform owner's** control center for the ParentFocus parent–school mobile app.
This is *not* the in-app school admin — it's the console **you (the app owners)** use to manage
every school on the platform, control the mobile app remotely, import student rosters, and broadcast to parents.

Built with **React 18 + Vite**, plain CSS design system (navy `#0C1B33` / gold `#F59E0B`, matching the mobile app),
`recharts` for analytics, and `xlsx` (SheetJS) for CSV/Excel import & export. Fully responsive — sidebar collapses
to a hamburger drawer on tablet/mobile and every grid reflows down to phone width.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5180
npm run build    # production build → dist/
npm run preview  # preview the production build
```

### Demo login
- **Email:** `adetunjidammie2@gmail.com`
- **Password:** `parentfocus`

(or any `@parentfocus.ng` email with password `parentfocus`)

## Deploying to Vercel

This is a single-page app, so Vercel must serve `index.html` for every route — otherwise
opening/refreshing a deep link like `/schools/sch_obms` returns a **404**. That fallback is
handled by `vercel.json` (a catch-all rewrite to `/index.html`), which is already included.

Deploy either way:

- **Dashboard:** import the repo on [vercel.com](https://vercel.com) → it auto-detects Vite
  (build `npm run build`, output `dist`). No extra setup needed; `vercel.json` does the rest.
- **CLI:**
  ```bash
  npm i -g vercel
  vercel          # preview deploy
  vercel --prod   # production deploy
  ```

Static assets are still served directly; only unknown paths fall through to `index.html`,
so client-side routing and refreshes work on every page.

## What's inside

| Area | What it does |
|------|--------------|
| **Dashboard** | Platform-wide KPIs (schools, students, parents, revenue), growth chart, plan distribution, top schools, recent activity. |
| **Schools** | Searchable/filterable grid & list of every school, with an *Onboard School* wizard. |
| **School detail** | Per-school tabs: **Overview** (profile, leadership, subscription, modules), **Authorities** (principal, vice, bursar… add/edit/remove), **Teachers** (with subjects & classes), **Students** (search, filter, **CSV/Excel import** + export), **App Modules** (per-school feature toggles), **Settings** (edit profile, change status, delete). |
| **Mobile App Control** | Platform-wide remote control of the app: maintenance mode, force-update/version gates, registrations switch, store URLs, support contacts, default modules — with a live phone preview. |
| **Broadcasts** | Compose & send announcements to parent audiences (by status/plan) with estimated reach. |
| **Subscriptions** | MRR/ARR, per-plan revenue, per-school billing table. |
| **Activity Log** | Filterable audit trail of every action. |
| **Team & Access** | Invite owner-console members with roles (Super Admin / Admin / Support). |
| **Settings** | Owner profile, organisation details, reset demo data. |

### CSV / Excel student import
On a school's **Students** tab → **Import CSV / Excel**:
1. Drag-drop or browse a `.csv` / `.xlsx` / `.xls` file (a downloadable template is provided).
2. Columns are auto-matched to ParentFocus fields; adjust the mapping if needed.
3. Preview the parsed rows (invalid rows missing name/class are flagged & skipped) and import.

## Data & persistence
This is a fully working front-end demo. All data is seeded from `src/data/seed.js` and persisted to the browser's
`localStorage` via `src/data/store.jsx`. **To connect a real backend**, replace the mutator functions in
`store.jsx` (`addSchool`, `addToCollection`, `updateAppConfig`, …) with API calls, and swap the demo auth in
`src/auth/AuthContext.jsx` for your real auth endpoint. The component layer stays unchanged.

## Project structure
```
src/
  auth/        AuthContext (demo owner login)
  data/        seed.js (sample schools) + store.jsx (state + localStorage)
  components/  Layout (sidebar/topbar), Modal, ImportModal (CSV/Excel), Toast, ui.jsx (shared widgets)
  pages/       Login, Dashboard, Schools, SchoolDetail, MobileControl, Broadcasts,
               Subscriptions, ActivityLog, Team, Settings
  index.css    design system + responsive rules
```
