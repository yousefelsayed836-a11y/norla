#!/bin/bash
# Norla — Digital Ocean Ubuntu 22.04 / 24.04 initial server setup
# Run once as root on a fresh droplet: bash setup.sh

set -e

DOMAIN="your-domain.com"          # <-- CHANGE THIS
APP_USER="norla"
APP_DIR="/var/www/norla"
DB_NAME="norla"
DB_USER="norla"
DB_PASS="$(openssl rand -hex 16)"  # auto-generated, saved to /root/.norla-db-pass

echo "==> Updating system"
apt-get update -y && apt-get upgrade -y

echo "==> Installing Node.js 22"
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

echo "==> Installing PostgreSQL"
apt-get install -y postgresql postgresql-contrib

echo "==> Creating database and user"
sudo -u postgres psql <<SQL
CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
CREATE DATABASE $DB_NAME OWNER $DB_USER;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
SQL
echo "$DB_PASS" > /root/.norla-db-pass
chmod 600 /root/.norla-db-pass
echo "    DB password saved to /root/.norla-db-pass"

echo "==> Installing nginx and certbot"
apt-get install -y nginx certbot python3-certbot-nginx

echo "==> Creating app user"
id -u $APP_USER &>/dev/null || useradd -m -s /bin/bash $APP_USER

echo "==> Creating app directory"
mkdir -p $APP_DIR
chown $APP_USER:$APP_USER $APP_DIR

echo ""
echo "=== Setup done ==="
echo "Next steps:"
echo "  1. Copy your .env to $APP_DIR/.env and fill in all values"
echo "     DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME"
echo "  2. Run: bash deploy.sh"
echo "  3. Run: certbot --nginx -d $DOMAIN"
