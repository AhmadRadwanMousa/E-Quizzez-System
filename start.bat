@echo off
title E-Quizzez Platform - Automatic Setup
color 0A

echo ========================================
echo    E-Quizzez Platform Startup Script
echo ========================================
echo.
echo This script will automatically:
echo 1. Install all dependencies
echo 2. Start the backend server
echo 3. Start the frontend server
echo 4. Open the application in your browser
echo.
echo Press any key to begin automatic setup...
pause >nul

echo.
echo [1/4] Installing backend dependencies...
echo This may take a few minutes on first run...
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ❌ Error: Failed to install backend dependencies
    echo Please check your Node.js installation and try again.
    echo.
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed successfully!

echo.
echo [2/4] Installing frontend dependencies...
echo This may take a few minutes on first run...
cd client
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ❌ Error: Failed to install frontend dependencies
    echo Please check your Node.js installation and try again.
    echo.
    pause
    exit /b 1
)
cd ..
echo ✅ Frontend dependencies installed successfully!

echo.
echo [3/4] Starting servers...
echo.

echo Starting backend server on port 5000...
start "E-Quizzez Backend Server" cmd /k "title E-Quizzez Backend && echo Starting backend server... && npm start"

echo Waiting for backend to start...
timeout /t 8 /nobreak >nul

echo Starting frontend server on port 3000...
start "E-Quizzez Frontend Server" cmd /k "title E-Quizzez Frontend && cd client && echo Starting frontend server... && npm start"

echo.
echo [4/4] Opening application in browser...
echo Waiting for servers to fully start...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo    🎉 Setup Complete! 
echo ========================================
echo.
echo ✅ Backend:  http://localhost:5000
echo ✅ Frontend: http://localhost:3000
echo ✅ Admin:    http://localhost:3000/admin/login
echo.
echo 🔑 Default Admin Login:
echo    Username: admin
echo    Password: admin123
echo.
echo 🔑 Default Student Login:
echo    Student ID: STU001
echo    Password: student123
echo.
echo 📱 The application will open in your browser shortly...
echo.
echo 💡 Keep both terminal windows open to run the servers.
echo    To stop servers, close the terminal windows.
echo.

REM Try to open the application in the default browser
start http://localhost:3000

echo.
echo 🎓 E-Quizzez Platform is now running!
echo.
echo 📚 What to do next:
echo    1. Wait for the browser to open
echo    2. Login as admin (admin/admin123)
echo    3. Create your first subject
echo    4. Add some questions
echo    5. Create an exam
echo    6. Test with student login
echo.
echo Press any key to close this setup window...
pause >nul

