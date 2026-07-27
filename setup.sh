#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

echo ""
echo " ============================================"
echo "  Manga Sallayıcısı — Kurulum"
echo " ============================================"
echo ""

command -v node >/dev/null 2>&1 || { echo "[HATA] Node.js gerekli: https://nodejs.org"; exit 1; }

PB="./pocketbase"
[ -f "./pocketbase.exe" ] && PB="./pocketbase.exe"
if [ ! -f "$PB" ]; then
  echo "[HATA] pocketbase binary bulunamadı!"
  echo "İşletim sisteminize uygun sürümü indirin: https://pocketbase.io/docs/"
  exit 1
fi
chmod +x "$PB" 2>/dev/null || true

echo "[1/4] Veritabanı hazırlanıyor..."
"$PB" migrate

echo ""
echo "[2/4] Yönetici hesabı oluşturuluyor..."
read -p "  Admin e-posta: " PB_EMAIL
read -s -p "  Admin şifre (en az 10 karakter): " PB_PASS
echo ""
"$PB" superuser upsert "$PB_EMAIL" "$PB_PASS"

echo ""
echo "[3/4] Site bağımlılıkları yükleniyor..."
cd web
[ -f .env.local ] || cp .env.local.example .env.local
npm install

echo ""
echo "[4/4] Site derleniyor..."
npm run build
cd ..

echo ""
echo " ============================================"
echo "  Kurulum tamamlandı! Başlatmak için: ./start.sh"
echo "  Site: http://localhost:3000  —  Yönetim: /admin"
echo " ============================================"
