#!/usr/bin/env bash
# Fellowship Hub — one-shot installer for a fresh Hostinger VPS (Ubuntu 22.04 / 24.04).
#
# Usage (as root, from the unpacked bundle folder):
#   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='choose-one' bash deploy/install.sh
# Optional:
#   DOMAIN=example.com   (default: the VPS hostname, e.g. srv123456.hstgr.cloud)
#   CERT_EMAIL=you@example.com  (for Let's Encrypt; defaults to ADMIN_EMAIL)
#
# Safe to re-run: it updates the code and rebuilds, but only imports the original
# content the first time (when the teachings table is empty). Uploaded files and the
# database are kept between runs.
set -euo pipefail

APP_NAME=fellowship-hub
APP_DIR=/opt/$APP_NAME
DATA_DIR=/var/lib/$APP_NAME
ENV_FILE=/etc/$APP_NAME.env
APP_USER=fellowship
PORT="${APP_PORT:-5000}"
SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOMAIN="${DOMAIN:-$(hostname -f)}"
CERT_EMAIL="${CERT_EMAIL:-${ADMIN_EMAIL:-}}"

say() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
[ "$(id -u)" = 0 ] || { echo "Run as root"; exit 1; }

say "Installing system packages (Node.js 22, PostgreSQL, nginx, certbot)"
if command -v apt-get >/dev/null; then
  OS_FAMILY=debian
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -y
  apt-get install -y ca-certificates curl gnupg rsync git openssl postgresql nginx certbot python3-certbot-nginx
  if ! command -v node >/dev/null || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs
  fi
  NOLOGIN=/usr/sbin/nologin
elif command -v dnf >/dev/null; then
  # AlmaLinux / Rocky / RHEL 9
  OS_FAMILY=rhel
  dnf install -y epel-release
  dnf module reset -y postgresql || true
  dnf module enable -y postgresql:16 || true
  dnf install -y curl rsync git openssl tar postgresql-server postgresql nginx certbot python3-certbot-nginx policycoreutils-python-utils
  if ! command -v node >/dev/null || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]; then
    curl -fsSL https://rpm.nodesource.com/setup_22.x | bash -
    dnf install -y nodejs
  fi
  if [ ! -f /var/lib/pgsql/data/PG_VERSION ]; then
    postgresql-setup --initdb
  fi
  # RHEL defaults local TCP logins to "ident"; the app logs in with a password
  sed -ri 's/^(host\s+all\s+all\s+(127\.0\.0\.1\/32|::1\/128)\s+)ident/\1scram-sha-256/' /var/lib/pgsql/data/pg_hba.conf
  grep -q "^password_encryption" /var/lib/pgsql/data/postgresql.conf || echo "password_encryption = scram-sha-256" >> /var/lib/pgsql/data/postgresql.conf
  systemctl restart postgresql || true
  NOLOGIN=/sbin/nologin
else
  echo "Unsupported OS (need apt or dnf)"; exit 1
fi
systemctl enable --now postgresql nginx

say "Creating app user and folders"
id -u $APP_USER >/dev/null 2>&1 || useradd --system --create-home --shell $NOLOGIN $APP_USER
mkdir -p "$APP_DIR" "$DATA_DIR/uploads"

say "Setting up database and secrets"
if [ ! -f "$ENV_FILE" ]; then
  DB_PASS=$(openssl rand -hex 24)
  sudo -u postgres psql -v ON_ERROR_STOP=1 -q <<SQL
DO \$\$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'fellowship') THEN
    CREATE ROLE fellowship LOGIN PASSWORD '$DB_PASS';
  ELSE
    ALTER ROLE fellowship PASSWORD '$DB_PASS';
  END IF;
END \$\$;
SQL
  sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='fellowship'" | grep -q 1 \
    || sudo -u postgres createdb -O fellowship fellowship
  sudo -u postgres psql -q -c "ALTER DATABASE fellowship OWNER TO fellowship"
  sudo -u postgres psql -q -d fellowship -c "ALTER SCHEMA public OWNER TO fellowship"
  cat > "$ENV_FILE" <<ENV
