# Bill Pilot

[![English](https://img.shields.io/badge/lang-English-blue.svg)](./README.md)
[![简体中文](https://img.shields.io/badge/lang-%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87-red.svg)](./README.zh-CN.md)

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

## Local Development

```bash
cd bill-pilot
npm install
cp .env.example .env
npm run dev
```

Then open:

```txt
http://localhost:3000
```

This backend uses Node's native SQLite module, so use Node.js 22+ or 24+.

## Self-hosting on a VPS

This is the recommended production path for running Bill Pilot on your own VPS.

Bill Pilot currently stores user accounts in SQLite on the server, while service/subscription records are still stored in each user's browser localStorage. Back up the SQLite database for account data, and export browser data manually until service records are moved into the backend.

### One-command Install

Run this on a fresh Debian/Ubuntu VPS after pointing your domain to the server:

```bash
curl -fsSL https://raw.githubusercontent.com/TzeY11/bill-pilot/main/scripts/install-vps.sh | sudo bash -s -- --domain bill-pilot.example.com
```

Replace `bill-pilot.example.com` with your real domain. The installer will install system dependencies, install Node.js 22 if needed, clone Bill Pilot into `/opt/bill-pilot`, generate `.env`, build the app, create a systemd service, and configure Caddy with HTTPS.

### Requirements

- A Linux VPS with SSH access
- A domain name pointed to the VPS
- Node.js 22+ or 24+
- npm
- Git
- Caddy for reverse proxy and HTTPS

### Install Dependencies

```bash
sudo apt update
sudo apt install -y git curl caddy
```

Install Node.js 22+ or 24+. For example, with NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

### Create an App User

```bash
sudo useradd --system --create-home --shell /bin/bash bill-pilot
sudo mkdir -p /opt/bill-pilot
sudo chown bill-pilot:bill-pilot /opt/bill-pilot
```

### Clone the Project

```bash
sudo -u bill-pilot git clone https://github.com/TzeY11/bill-pilot.git /opt/bill-pilot
cd /opt/bill-pilot
```

### Configure Environment Variables

```bash
sudo -u bill-pilot cp .env.example .env
sudo -u bill-pilot nano .env
```

Set at least:

```env
AUTH_SECRET="replace-with-a-random-secret-at-least-32-characters"
DATABASE_FILE="data/bill-pilot.db"
```

Generate a strong `AUTH_SECRET` with:

```bash
openssl rand -base64 32
```

### Install and Build

```bash
sudo -u bill-pilot npm install
sudo -u bill-pilot npm run build
```

### Run with systemd

Create the service file:

```bash
sudo nano /etc/systemd/system/bill-pilot.service
```

Paste:

```ini
[Unit]
Description=Bill Pilot
After=network.target

[Service]
Type=simple
User=bill-pilot
Group=bill-pilot
WorkingDirectory=/opt/bill-pilot
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Start the app:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now bill-pilot
sudo systemctl status bill-pilot
```

Check logs:

```bash
sudo journalctl -u bill-pilot -f
```

### Configure Caddy and HTTPS

Edit Caddy:

```bash
sudo nano /etc/caddy/Caddyfile
```

Use your real domain:

```caddyfile
bill-pilot.example.com {
  reverse_proxy 127.0.0.1:3000
}
```

Reload Caddy:

```bash
sudo systemctl reload caddy
```

Caddy will request and renew HTTPS certificates automatically as long as the domain points to your VPS and ports 80/443 are reachable.

### First Login

Open your domain:

```txt
https://bill-pilot.example.com
```

Register the first account from the web UI.

### Data and Backups

The default SQLite account database is:

```txt
/opt/bill-pilot/data/bill-pilot.db
```

Create a backup directory:

```bash
sudo mkdir -p /opt/bill-pilot/backups
sudo chown bill-pilot:bill-pilot /opt/bill-pilot/backups
```

Back up the database:

```bash
sudo -u bill-pilot cp /opt/bill-pilot/data/bill-pilot.db /opt/bill-pilot/backups/bill-pilot-$(date +%F).db
```

Restore a backup:

```bash
sudo systemctl stop bill-pilot
sudo -u bill-pilot cp /opt/bill-pilot/backups/bill-pilot-YYYY-MM-DD.db /opt/bill-pilot/data/bill-pilot.db
sudo systemctl start bill-pilot
```

Important: service/subscription records are currently stored in browser localStorage, not in the SQLite database. The SQLite backup protects user accounts, but it does not yet back up service records.

### Upgrade

Back up the database first, then run:

```bash
cd /opt/bill-pilot
sudo -u bill-pilot git pull
sudo -u bill-pilot npm install
sudo -u bill-pilot npm run build
sudo systemctl restart bill-pilot
```

### Troubleshooting

- `AUTH_SECRET` must be set and at least 32 characters long.
- Node.js must be version 22+ or 24+.
- `/opt/bill-pilot/data` must be writable by the `bill-pilot` user.
- Check logs with `sudo journalctl -u bill-pilot -f`.
- Make sure Caddy can reach `127.0.0.1:3000`.

Installer script: [scripts/install-vps.sh](./scripts/install-vps.sh).

For the standalone deployment document, see [docs/deployment-vps.md](./docs/deployment-vps.md).

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

Good next steps would be moving services into SQLite/PostgreSQL, then adding Docker support and automated backups.
