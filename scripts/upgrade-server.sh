#!/usr/bin/env bash

set -Eeuo pipefail

APP_NAME="bill-pilot"
APP_USER="bill-pilot"
APP_DIR="/opt/bill-pilot"
BRANCH="main"
SKIP_BACKUP="0"
BACKUP_KEEP_DAYS="${BILL_PILOT_BACKUP_KEEP_DAYS:-30}"

log() {
  printf '\n[%s-upgrade] %s\n' "$APP_NAME" "$*"
}

die() {
  printf '\n[%s-upgrade] ERROR: %s\n' "$APP_NAME" "$*" >&2
  exit 1
}

usage() {
  cat <<'EOF'
Upgrade a Bill Pilot server installation.

Usage:
  sudo bash /opt/bill-pilot/scripts/upgrade-server.sh

Options:
  --app-dir PATH       App directory. Default: /opt/bill-pilot
  --app-user USER      App system user. Default: bill-pilot
  --service NAME       systemd service name. Default: bill-pilot
  --branch BRANCH      Git branch to pull. Default: main
  --skip-backup        Do not create a database backup before upgrading.
  --keep-days DAYS     Backup retention in days. Default: 30
  -h, --help           Show this help.

Environment variables:
  BILL_PILOT_BACKUP_KEEP_DAYS
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --app-dir)
      APP_DIR="${2:-}"
      shift 2
      ;;
    --app-user)
      APP_USER="${2:-}"
      shift 2
      ;;
    --service)
      APP_NAME="${2:-}"
      shift 2
      ;;
    --branch)
      BRANCH="${2:-}"
      shift 2
      ;;
    --skip-backup)
      SKIP_BACKUP="1"
      shift
      ;;
    --keep-days)
      BACKUP_KEEP_DAYS="${2:-}"
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

[[ "$(id -u)" == "0" ]] || die "Run this upgrade script as root, for example with sudo."
[[ -n "$APP_DIR" ]] || die "App directory cannot be empty."
[[ -n "$APP_USER" ]] || die "App user cannot be empty."
[[ -n "$APP_NAME" ]] || die "Service name cannot be empty."
[[ -n "$BRANCH" ]] || die "Branch cannot be empty."
[[ "$BACKUP_KEEP_DAYS" =~ ^[0-9]+$ ]] || die "--keep-days must be a number."
[[ -d "$APP_DIR/.git" ]] || die "$APP_DIR is not a Git checkout."

run_as_app() {
  runuser -u "$APP_USER" -- "$@"
}

backup_database() {
  local backup_script="$APP_DIR/scripts/backup-db.sh"

  if [[ "$SKIP_BACKUP" == "1" ]]; then
    log "Skipping database backup"
    return
  fi

  [[ -f "$backup_script" ]] || die "Backup script not found: $backup_script"

  log "Backing up database"
  bash "$backup_script" --app-dir "$APP_DIR" --keep-days "$BACKUP_KEEP_DAYS"
}

pull_latest_code() {
  log "Pulling latest code from origin/$BRANCH"
  run_as_app git -C "$APP_DIR" fetch origin "$BRANCH"
  run_as_app git -C "$APP_DIR" checkout "$BRANCH"
  run_as_app git -C "$APP_DIR" pull --ff-only origin "$BRANCH"
}

install_and_build() {
  log "Installing dependencies"
  if [[ -f "$APP_DIR/package-lock.json" ]]; then
    run_as_app npm --prefix "$APP_DIR" ci
  else
    run_as_app npm --prefix "$APP_DIR" install
  fi

  log "Building app"
  run_as_app npm --prefix "$APP_DIR" run build
}

restart_service() {
  log "Restarting systemd service"
  systemctl restart "$APP_NAME"
  systemctl --no-pager --lines=20 status "$APP_NAME"
}

backup_database
pull_latest_code
install_and_build
restart_service

cat <<EOF

Bill Pilot upgrade complete.

Useful commands:
  sudo systemctl status $APP_NAME
  sudo journalctl -u $APP_NAME -f
EOF
