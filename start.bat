@echo off
chcp 65001 >nul
title Manga Sallayicisi
cd /d "%~dp0"

if not exist "pocketbase.exe" (
    echo [HATA] pocketbase.exe yok. Once setup.bat calistirin.
    pause & exit /b 1
)
if not exist "web\.next" (
    echo [HATA] Site derlenmemis. Once setup.bat calistirin.
    pause & exit /b 1
)

echo Baslatiliyor... Site: http://localhost:3000  ^|  Yonetim: /admin  ^|  PocketBase: http://127.0.0.1:8090/_/
echo Durdurmak icin bu pencerede Ctrl+C.
echo.
cd web
npx concurrently -k -n pb,site -c blue,green "..\pocketbase.exe serve --http=127.0.0.1:8090" "npm run start"
