# Deploy Bill Pilot to a Server

[English](./deployment-server.md) | [简体中文](./deployment-server.zh-CN.md) | [繁體中文](./deployment-server.zh-TW.md)

This guide shows one practical way to run Bill Pilot on a Linux server with Node.js, systemd, Caddy, and HTTPS. It works for VPS, VDS, dedicated servers, and homelab machines that run Debian or Ubuntu.

Bill Pilot stores user accounts and service/subscription records in SQLite on the server. If you upgrade from an older localStorage-based version, existing browser service data is imported into SQLite the first time the account opens the app.

## One-command Install

Run this on a fresh Debian/Ubuntu server after pointing your domain to it:

```bash
curl -fsSL https://raw.githubusercontent.com/TzeY11/bill-pilot/main/scripts/install-vps.sh -o install-vps.sh
sudo bash install-vps.sh
```

The installer will ask for your domain name. Before running it, create a DNS `A` record for your domain that points to your server IP address. This is usually done in Cloudflare, your domain registrar, or whichever DNS provider manages your domain.

The installer will install system dependencies, install Node.js 22 if needed, clone Bill Pilot into `/opt/bill-pilot`, generate `.env`, build the app, create a systemd service, and configure Caddy with HTTPS.

Installer options:

```bash
curl -fsSL https://raw.githubusercontent.com/TzeY11/bill-pilot/main/scripts/install-vps.sh -o install-vps.sh
sudo bash install-vps.sh --help
```

## Requirements

- A Debian/Ubuntu Linux server with SSH access
- A domain name with an `A` record pointed to the server IP address
- Node.js 22+ or 24+
- npm
- Git
- Caddy for reverse proxy and HTTPS

The examples below use Ubuntu/Debian-style commands. Adjust package manager commands for your distribution.

## DNS Setup

Before running the installer, create a DNS record for the domain you want to use:

```txt
Type: A
Name: bill-pilot
Value: your server IPv4 address
Proxy: DNS only is recommended until the first install succeeds
```

For example, if your domain is `example.com`, this creates `bill-pilot.example.com`.

If you use Cloudflare, this is done in the DNS records page. Bill Pilot cannot automatically change Cloudflare DNS unless you build a separate Cloudflare API integration with your own API token.

## Install Runtime Dependencies

```bash
sudo apt update
sudo apt install -y git curl caddy
```

Install Node.js 22+ or 24+ from your preferred source. For example, with NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

## Create an App User

Running the app as a dedicated user keeps the deployment easier to manage.

```bash
sudo useradd --system --create-home --shell /bin/bash bill-pilot
sudo mkdir -p /opt/bill-pilot
sudo chown bill-pilot:bill-pilot /opt/bill-pilot
```

## Clone the Project

```bash
sudo -u bill-pilot git clone https://github.com/TzeY11/bill-pilot.git /opt/bill-pilot
cd /opt/bill-pilot
```

## Configure Environment Variables

Create the production environment file:

```bash
sudo -u bill-pilot cp .env.example .env
sudo -u bill-pilot nano .env
```

Set at least these values:

```env
AUTH_SECRET="replace-with-a-random-secret-at-least-32-characters"
DATABASE_FILE="data/bill-pilot.db"
```

`AUTH_SECRET` must be at least 32 characters. Generate a strong value with:

```bash
openssl rand -base64 32
```

### Environment Variable Reference

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `AUTH_SECRET` | Yes | None | Secret used to sign session cookies. Use at least 32 characters. |
| `DATABASE_FILE` | No | `data/bill-pilot.db` | SQLite database path. Relative paths are resolved from the app directory. |
| `PORT` | No | `3000` | Local port used by `next start` and the systemd service. |
| `NODE_ENV` | No | `production` in systemd | Runtime mode for the Next.js app. |
| `BILL_PILOT_DOMAIN` | No | None | Optional installer input for the public domain. If omitted, the installer prompts for it. |
| `BILL_PILOT_PORT` | No | `3000` | Optional installer input for the local app port. |
| `BILL_PILOT_APP_DIR` | No | `/opt/bill-pilot` | Optional backup script app directory override. |
| `BILL_PILOT_DATABASE_FILE` | No | From `.env` | Optional backup script database path override. |
| `BILL_PILOT_BACKUP_DIR` | No | `/opt/bill-pilot/backups` | Optional backup directory override. |
| `BILL_PILOT_BACKUP_KEEP_DAYS` | No | `30` | Number of days to keep old database backups. |

Registration restriction and login/register rate limiting are planned for a later security pass.

## Install and Build

```bash
sudo -u bill-pilot npm install
sudo -u bill-pilot npm run build
```

## Run with systemd

Create a systemd service:

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

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now bill-pilot
sudo systemctl status bill-pilot
```

Check logs:

```bash
sudo journalctl -u bill-pilot -f
```

## Configure Caddy and HTTPS

Edit the Caddyfile:

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

Caddy will request and renew HTTPS certificates automatically as long as the domain points to your server and ports 80/443 are reachable.

## First Login

Open your domain in a browser:

```txt
https://bill-pilot.example.com
```

Register the first account from the web UI.

## Data and Backups

The default SQLite database is:

```txt
/opt/bill-pilot/data/bill-pilot.db
```

Back up the database:

```bash
sudo bash /opt/bill-pilot/scripts/backup-db.sh
```

Restore a backup by stopping the app, copying the backup over the database file, then starting the app again:

```bash
sudo systemctl stop bill-pilot
sudo -u bill-pilot cp /opt/bill-pilot/backups/bill-pilot-YYYYMMDD-HHMMSS.db /opt/bill-pilot/data/bill-pilot.db
sudo systemctl start bill-pilot
```

This database contains user accounts and service/subscription records. Backing it up protects the main application data.

## Upgrade

Use the upgrade script:

```bash
sudo bash /opt/bill-pilot/scripts/upgrade-server.sh
```

The upgrade script backs up the database, pulls the latest code, installs dependencies, rebuilds the app, and restarts the systemd service.

Watch the logs after restarting:

```bash
sudo journalctl -u bill-pilot -f
```

## Troubleshooting

If the app fails to start, check:

- `AUTH_SECRET` is set and at least 32 characters long.
- Node.js is version 22+ or 24+.
- `/opt/bill-pilot/data` is writable by the `bill-pilot` user.
- The service logs with `sudo journalctl -u bill-pilot -f`.
- Caddy can reach `127.0.0.1:3000`.
