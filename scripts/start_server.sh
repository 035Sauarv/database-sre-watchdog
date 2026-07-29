#!/bin/bash
set -e

# Move to backend folder
cd /home/ubuntu/sre-watchdog/backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Upgrade build tools
pip install --upgrade pip setuptools wheel

# Install dependencies passing the PyO3 ABI3 compatibility flag inline
PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1 pip install -r requirements.txt

# Kill any existing server running on port 8000
echo "Stopping any existing service on port 8000..."
fuser -k 8000/tcp || true

# Start Uvicorn backend server in background
echo "Starting Uvicorn application server..."
nohup uvicorn main:app --host 0.0.0.0 --port 8000 > app.log 2>&1 &

echo "Server started successfully."