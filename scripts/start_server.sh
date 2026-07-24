#!/bin/bash
set -e

# Move to backend folder
cd /home/ubuntu/sre-watchdog/backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
source venv/bin/activate
pip install -r requirements.txt

# Kill any existing uvicorn process running on port 8000
fuser -k 8000/tcp || true

# Start backend server in background
nohup uvicorn main:app --host 0.0.0.0 --port 8000 > app.log 2>&1 &