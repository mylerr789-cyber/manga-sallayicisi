# 📚 Manga Sallayıcısı

Kendi manga & webtoon yayın sitenizi **dakikalar içinde** kurun. Tamamen ücretsiz, açık kaynak (MIT).

- ⚡ **Tek dosyayla kurulum** (`setup.bat`), **tek komutla çalıştırma** (`start.bat`)
- 🎨 Admin panelinden her şey ayarlanabilir: site adı, logo, renk, tema (koyu/açık), footer, sosyal linkler
- 📖 İki okuma modu: webtoon (dikey akış) + manga (sayfalı, klavye destekli)
- 🖼️ Sürükle-bırak çoklu sayfa yükleme, dosya adına göre otomatik sıralama
- 🔍 Arama, tür/durum/kategori filtreleri, sayfalama
- 🗃️ Veritabanı şeması otomatik kurulur — hiçbir şeyi elle oluşturmazsınız

**Teknoloji:** Next.js 16 + Tailwind CSS 4 + [PocketBase](https://pocketbase.io) (veritabanı + dosya depolama + API, tek binary)

---

## 🚀 Kurulum

### Gereksinimler
1. [Node.js 18+](https://nodejs.org) (LTS önerilir)
2. [PocketBase](https://pocketbase.io/docs/) — işletim sisteminize uygun sürümü indirin, ZIP'ten çıkan `pocketbase.exe` (veya `pocketbase`) dosyasını **bu projenin kök klasörüne** koyun

### Windows
```bat
setup.bat   :: bir kez — admin hesabı sorar, veritabanını ve siteyi hazırlar
start.bat   :: her açılışta — siteyi başlatır
```

### Linux / macOS
```bash
chmod +x setup.sh start.sh
./setup.sh   # bir kez
./start.sh   # her açılışta
```

### Adresler
| Adres | Ne |
|---|---|
| http://localhost:3000 | Site |
| http://localhost:3000/admin | Yönetim paneli (kurulumda oluşturduğunuz hesapla girin) |
| http://127.0.0.1:8090/_/ | PocketBase paneli (gelişmiş — normalde gerekmez) |

---

## 📝 Kullanım

1. `/admin` → **Seriler** → "+ Yeni Seri" ile manga/webtoon ekleyin (kapak, açıklama, türler...)
2. **Bölümler** → seriyi seçin → "+ Yeni Bölüm" → sayfa görsellerini sürükleyin
   - Dosyalar adına göre otomatik sıralanır: `01.jpg, 02.jpg, ...` şeklinde adlandırın
   - "Yayında" kutusunu kapatırsanız taslak olur, sitede görünmez
3. **Ayarlar** → site adı, logo, vurgu rengi, tema... (siteye yansıması ~1 dk)
4. Bir seriyi ana sayfa slider'ında göstermek için seri formunda **"Öne çıkar"** işaretleyin

## 🌐 Sunucuda Yayınlama (VPS)

```bash
# .env.local içinde PB adresini sunucuya göre ayarlayın:
# web/.env.local → NEXT_PUBLIC_PB_URL=https://alaninizin-pb-adresi
./setup.sh && ./start.sh
```
Önerilen: Nginx/Caddy reverse proxy → `:3000` (site) ve PB için ayrı subdomain → `:8090`. Süreçleri systemd/pm2 ile yönetin.

## 💾 Yedekleme
Tüm veri (kayıtlar + yüklenen görseller) `pb_data/` klasöründedir. Bu klasörü kopyalamak = tam yedek.

## ❓ SSS
- **"pocketbase.exe bulunamadı"** → Binary'yi indirip proje köküne koymadınız.
- **Şifre hatası** → Admin şifresi en az 10 karakter olmalı.
- **Ayar değişikliği görünmüyor** → Site ayarları 60 sn önbelleklenir, bekleyip yenileyin.
- **Port çakışması** → 3000 veya 8090 portunu kullanan başka uygulamayı kapatın.

---

## English (summary)

Self-hosted manga & webtoon publishing site. Requirements: Node.js 18+ and the [PocketBase](https://pocketbase.io/docs/) binary placed in the project root. Run `setup.bat` (or `./setup.sh`) once — it creates the admin account, applies DB migrations and builds the site. Then `start.bat` (or `./start.sh`) starts everything with one command. Site: `localhost:3000`, admin dashboard: `/admin`. All data lives in `pb_data/` (copy it to back up). UI language is Turkish. MIT licensed.

## Lisans
MIT — dilediğiniz gibi kullanın, değiştirin, dağıtın.
