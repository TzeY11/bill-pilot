# Bill Pilot

Bill Pilot is a personal billing and renewal management dashboard for VPS, servers, domains, memberships, software, games, and recurring subscriptions.

The current version is local-first with account authentication:

- Next.js App Router
- TypeScript
- Tailwind CSS
- localStorage persistence
- Native SQLite user database
- Email and password registration/login

## Features

- Dashboard with estimated monthly and annual spend
- Light, dark, and system theme modes
- Display currency selector with cached exchange-rate conversion across common global currencies
- Upcoming renewals in 3 days and 14 days
- Expired or paused service attention count
- Monthly category spend breakdown
- Service inventory with search, filters, sorting, and responsive views
- Add, edit, and delete services
- Built-in service icon presets plus custom icon uploads
- Brand SVG icons powered by `react-icons` / Simple Icons where available
- Renewal health labels: Expired, Urgent, Soon, Normal
- Built-in sample data for immediate testing
- Protected dashboard, services, and account pages

## Project Structure

```txt
bill-pilot/
  src/
    app/
      account/page.tsx
      api/auth/login/route.ts
      api/auth/logout/route.ts
      api/auth/me/route.ts
      api/auth/register/route.ts
      layout.tsx
      login/page.tsx
      page.tsx
      register/page.tsx
      services/page.tsx
      globals.css
    components/
      AccountView.tsx
      AppShell.tsx
      AuthForm.tsx
      CategoryBreakdown.tsx
      DashboardView.tsx
      MetricCard.tsx
      RenewalList.tsx
      ServiceFormModal.tsx
      ServiceIcon.tsx
      ServiceTable.tsx
      ServiceToolbar.tsx
      ServicesView.tsx
      StatusBadge.tsx
      UserMenu.tsx
    data/
      sample-services.ts
    hooks/
      useExchangeRates.ts
      useServices.ts
    lib/
      auth-constants.ts
      billing.ts
      exchange-rates.ts
      server/auth.ts
      server/db.ts
      service-icons.ts
      storage.ts
    types/
      billing.ts
  next.config.ts
  tailwind.config.ts
  postcss.config.mjs
  tsconfig.json
  package.json
```

## Install

```bash
cd bill-pilot
npm install
cp .env.example .env
```

If your machine does not have `npm`, install Node.js from https://nodejs.org first, or use a compatible package manager such as `pnpm` or `yarn`.

This backend uses Node's native SQLite module, so use Node.js 22+ or 24+.

## Run Development Server

```bash
npm run dev
```

Then open:

```txt
http://localhost:3000
```

## Build

```bash
npm run build
npm run start
```

## Data Persistence

User accounts are stored in a local SQLite database. By default:

```txt
data/bill-pilot.db
```

Service data is still stored in browser localStorage under:

```txt
bill-pilot-services
```

On first load, Bill Pilot seeds localStorage with the sample services in `src/data/sample-services.ts`.

Dashboard exchange rates and the selected display currency are also cached in localStorage.

## Exchange Rates

Bill Pilot fetches exchange rates from the free Frankfurter API and caches them locally for 6 hours. If the network request fails, the app uses the latest cached rates when available.

## Database Upgrade Path

When you are ready to move services into the backend, start with these files:

- `src/types/billing.ts`: keep or extend the shared service model.
- `src/lib/server/db.ts`: add service tables and database queries.
- `src/lib/storage.ts`: replace localStorage reads and writes with API calls.
- `src/hooks/useServices.ts`: adapt the hook to fetch, create, update, and delete through the backend.
- `src/lib/exchange-rates.ts`: move exchange-rate fetching to a server API or scheduled cache.
- `src/data/sample-services.ts`: move this to a seed script or demo fixture.
- `src/app/services/page.tsx` and `src/app/page.tsx`: these can stay mostly unchanged if the hook API remains stable.

Good next steps would be moving services into SQLite/PostgreSQL, then adding deployment docs and automated backups.
