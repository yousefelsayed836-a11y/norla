#!/usr/bin/env bash
# Deploy Norla to the active DigitalOcean PM2 instance.
# Run as the same Unix account that owns the `norladesigns` PM2 process.

set -euo pipefail

APP_DIR="${NORLA_APP_DIR:-/var/www/norladesigns}"
BRANCH="${NORLA_DEPLOY_BRANCH:-claude/website-dashboard-review-7lpxjj}"
PM2_APP="${NORLA_PM2_APP:-norladesigns}"

cd "$APP_DIR"

echo "==> Fetching $BRANCH"
git fetch origin "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "==> Installing locked dependencies"
npm ci

echo "==> Applying database migrations"
npx prisma migrate deploy

echo "==> Building the new application (a failed build stops the script before PM2 restart)"
npm run build

echo "==> Copying public and Next static assets into standalone output"
mkdir -p .next/standalone/public .next/standalone/.next/static public/uploads
cp -a public/. .next/standalone/public/
cp -a .next/static/. .next/standalone/.next/static/

echo "==> Restarting PM2 app"
pm2 restart "$PM2_APP" --update-env
pm2 status "$PM2_APP"
echo "==> Deploy complete"