NODE_ENV=production
PORT=$PORT
DATABASE_URL=postgres://fellowship:$DB_PASS@127.0.0.1:5432/fellowship
SESSION_SECRET=$(openssl rand -hex 32)
UPLOADS_DIR=$DATA_DIR/uploads
COOKIE_SECURE=true
ENV
  chmod 600 "$ENV_FILE"
fi

say "Copying application code"
rsync -a --delete --exclude node_modules --exclude dist --exclude .git "$SRC_DIR"/ "$APP_DIR"/
# Original uploaded files (never overwrite newer uploads)
cp -n "$SRC_DIR"/deploy/media/public-objects/* "$DATA_DIR/uploads/" 2>/dev/null || true
chown -R $APP_USER:$APP_USER "$APP_DIR" "$DATA_DIR"

say "Installing dependencies and building"
cd "$APP_DIR"
sudo -u $APP_USER -H npm ci --no-audit --no-fund
sudo -u $APP_USER -H npm run build

say "Creating database tables"
set -a; . "$ENV_FILE"; set +a
sudo -u $APP_USER -H --preserve-env=DATABASE_URL npx drizzle-kit push --force

if [ "$(sudo -u postgres psql -d fellowship -tAc 'SELECT count(*) FROM teachings')" = "0" ]; then
  say "Importing original site content"
  sudo -u $APP_USER -H --preserve-env=DATABASE_URL npx tsx script/import-content.ts deploy/content
fi

if [ -n "${ADMIN_EMAIL:-}" ] && [ -n "${ADMIN_PASSWORD:-}" ]; then
  say "Creating admin account $ADMIN_EMAIL"
  sudo -u $APP_USER -H --preserve-env=DATABASE_URL npx tsx script/create-admin.ts "$ADMIN_EMAIL" "$ADMIN_PASSWORD"
fi

say "Configuring the app service"
cat > /etc/systemd/system/$APP_NAME.service <<UNIT
[Unit]
Description=Fellowship Hub
After=network.target postgresql.service

[Service]
User=$APP_USER
WorkingDirectory=$APP_DIR
EnvironmentFile=$ENV_FILE
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable $APP_NAME
systemctl restart $APP_NAME

say "Configuring nginx for $DOMAIN"
if [ "$OS_FAMILY" = debian ]; then NGINX_CONF=/etc/nginx/sites-available/$APP_NAME; else NGINX_CONF=/etc/nginx/conf.d/$APP_NAME.conf; fi
cat > "$NGINX_CONF" <<NGINX
server {
    listen 80;
    server_name $DOMAIN;
    client_max_body_size 100m;

    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 3600s;
    }
}
NGINX
if [ "$OS_FAMILY" = debian ]; then
  ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/$APP_NAME
  rm -f /etc/nginx/sites-enabled/default
else
  # let nginx proxy to the app under SELinux, and open the firewall
  command -v setsebool >/dev/null && setsebool -P httpd_can_network_connect 1 || true
  if systemctl is-active --quiet firewalld; then
    firewall-cmd --permanent --add-service=http --add-service=https && firewall-cmd --reload
  fi
fi
nginx -t && systemctl reload nginx

if command -v ufw >/dev/null && ufw status | grep -q active; then
  ufw allow 'Nginx Full' || true
fi

say "Setting up voice relay (TURN) for voice channels"
# Lets voice chat connect for people behind strict networks (mobile carriers, offices).
if [ "$OS_FAMILY" = debian ]; then
  TURN_CONF=/etc/turnserver.conf
  HAD_COTURN=$(dpkg -s coturn >/dev/null 2>&1 && echo yes || echo no)
  apt-get install -y coturn
  sed -i 's/^#\?TURNSERVER_ENABLED=.*/TURNSERVER_ENABLED=1/' /etc/default/coturn 2>/dev/null || true
