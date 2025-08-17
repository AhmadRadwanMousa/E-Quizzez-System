#!/bin/bash

echo "========================================"
echo "    E-Quizzez Platform Startup Script"
echo "========================================"
echo

echo "Starting E-Quizzez Platform..."
echo

echo "[1/3] Installing backend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "Error: Failed to install backend dependencies"
    exit 1
fi

echo "[2/3] Installing frontend dependencies..."
cd client
npm install
if [ $? -ne 0 ]; then
    echo "Error: Failed to install frontend dependencies"
    exit 1
fi
cd ..

echo "[3/3] Starting servers..."
echo

echo "Starting backend server on port 5000..."
gnome-terminal --title="Backend Server" -- bash -c "npm start; exec bash" &
# Alternative for different terminal emulators:
# xterm -title "Backend Server" -e "npm start; bash" &
# konsole --title "Backend Server" -e bash -c "npm start; exec bash" &

echo "Waiting for backend to start..."
sleep 5

echo "Starting frontend server on port 3000..."
gnome-terminal --title="Frontend Server" -- bash -c "cd client && npm start; exec bash" &
# Alternative for different terminal emulators:
# xterm -title "Frontend Server" -e "cd client && npm start; bash" &
# konsole --title "Frontend Server" -e bash -c "cd client && npm start; exec bash" &

echo
echo "========================================"
echo "    Servers are starting up..."
echo "========================================"
echo
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo "Admin:    http://localhost:3000/admin/login"
echo
echo "Default Admin Login:"
echo "Username: admin"
echo "Password: admin123"
echo

# Try to open the application in the default browser
if command -v xdg-open > /dev/null; then
    echo "Opening application in default browser..."
    xdg-open http://localhost:3000 &
elif command -v open > /dev/null; then
    echo "Opening application in default browser..."
    open http://localhost:3000 &
fi

echo
echo "E-Quizzez Platform is now running!"
echo "Keep these terminal windows open to run the servers."
echo
echo "Press Ctrl+C to stop this script (servers will continue running)"
echo "To stop servers, close the terminal windows or use:"
echo "  pkill -f 'npm start'"
echo

# Wait for user input
read -p "Press Enter to continue..."
