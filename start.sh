#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

PB="../pocketbase"
[ -f "./pocketbase.exe" ] && PB="../pocketbase.exe"
[ -f "./pocketbase" ] || [ -f "./pocketbase.exe" ] || { echo "[HATA] pocketbase yok. Önce ./setup.sh çalıştırın."; exit 1; }
[ -d "web/.next" ] || { echo "[HATA] Site derlenmemiş. Önce ./setup.sh çalıştırın."; exit 1; }

echo "Site: http://localhost:3000  |  Yönetim: /admin  |  PocketBase: http://127.0.0.1:8090/_/"
echo "Durdurmak için Ctrl+C."
cd web
npx concurrently -k -n pb,site -c blue,green "$PB serve --http=127.0.0.1:8090" "npm run start"
