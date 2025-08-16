@echo off
echo ========================================
echo    E-Quizzez Installation Script
echo ========================================
echo.

echo Installing backend dependencies...
npm install

echo.
echo Installing frontend dependencies...
cd client
npm install
cd ..

echo.
echo Building frontend for production...
cd client
npm run build
cd ..

echo.
echo ========================================
echo    Installation Complete!
echo ========================================
echo.
echo To start the application:
echo    npm start
echo.
echo To start in development mode:
echo    npm run dev
echo.
echo The application will be available at:
echo    http://localhost:5000
echo.
echo For network access, use your computer's IP address:
echo    http://YOUR_IP_ADDRESS:5000
echo.
pause

