#!/bin/bash

echo ""
echo "====================================================="
echo "   Smart Attendance - Full Project Starter"
echo "====================================================="
echo ""

# 🔥 Check if we're in root folder
if [ ! -f "backend/pom.xml" ]; then
  echo "[ERROR] backend folder not found!"
  echo "Make sure you run this from the project root."
  exit 1
fi

# 🔥 Install frontend deps
echo "[1/4] Installing Frontend dependencies..."
cd frontend-web || exit
npm install
cd ..

echo ""
echo "[2/4] Installing Proxy dependencies..."
cd proxy || exit
npm install
cd ..

echo ""
echo "[3/4] Starting all services..."
echo ""

# 🔥 Function to open new terminal
start_terminal() {
  if command -v gnome-terminal &> /dev/null; then
    gnome-terminal -- bash -c "$1; exec bash"
  elif command -v x-terminal-emulator &> /dev/null; then
    x-terminal-emulator -e bash -c "$1; exec bash"
  elif command -v open &> /dev/null; then
    # macOS
    osascript -e "tell application \"Terminal\" to do script \"$1\""
  else
    echo "[WARN] No supported terminal found. Running in background..."
    bash -c "$1" &
  fi
}

# 🚀 Start Backend
start_terminal "cd backend && ./mvnw spring-boot:run"

sleep 3

# 🚀 Start Frontend
start_terminal "cd frontend-web && npm run dev"

sleep 2

# 🚀 Start Proxy
start_terminal "cd proxy && npm install && node proxy.js"

echo ""
echo "====================================================="
echo "All services have been started!"
echo ""
echo "Please wait a few seconds for servers to boot."
echo ""
echo "Open your browser:"
echo "   http://localhost:8080"
echo ""
echo "Backend  : http://localhost:8082"
echo "Frontend : http://localhost:3000"
echo "Proxy    : http://localhost:8080"
echo "====================================================="