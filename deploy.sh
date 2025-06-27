#!/bin/bash

# Budget Tracker Deployment Script
echo "🚀 Starting Budget Tracker..."

# Kill any existing processes
pkill -f "node server.js" 2>/dev/null
pkill -f "vite" 2>/dev/null

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the frontend
echo "🔨 Building frontend..."
npm run build

# Start the server
echo "🌐 Starting server on port 3001..."
NODE_ENV=production node server.js &
SERVER_PID=$!

echo "✅ Budget Tracker is running!"
echo "📱 Access at: http://localhost:3001"
echo "🌍 Network access: http://$(ip route get 1 | awk '{print $7}' | head -1):3001"
echo "🛑 To stop: kill $SERVER_PID"

# Keep script running
wait $SERVER_PID