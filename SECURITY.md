# Security Policy

Bill Pilot is self-hosted software for personal billing and renewal tracking.

## Reporting a Vulnerability

Please do not open a public issue for security vulnerabilities.

Report security concerns by contacting the maintainer through GitHub:

- Repository: https://github.com/TzeY11/bill-pilot
- Maintainer: TzeY11

Include:

- A clear description of the issue
- Steps to reproduce
- Affected version or commit
- Any relevant logs, screenshots, or proof of concept details

The maintainer will review the report and coordinate a fix when appropriate.

## Supported Versions

Security fixes are expected to target the latest `main` branch unless a release process is added later.

## Deployment Notes

For public self-hosted deployments:

- Use HTTPS.
- Keep `AUTH_SECRET` private and at least 32 characters long.
- Back up `data/bill-pilot.db` regularly.
- Keep the server and Node.js runtime updated.
- Restrict access to `.env`, database files, backups, and server logs.

Registration restriction and login/register rate limiting are planned but not implemented yet.
