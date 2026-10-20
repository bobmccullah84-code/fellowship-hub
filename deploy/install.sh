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
PORT=5000
SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOMAIN="${DOMAIN:-$(hostname -f)}"
CERT_EMAIL="${CERT_EMAIL:-${ADMIN_EMAIL:-}}"

say() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
[ "$(id -u)" = 0 ] || { echo "Run as root"; exit 1; }

say "Installing system packages (Node.js 22, PostgreSQL, nginx, certbot)"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl gnupg rsync postgresql nginx certbot python3-certbot-nginx
if ! command -v node >/dev/null || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
systemctl enable --now postgresql nginx

say "Creating app user and folders"
id -u $APP_USER >/dev/null 2>&1 || useradd --system --create-home --shell /usr/sbin/nologin $APP_USER
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
cat > /etc/nginx/sites-available/$APP_NAME <<NGINX
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
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/$APP_NAME
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

if command -v ufw >/dev/null && ufw status | grep -q active; then
  ufw allow 'Nginx Full' || true
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
