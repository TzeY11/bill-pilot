#!/usr/bin/env bash

set -Eeuo pipefail

APP_NAME="bill-pilot"
APP_USER="bill-pilot"
APP_DIR="/opt/bill-pilot"
REPO_URL="https://github.com/TzeY11/bill-pilot.git"
BRANCH="main"
DOMAIN="${BILL_PILOT_DOMAIN:-}"
PORT="${BILL_PILOT_PORT:-3000}"
INSTALL_CADDY="1"

log() {
  printf '\n[%s] %s\n' "$APP_NAME" "$*"
}

die() {
  printf '\n[%s] ERROR: %s\n' "$APP_NAME" "$*" >&2
  exit 1
}

usage() {
  cat <<'EOF'
Install Bill Pilot on a Debian/Ubuntu VPS.

Usage:
  sudo bash install-vps.sh --domain bill-pilot.example.com

Options:
  --domain DOMAIN        Public domain for the app. Required unless BILL_PILOT_DOMAIN is set.
  --app-dir PATH         Install directory. Default: /opt/bill-pilot
  --port PORT            Local app port. Default: 3000
  --repo URL             Git repository URL. Default: https://github.com/TzeY11/bill-pilot.git
  --branch BRANCH        Git branch. Default: main
  --skip-caddy           Do not install or configure Caddy.
  -h, --help             Show this help.

Example:
  curl -fsSL https://raw.githubusercontent.com/TzeY11/bill-pilot/main/scripts/install-vps.sh | sudo bash -s -- --domain bill-pilot.example.com
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --domain)
      DOMAIN="${2:-}"
      shift 2
      ;;
    --app-dir)
      APP_DIR="${2:-}"
      shift 2
      ;;
    --port)
      PORT="${2:-}"
      shift 2
      ;;
    --repo)
      REPO_URL="${2:-}"
      shift 2
      ;;
    --branch)
      BRANCH="${2:-}"
      shift 2
      ;;
    --skip-caddy)
      INSTALL_CADDY="0"
      shift
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

[[ "$(id -u)" == "0" ]] || die "Run this installer as root, for example with sudo."
[[ -n "$DOMAIN" ]] || die "Missing --domain. Example: --domain bill-pilot.example.com"
[[ "$DOMAIN" != *"://"* && "$DOMAIN" != *"/"* ]] || die "Use a bare domain, not a URL. Example: bill-pilot.example.com"
[[ "$PORT" =~ ^[0-9]+$ ]] || die "--port must be a number."
[[ -d "$(dirname "$APP_DIR")" ]] || die "Parent directory does not exist: $(dirname "$APP_DIR")"

if ! command -v apt-get >/dev/null 2>&1; then
  die "This installer currently supports Debian/Ubuntu systems with apt-get."
fi

export DEBIAN_FRONTEND=noninteractive

run_as_app() {
  runuser -u "$APP_USER" -- "$@"
}

node_major_version() {
  if command -v node >/dev/null 2>&1; then
    node --version | sed -E 's/^v([0-9]+).*/\1/'
  else
    printf '0'
  fi
}

ensure_system_packages() {
  log "Installing system packages"
  apt-get update
  apt-get install -y ca-certificates curl git openssl

  if [[ "$INSTALL_CADDY" == "1" ]]; then
    apt-get install -y caddy
  fi
}

ensure_node() {
  local major
  major="$(node_major_version)"

  if [[ "$major" -ge 22 ]]; then
    log "Node.js $(node --version) is already installed"
    return
  fi

  log "Installing Node.js 22"
  curl -fsSL https://deb.nodesource.com/setup_22.x -o /tmp/bill-pilot-nodesource.sh
  bash /tmp/bill-pilot-nodesource.sh
  apt-get install -y nodejs

  major="$(node_major_version)"
  [[ "$major" -ge 22 ]] || die "Node.js 22+ is required, but installed version is $(node --version)."
}

ensure_app_user() {
  log "Creating app user and directory"

  if ! id -u "$APP_USER" >/dev/null 2>&1; then
    useradd --system --create-home --shell /bin/bash "$APP_USER"
  fi

  mkdir -p "$APP_DIR"
  chown "$APP_USER:$APP_USER" "$APP_DIR"
}

