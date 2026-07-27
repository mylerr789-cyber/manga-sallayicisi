@echo off
chcp 65001 >nul
title Manga Sallayicisi - Kurulum
echo.
echo  ============================================
echo   Manga Sallayicisi - Kurulum
echo  ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [HATA] Node.js bulunamadi. Once yukleyin: https://nodejs.org
    pause & exit /b 1
)

if not exist "%~dp0pocketbase.exe" (
    echo [HATA] pocketbase.exe bulunamadi!
    echo Su adresten Windows surumunu indirip bu klasore cikarin:
    echo https://pocketbase.io/docs/
    pause & exit /b 1
)

cd /d "%~dp0"

echo [1/4] Veritabani hazirlaniyor...
pocketbase.exe migrate
if errorlevel 1 ( echo [HATA] Migration basarisiz. & pause & exit /b 1 )

echo.
echo [2/4] Yonetici hesabi olusturuluyor...
set /p PB_EMAIL="  Admin e-posta: "
set /p PB_PASS="  Admin sifre (en az 10 karakter): "
pocketbase.exe superuser upsert %PB_EMAIL% %PB_PASS%
if errorlevel 1 ( echo [HATA] Hesap olusturulamadi (sifre en az 10 karakter olmali^). & pause & exit /b 1 )

echo.
echo [3/4] Site bagimliliklari yukleniyor (birkac dakika surebilir)...
cd web
if not exist .env.local copy .env.local.example .env.local >nul
call npm install
if errorlevel 1 ( echo [HATA] npm install basarisiz. & pause & exit /b 1 )

echo.
echo [4/4] Site derleniyor...
call npm run build
if errorlevel 1 ( echo [HATA] Derleme basarisiz. & pause & exit /b 1 )
cd ..

echo.
echo  ============================================
echo   Kurulum tamamlandi!
echo   Baslatmak icin: start.bat
echo   Site:   http://localhost:3000
echo   Yonetim: http://localhost:3000/admin
echo  ============================================
echo.
pause
