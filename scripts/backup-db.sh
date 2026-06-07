#!/usr/bin/env bash

set -Eeuo pipefail

APP_DIR="${BILL_PILOT_APP_DIR:-/opt/bill-pilot}"
DATABASE_FILE="${BILL_PILOT_DATABASE_FILE:-}"
BACKUP_DIR="${BILL_PILOT_BACKUP_DIR:-}"
KEEP_DAYS="${BILL_PILOT_BACKUP_KEEP_DAYS:-30}"

usage() {
  cat <<'EOF'
Back up the Bill Pilot SQLite database.

Usage:
  sudo bash scripts/backup-db.sh

Options:
  --app-dir PATH       Bill Pilot app directory. Default: /opt/bill-pilot
  --database PATH      SQLite database path. Defaults to DATABASE_FILE from .env.
  --backup-dir PATH    Backup directory. Default: APP_DIR/backups
  --keep-days DAYS     Delete backups older than DAYS. Default: 30
  -h, --help           Show this help.

Environment variables:
  BILL_PILOT_APP_DIR
  BILL_PILOT_DATABASE_FILE
  BILL_PILOT_BACKUP_DIR
  BILL_PILOT_BACKUP_KEEP_DAYS
EOF
}

die() {
  printf '[bill-pilot-backup] ERROR: %s\n' "$*" >&2
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --app-dir)
      APP_DIR="${2:-}"
      shift 2
      ;;
    --database)
      DATABASE_FILE="${2:-}"
      shift 2
      ;;
    --backup-dir)
      BACKUP_DIR="${2:-}"
      shift 2
      ;;
    --keep-days)
      KEEP_DAYS="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      die "Unknown option: $1"
      ;;
  esac
done

[[ -n "$APP_DIR" ]] || die "App directory cannot be empty."
[[ "$KEEP_DAYS" =~ ^[0-9]+$ ]] || die "--keep-days must be a number."

env_database_file() {
  local env_file="$APP_DIR/.env"
  [[ -f "$env_file" ]] || return 0

  awk -F= '
    /^DATABASE_FILE=/ {
      value = substr($0, index($0, "=") + 1)
    }
    END {
      gsub(/^["'\''"]|["'\''"]$/, "", value)
      print value
    }
  ' "$env_file"
}

if [[ -z "$DATABASE_FILE" ]]; then
  DATABASE_FILE="$(env_database_file)"
fi

if [[ -z "$DATABASE_FILE" ]]; then
  DATABASE_FILE="data/bill-pilot.db"
fi

if [[ "$DATABASE_FILE" = /* ]]; then
  DB_PATH="$DATABASE_FILE"
else
  DB_PATH="$APP_DIR/$DATABASE_FILE"
fi

if [[ -z "$BACKUP_DIR" ]]; then
  BACKUP_DIR="$APP_DIR/backups"
fi

[[ -f "$DB_PATH" ]] || die "Database not found: $DB_PATH"

mkdir -p "$BACKUP_DIR"

timestamp="$(date +%Y%m%d-%H%M%S)"
backup_file="$BACKUP_DIR/bill-pilot-$timestamp.db"
tmp_file="$backup_file.tmp"

if command -v sqlite3 >/dev/null 2>&1; then
  sqlite3 "$DB_PATH" ".backup '$tmp_file'"
else
  cp "$DB_PATH" "$tmp_file"
fi

mv "$tmp_file" "$backup_file"
chmod 600 "$backup_file"

if [[ "$KEEP_DAYS" -gt 0 ]]; then
  find "$BACKUP_DIR" -name 'bill-pilot-*.db' -type f -mtime +"$KEEP_DAYS" -delete
fi

printf 'Backup created:\n  %s\n' "$backup_file"
