#!/bin/bash

echo "🚀 NeuroStack OS booting..."

cd backend && node server.js &
cd ../scheduler && node scheduler.js &
cd ../agents && node orchestrator.js &
cd ../frontend && python3 -m http.server 3000 &

echo "✅ System ready"
