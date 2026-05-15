#!/usr/bin/env bash
# One-time bootstrap for Yaocihuatl on Ubuntu home server.
# Run as the deploy user (NOT root). Requires sudo access.
# Usage: bash setup-server.sh

set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/yaocihuatl}"
REPO_URL="git@github.com:LexHackersClub/Yaocihuatl.git"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
DOMAIN="srserver.sytes.net"

log() { echo "[setup] $*"; }

# ── 1. System packages ────────────────────────────────────────────────────────
log "Installing system packages..."
sudo apt-get update -qq
sudo apt-get install -y curl git ca-certificates gnupg lsb-release

# ── 2. Docker ─────────────────────────────────────────────────────────────────
if ! command -v docker &>/dev/null; then
  log "Installing Docker..."
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$USER"
  log "Docker installed. You may need to log out/in for group membership to take effect."
  log "For this script session, using 'newgrp docker' workaround..."
fi

if ! docker compose version &>/dev/null 2>&1; then
  log "Installing Docker Compose plugin..."
  sudo apt-get install -y docker-compose-plugin
fi

# ── 3. Caddy ──────────────────────────────────────────────────────────────────
if ! command -v caddy &>/dev/null; then
  log "Installing Caddy..."
  sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    | sudo tee /etc/apt/sources.list.d/caddy-stable.list
  sudo apt-get update -qq
  sudo apt-get install -y caddy
fi

# ── 4. GitHub deploy key ──────────────────────────────────────────────────────
DEPLOY_KEY_PATH="$HOME/.ssh/github_deploy"

if [ ! -f "$DEPLOY_KEY_PATH" ]; then
  log "Generating GitHub deploy key at $DEPLOY_KEY_PATH..."
  mkdir -p "$HOME/.ssh"
  chmod 700 "$HOME/.ssh"
  ssh-keygen -t ed25519 -C "yaocihuatl-deploy@$DOMAIN" -f "$DEPLOY_KEY_PATH" -N ""
  log ""
  log "======================================================================"
  log "Add this public key as a Deploy Key in the GitHub repo:"
  log "  https://github.com/LexHackersClub/Yaocihuatl/settings/keys/new"
  log "  Title: home-server-deploy"
  log "  Key (read-only is enough):"
  cat "$DEPLOY_KEY_PATH.pub"
  log "======================================================================"
  log ""
  read -rp "Press ENTER after adding the deploy key to GitHub..."
fi

# Configure SSH to use the deploy key for GitHub
SSH_CONFIG="$HOME/.ssh/config"
if ! grep -q "github_deploy" "$SSH_CONFIG" 2>/dev/null; then
  cat >> "$SSH_CONFIG" << EOF

Host github.com
  HostName github.com
  User git
  IdentityFile $DEPLOY_KEY_PATH
  IdentitiesOnly yes
EOF
  chmod 600 "$SSH_CONFIG"
fi

# Test GitHub SSH access
log "Testing GitHub SSH access..."
ssh -T git@github.com -o StrictHostKeyChecking=no 2>&1 | grep -q "successfully authenticated" \
  && log "GitHub SSH OK" \
  || log "WARNING: GitHub SSH test returned non-zero (this may be normal)"

# ── 5. Clone / update repo ────────────────────────────────────────────────────
mkdir -p "$APP_DIR"

if [ ! -d "$APP_DIR/.git" ]; then
  log "Cloning repository into $APP_DIR..."
  GIT_SSH_COMMAND="ssh -i $DEPLOY_KEY_PATH -o StrictHostKeyChecking=no" \
    git clone --branch "$DEPLOY_BRANCH" "$REPO_URL" "$APP_DIR"
else
  log "Repository already exists — pulling latest $DEPLOY_BRANCH..."
  cd "$APP_DIR"
  GIT_SSH_COMMAND="ssh -i $DEPLOY_KEY_PATH -o StrictHostKeyChecking=no" \
    git fetch origin "$DEPLOY_BRANCH"
  git checkout "$DEPLOY_BRANCH"
  git reset --hard "origin/$DEPLOY_BRANCH"
fi

# ── 6. Environment file ───────────────────────────────────────────────────────
if [ ! -f "$APP_DIR/.env" ]; then
  log "Creating .env from .env.example — EDIT THIS FILE before starting services!"
  cp "$APP_DIR/.env.example" "$APP_DIR/.env"
  # Patch production-specific defaults
  sed -i "s|APP_ENV=development|APP_ENV=production|" "$APP_DIR/.env"
  sed -i "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=https://$DOMAIN/api|" "$APP_DIR/.env"
  sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=https://$DOMAIN|" "$APP_DIR/.env"
  sed -i "s|FRONTEND_URLS=.*|FRONTEND_URLS=https://$DOMAIN|" "$APP_DIR/.env"
  sed -i "s|SEED_DEMO_DATA=.*|SEED_DEMO_DATA=true|" "$APP_DIR/.env"
  log ""
  log "======================================================================"
  log "EDIT $APP_DIR/.env and set:"
  log "  POSTGRES_PASSWORD   — strong random password"
  log "  REDIS_PASSWORD      — strong random password"
  log "  JWT_SECRET          — random string, min 32 chars"
  log "  DEEPSEEK_API_KEY    — or ANTHROPIC_API_KEY depending on LLM_PROVIDER"
  log "======================================================================"
  log ""
  read -rp "Press ENTER after editing the .env file..."
fi

# ── 7. Caddy configuration ────────────────────────────────────────────────────
CADDY_CONF="/etc/caddy/Caddyfile"
log "Installing Caddy config for $DOMAIN..."
sudo cp "$APP_DIR/infra/deployment/Caddyfile.srserver" "$CADDY_CONF"
sudo caddy fmt --overwrite "$CADDY_CONF"
sudo systemctl enable caddy
sudo systemctl restart caddy
log "Caddy restarted."

# ── 8. Start services ─────────────────────────────────────────────────────────
log "Building and starting Docker services..."
cd "$APP_DIR"
# Run docker with newgrp if not in docker group yet
if groups | grep -q docker; then
  docker compose -f docker-compose.prod.yml up -d --build --remove-orphans
else
  newgrp docker << DOCKEREOF
cd "$APP_DIR"
docker compose -f docker-compose.prod.yml up -d --build --remove-orphans
DOCKEREOF
fi

log "Waiting for backend to be healthy..."
timeout 180 sh -c 'until curl -fsS http://127.0.0.1:8000/health > /dev/null 2>&1; do sleep 5; done'
log "Backend is up."

log ""
log "======================================================================"
log "Setup complete!"
log "  Frontend: https://$DOMAIN"
log "  Backend:  https://$DOMAIN/api"
log "  Health:   http://127.0.0.1:8000/health"
log "======================================================================"