else
  TURN_CONF=/etc/coturn/turnserver.conf
  HAD_COTURN=$(rpm -q coturn >/dev/null 2>&1 && echo yes || echo no)
  dnf install -y coturn
fi
if [ "$HAD_COTURN" = yes ] && [ -f "$TURN_CONF" ] && ! grep -q "managed by fellowship-hub" "$TURN_CONF"; then
  echo "coturn was already configured on this server for something else; leaving it alone (voice will use STUN only)."
else
  grep -q '^TURN_SECRET=' "$ENV_FILE" || echo "TURN_SECRET=$(openssl rand -hex 32)" >> "$ENV_FILE"
  if grep -q '^TURN_HOST=' "$ENV_FILE"; then sed -i "s/^TURN_HOST=.*/TURN_HOST=$DOMAIN/" "$ENV_FILE"; else echo "TURN_HOST=$DOMAIN" >> "$ENV_FILE"; fi
  TURN_SECRET_VALUE=$(grep '^TURN_SECRET=' "$ENV_FILE" | cut -d= -f2-)
  PUBLIC_IP=$(curl -fsS https://api.ipify.org 2>/dev/null || hostname -I | awk '{print $1}')
  mkdir -p "$(dirname "$TURN_CONF")"
  cat > "$TURN_CONF" <<TURN
# managed by fellowship-hub installer
listening-port=3478
fingerprint
use-auth-secret
static-auth-secret=$TURN_SECRET_VALUE
realm=$DOMAIN
external-ip=$PUBLIC_IP
min-port=49160
max-port=49200
no-cli
no-tls
no-dtls
no-multicast-peers
total-quota=200
# never relay into private or local networks
denied-peer-ip=0.0.0.0-0.255.255.255
denied-peer-ip=10.0.0.0-10.255.255.255
denied-peer-ip=100.64.0.0-100.127.255.255
denied-peer-ip=127.0.0.0-127.255.255.255
denied-peer-ip=169.254.0.0-169.254.255.255
denied-peer-ip=172.16.0.0-172.31.255.255
denied-peer-ip=192.168.0.0-192.168.255.255
denied-peer-ip=::1
denied-peer-ip=fc00::-fdff:ffff:ffff:ffff:ffff:ffff:ffff:ffff
denied-peer-ip=fe80::-febf:ffff:ffff:ffff:ffff:ffff:ffff:ffff
TURN
  systemctl enable coturn
  systemctl restart coturn
  if [ "$OS_FAMILY" = rhel ] && systemctl is-active --quiet firewalld; then
    firewall-cmd --permanent --add-port=3478/udp --add-port=3478/tcp --add-port=49160-49200/udp && firewall-cmd --reload
  fi
  if command -v ufw >/dev/null && ufw status | grep -q active; then
    ufw allow 3478/udp; ufw allow 3478/tcp; ufw allow 49160:49200/udp
  fi
  systemctl restart $APP_NAME
fi

say "Requesting HTTPS certificate"
if [ -n "$CERT_EMAIL" ]; then CERT_ARGS=(-m "$CERT_EMAIL"); else CERT_ARGS=(--register-unsafely-without-email); fi
if certbot --nginx -n --agree-tos --redirect "${CERT_ARGS[@]}" -d "$DOMAIN"; then
  URL="https://$DOMAIN"
else
  echo "Certificate request failed — serving over plain HTTP for now."
  sed -i 's/^COOKIE_SECURE=.*/COOKIE_SECURE=false/' "$ENV_FILE"
  systemctl restart $APP_NAME
  URL="http://$DOMAIN"
fi

sleep 3
if curl -fsS -o /dev/null http://127.0.0.1:$PORT/api/teachings; then
  say "Done. Fellowship Hub is live at $URL"
else
  echo "The app did not answer. Check: journalctl -u $APP_NAME -n 50"; exit 1
fi
