# Bill Pilot

[![English](https://img.shields.io/badge/lang-English-blue.svg)](./README.md)
[![简体中文](https://img.shields.io/badge/lang-%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87-red.svg)](./README.zh-CN.md)

Bill Pilot is a VPS-focused self-hosted billing and renewal dashboard for servers, domains, memberships, software, game servers, and recurring subscriptions.

It is designed to run on your own VPS with a domain name and HTTPS, keeping renewal dates and recurring costs visible in one private dashboard.

## Features

- Dashboard for estimated monthly and annual spend
- Upcoming renewals within 3 and 14 days
- Service inventory with search, filters, sorting, and responsive views
- Add, edit, and delete recurring services
- Light, dark, and system theme modes
- Display currency selector with cached exchange rates
- Built-in service icons and custom icon uploads
- Email/password accounts with protected pages

## One-command VPS Install

Point your domain to a fresh Debian/Ubuntu VPS, then run:

```bash
curl -fsSL https://raw.githubusercontent.com/TzeY11/bill-pilot/main/scripts/install-vps.sh -o install-vps.sh
sudo bash install-vps.sh
```

The installer will ask for your domain name. Before running it, create a DNS `A` record for your domain that points to your VPS IP address.

The installer will:

- Install system dependencies and Node.js 22 if needed
- Clone Bill Pilot into `/opt/bill-pilot`
- Generate `.env` with a strong `AUTH_SECRET`
- Build the app
- Create a systemd service
- Configure Caddy with HTTPS

Useful installer options:

```bash
curl -fsSL https://raw.githubusercontent.com/TzeY11/bill-pilot/main/scripts/install-vps.sh -o install-vps.sh
sudo bash install-vps.sh --help
```

Full deployment guide: [docs/deployment-vps.md](./docs/deployment-vps.md)

## Data

User accounts are stored in SQLite:

```txt
data/bill-pilot.db
```

Service/subscription records are currently stored in browser localStorage:

```txt
bill-pilot-services
```

Important: database backups protect user accounts, but they do not yet back up service records. Moving service records from localStorage into SQLite is the next major backend milestone.

## Configuration

Copy `.env.example` to `.env` and set:

```env
AUTH_SECRET="replace-with-a-random-secret-at-least-32-characters"
DATABASE_FILE="data/bill-pilot.db"
```

`AUTH_SECRET` must be at least 32 characters.

## Documentation

- [VPS deployment](./docs/deployment-vps.md)
- [Installer script](./scripts/install-vps.sh)

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- SQLite via Node's native `node:sqlite`
- bcryptjs
- jose
- react-icons / Simple Icons
