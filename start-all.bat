@echo off
echo.
echo =====================================================
echo    Smart Attendance - Full Project Starter
echo =====================================================
echo.

:: Check if we're in the root folder
if not exist "backend\pom.xml" (
    echo [ERROR] backend folder not found!
    echo Make sure you run this from the project root.
    pause
    exit /b
)

echo [1/4] Installing Frontend dependencies...
cd frontend-web
call npm install
cd ..

echo.
echo [2/4] Installing Proxy dependencies...
cd proxy
call npm install
cd ..

echo.
echo [3/4] Starting all services...
echo.


start "Backend  (Spring Boot)" cmd /k "cd backend && mvnw.cmd spring-boot:run"
timeout /t 3 >nul

start "Frontend (Next.js)" cmd /k "cd frontend-web && npm run dev"
timeout /t 2 >nul

start "Proxy Server" cmd /k "cd proxy && npm i && node proxy.js"

echo.
echo =====================================================
echo All services have been started in separate windows!
echo.
echo Please wait a few seconds for the servers to boot up.
echo.
echo Open your browser and go to:
echo    http://localhost:8080
echo.
echo Backend  ^: http://localhost:8082
echo Frontend ^: http://localhost:3000
echo Proxy    ^: http://localhost:8080
echo.
echo Press any key to close this window...
pause >nul