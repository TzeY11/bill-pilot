# Bill Pilot

Choose your language:

- [English](./README.en.md)
- [简体中文](./README.zh-CN.md)

## Self-hosting on a VPS

This is the recommended production path for running Bill Pilot on your own VPS.

Bill Pilot currently stores user accounts in SQLite on the server, while service/subscription records are still stored in each user's browser localStorage. Back up the SQLite database for account data, and export browser data manually until service records are moved into the backend.

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

For the standalone deployment document, see [docs/deployment-vps.md](./docs/deployment-vps.md).
