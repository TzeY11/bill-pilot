# Contributing

Thanks for your interest in Bill Pilot.

Bill Pilot is a self-hosted billing and renewal dashboard designed for Linux servers, including VPS, VDS, dedicated servers, and homelab machines.

## Development Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Set a local `AUTH_SECRET` with at least 32 characters:

```env
AUTH_SECRET="replace-with-a-random-secret-at-least-32-characters"
DATABASE_FILE="data/bill-pilot.db"
```

## Useful Commands

```bash
npm run build
npm run lint
bash -n scripts/install-vps.sh
bash -n scripts/backup-db.sh
bash -n scripts/upgrade-server.sh
```

## Pull Requests

Before opening a pull request:

- Keep changes focused.
- Use English for application UI copy.
- Run `npm run build`.
- Run script syntax checks when changing shell scripts.
- Update README or deployment docs when user-facing setup changes.
- Do not commit `.env`, `data/bill-pilot.db`, `.next`, `node_modules`, backups, secrets, tokens, or local cookies.

## Security

Do not disclose security vulnerabilities in public issues. See [SECURITY.md](./SECURITY.md).