checkout_project() {
  log "Installing project from $REPO_URL"

  if [[ -d "$APP_DIR/.git" ]]; then
    run_as_app git -C "$APP_DIR" fetch origin "$BRANCH"
    run_as_app git -C "$APP_DIR" checkout "$BRANCH"
    run_as_app git -C "$APP_DIR" pull --ff-only origin "$BRANCH"
    return
  fi

  if [[ -n "$(find "$APP_DIR" -mindepth 1 -maxdepth 1 -print -quit)" ]]; then
    die "$APP_DIR is not empty and is not a Git checkout. Move it away or choose --app-dir."
  fi

  run_as_app git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
}

configure_env() {
  local env_file="$APP_DIR/.env"
  local auth_secret
  auth_secret="$(openssl rand -base64 32)"

  log "Configuring environment"

  if [[ ! -f "$env_file" ]]; then
    cat > "$env_file" <<EOF
AUTH_SECRET="$auth_secret"
DATABASE_FILE="data/bill-pilot.db"
EOF
  else
    if ! grep -q '^AUTH_SECRET=' "$env_file"; then
      printf '\nAUTH_SECRET="%s"\n' "$auth_secret" >> "$env_file"
    elif grep -q 'replace-with' "$env_file"; then
      sed -i "s|^AUTH_SECRET=.*|AUTH_SECRET=\"$auth_secret\"|" "$env_file"
    fi

    if ! grep -q '^DATABASE_FILE=' "$env_file"; then
      printf 'DATABASE_FILE="data/bill-pilot.db"\n' >> "$env_file"
    fi
  fi

  mkdir -p "$APP_DIR/data"
  chown -R "$APP_USER:$APP_USER" "$APP_DIR/.env" "$APP_DIR/data"
  chmod 600 "$APP_DIR/.env"
}

install_and_build() {
  log "Installing npm dependencies and building app"

  if [[ -f "$APP_DIR/package-lock.json" ]]; then
    run_as_app npm --prefix "$APP_DIR" ci
  else
    run_as_app npm --prefix "$APP_DIR" install
  fi

  run_as_app npm --prefix "$APP_DIR" run build
}

configure_systemd() {
  local npm_bin
  npm_bin="$(command -v npm)"

  log "Configuring systemd service"

  cat > "/etc/systemd/system/${APP_NAME}.service" <<EOF
[Unit]
Description=Bill Pilot
After=network.target

[Service]
Type=simple
User=$APP_USER
Group=$APP_USER
WorkingDirectory=$APP_DIR
Environment=NODE_ENV=production
Environment=PORT=$PORT
ExecStart=$npm_bin run start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

  systemctl daemon-reload
  systemctl enable --now "$APP_NAME"
  systemctl restart "$APP_NAME"
}

configure_caddy() {
  local caddyfile="/etc/caddy/Caddyfile"
  local tmpfile

  [[ "$INSTALL_CADDY" == "1" ]] || return

  log "Configuring Caddy for $DOMAIN"
  touch "$caddyfile"
  tmpfile="$(mktemp)"

  awk '
    /^# Bill Pilot: start$/ { skip = 1; next }
    /^# Bill Pilot: end$/ { skip = 0; next }
    skip != 1 { print }
  ' "$caddyfile" > "$tmpfile"

  cat >> "$tmpfile" <<EOF

# Bill Pilot: start
$DOMAIN {
  reverse_proxy 127.0.0.1:$PORT
}
# Bill Pilot: end
EOF

  mv "$tmpfile" "$caddyfile"
  caddy fmt --overwrite "$caddyfile" >/dev/null 2>&1 || true
  systemctl enable --now caddy
  systemctl reload caddy || systemctl restart caddy
}

print_summary() {
  cat <<EOF

Bill Pilot is installed.

URL:
  https://$DOMAIN

App directory:
  $APP_DIR

Database:
  $APP_DIR/data/bill-pilot.db

Useful commands:
  sudo systemctl status $APP_NAME
  sudo journalctl -u $APP_NAME -f
  sudo systemctl restart $APP_NAME

Notes:
  Make sure your domain points to this VPS and ports 80/443 are open.
  Service/subscription records are currently stored in browser localStorage, not in SQLite.
EOF
}

ensure_system_packages
ensure_node
ensure_app_user
checkout_project
configure_env
install_and_build
configure_systemd
configure_caddy
print_summary
