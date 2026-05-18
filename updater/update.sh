#!/bin/bash

echo "🔄 NeuroStack Auto-Updater"

REPO="AndreVazao/NeuroStack-OS"
INSTALL_DIR="/opt/neurostack"

LATEST=$(curl -s https://api.github.com/repos/$REPO/releases/latest | grep tarball_url | cut -d '"' -f 4)

if [ -z "$LATEST" ]; then
  echo "❌ Failed to fetch latest version"
else
  echo "⬇️ Downloading latest version..."
  cd /tmp
  curl -L "$LATEST" -o neurostack.tar.gz

  echo "📦 Extracting..."
  tar -xzf neurostack.tar.gz

  NEW_DIR=$(find . -maxdepth 1 -type d -name "*NeuroStack*" | head -n 1)

  echo "🔁 Updating system..."
  sudo systemctl stop neurostack

  sudo rsync -a --delete "$NEW_DIR/" "$INSTALL_DIR/"

  sudo systemctl start neurostack

  echo "✅ Update successful"
fi
