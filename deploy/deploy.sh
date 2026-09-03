#!/bin/bash
# Norla — deploy / redeploy script
# Run from the server as root or the norla user: bash deploy.sh

set -e

APP_DIR="/var/www/norla"
APP_USER="norla"
REPO="https://github.com/yousefelsayed836-a11y/norla.git"
BRANCH="main"

echo "==> Pulling latest code"
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  sudo -u "$APP_USER" git fetch origin "$BRANCH"
  sudo -u "$APP_USER" git reset --hard "origin/$BRANCH"
else
  sudo -u "$APP_USER" git clone -b "$BRANCH" "$REPO" "$APP_DIR"
  cd "$APP_DIR"
fi

echo "==> Installing dependencies"
cd "$APP_DIR"
sudo -u "$APP_USER" npm ci --omit=dev

echo "==> Generating Prisma client"
sudo -u "$APP_USER" npx prisma generate

echo "==> Running database migrations"
sudo -u "$APP_USER" npx prisma migrate deploy

echo "==> Building Next.js"
sudo -u "$APP_USER" npm run build

echo "==> Ensuring uploads directory exists"
mkdir -p "$APP_DIR/public/uploads"
chown -R "$APP_USER":"$APP_USER" "$APP_DIR/public/uploads"

echo "==> Restarting app service"
systemctl restart norla

echo "==> Done! App is live."
systemctl status norla --no-pager
