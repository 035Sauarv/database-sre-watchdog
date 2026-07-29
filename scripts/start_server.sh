#!/bin/bash
set -e

# Move to backend folder
cd /home/ubuntu/sre-watchdog/backend

# Fix PyO3 compatibility for Rust-based libraries (e.g., pydantic-core)
export PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Upgrade pip and install backend dependencies
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

# Kill any existing server running on port 8000
echo "Stopping any existing service on port 8000..."
fuser -k 8000/tcp || true

# Start Uvicorn backend server in background
echo "Starting Uvicorn application server..."
nohup uvicorn main:app --host 0.0.0.0 --port 8000 > app.log 2>&1 &

echo "Server started successfully."