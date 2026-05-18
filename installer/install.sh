#!/bin/bash

echo "🧠 NeuroStack OS Installer (Pro Version)"

read -p "Installation directory [/opt/neurostack]: " DIR
DIR=${DIR:-/opt/neurostack}

read -p "System user [$USER]: " USERNAME
USERNAME=${USERNAME:-$USER}

echo "📂 Creating directory $DIR..."
sudo mkdir -p "$DIR"

echo "🚚 Copying files with rsync..."
sudo rsync -a --exclude=".git" ./ "$DIR/"
sudo chown -R "$USERNAME":"$USERNAME" "$DIR"

echo "📦 Installing dependencies..."
cd "$DIR/backend" && npm install
cd "$DIR/scheduler" && npm install

echo "⚙️ Configuring systemd service..."
sudo cp "$DIR/systemd/neurostack.service" /etc/systemd/system/

echo "🔄 Reloading systemd..."
sudo systemctl daemon-reload
sudo systemctl enable neurostack

echo "🚀 Starting NeuroStack OS..."
sudo systemctl start neurostack

echo "✅ Installation complete!"
echo "Dashboard: http://localhost:3000"
echo "API: http://localhost:3001"
