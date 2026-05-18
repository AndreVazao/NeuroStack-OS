#!/bin/bash

echo "🔄 NeuroStack Auto-Updater (Safe Mode)"

REPO="AndreVazao/NeuroStack-OS"
INSTALL_DIR="/opt/neurostack"
BACKUP_DIR="/opt/neurostack_backup_$(date +%s)"

LATEST=$(curl -s https://api.github.com/repos/$REPO/releases/latest | grep tarball_url | cut -d '"' -f 4)

if [ -z "$LATEST" ]; then
  echo "❌ Failed to fetch latest version"
  exit 1
fi

echo "⬇️ Downloading latest version..."
cd /tmp
curl -L "$LATEST" -o neurostack.tar.gz

echo "📦 Extracting..."
tar -xzf neurostack.tar.gz
NEW_DIR=$(find . -maxdepth 1 -type d -name "*NeuroStack*" | head -n 1)

echo "💾 Creating backup at $BACKUP_DIR..."
sudo cp -r "$INSTALL_DIR" "$BACKUP_DIR"

echo "🔁 Updating system..."
sudo systemctl stop neurostack

if sudo rsync -a --delete "$NEW_DIR/" "$INSTALL_DIR/"; then
    echo "✅ Update applied successfully"
    sudo systemctl start neurostack
    echo "🚀 System restarted"
else
    echo "❌ Update failed! Initiating rollback..."
    sudo rm -rf "$INSTALL_DIR"
    sudo mv "$BACKUP_DIR" "$INSTALL_DIR"
    sudo systemctl start neurostack
    echo "⏪ Rollback complete"
fi
