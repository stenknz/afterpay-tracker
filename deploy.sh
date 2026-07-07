#!/usr/bin/env bash
set -euo pipefail

# bnpl-track - NAS Deploy Script
# Usage: ./deploy.sh <nas-ip> [tailscale-ip]
#   <nas-ip>       Required - your ASUSTOR NAS local IP (e.g. 192.168.1.100)
#   [tailscale-ip] Optional - your Tailscale IP for NEXTAUTH_URL (e.g. 100.x.x.x)

NAS_IP="${1:?Usage: ./deploy.sh <nas-ip> [tailscale-ip]}"
TAILSCALE_IP="${2:-}"
NAS_USER="stenk"
NAS_PATH="/volume1/Docker/bnpl-track"
REMOTE="$NAS_USER@$NAS_IP"

NEXTAUTH_URL="http://$NAS_IP:7672"
if [ -n "$TAILSCALE_IP" ]; then
  NEXTAUTH_URL="http://$TAILSCALE_IP:7672"
fi

echo "=== Syncing source to NAS ($NAS_IP) ==="
rsync -avz --delete \
  --exclude node_modules \
  --exclude .next \
  --exclude .git \
  --exclude dev.db \
  --exclude '*.md' \
  ./ "$REMOTE:$NAS_PATH/"

echo "=== Building and restarting on NAS ==="
ssh "$REMOTE" bash -s <<EOF
  cd "$NAS_PATH"
  sudo docker compose build --pull
  sudo docker compose up -d
  echo "=== Done ==="
EOF
