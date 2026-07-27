# Manga & Webtoon Yayın Sitesi — Uygulama Planı

> **For Hermes:** Bu planı görev görev uygula (subagent-driven-development uygun).

**Hedef:** Tek dosya ile kurulan (`setup.bat`), tek komutla ayağa kalkan (`start.bat` → `pocketbase serve`), GitHub'da herkesin ücretsiz kullanabileceği, admin panelinden tamamen ayarlanabilir manga/webtoon yayın sitesi.

**Mimari:** PocketBase hem veritabanı/API hem de statik dosya sunucusu olarak kullanılır. Site `pb_public/` klasöründen servis edilir → **build adımı yok, Node/npm gerekmez, tek process her şeyi çalıştırır.** Frontend: vanilla JS + PocketBase JS SDK (CDN). Koleksiyonlar JS migration dosyalarıyla otomatik kurulur (PocketBase ilk açılışta `pb_migrations/` içini kendisi uygular).

**Teknoloji:** PocketBase 0.39.x (mevcut: `D:\basitsss\pocketbase.exe`), vanilla HTML/CSS/JS, PocketBase JS SDK 0.26+ (CDN).

---

## Dizin Yapısı (nihai)

```
D:\basitsss\
├── pocketbase.exe          # kullanıcı indirir (gitignore'da)
├── setup.bat / setup.sh    # KURULUM: superuser oluştur + ilk migrate
├── start.bat / start.sh    # ÇALIŞTIR: pocketbase serve (site + API + admin UI)
├── pb_migrations\
│   ├── 1700000000_init_collections.js   # mangas, chapters, settings
│   └── 1700000001_seed_settings.js      # varsayılan ayar kaydı
├── pb_public\
│   ├── index.html          # 1. Ana sayfa
│   ├── library.html        # 2. Kütüphane
│   ├── manga.html          # 3. Manga detay (?slug=...)
│   ├── reader.html         # 4. Bölüm okuma (?c=CHAPTER_ID)
│   ├── admin\index.html    # 5. Admin dashboard (SPA: seriler/bölümler/ayarlar sekmeleri)
│   ├── css\style.css       # site teması (CSS değişkenleri, dark)
│   ├── css\admin.css
│   └── js\
│       ├── pb.js           # SDK init + settings yükleme + tema uygulama (ortak)
│       ├── home.js  library.js  manga.js  reader.js
│       └── admin.js
├── pb_data\                # runtime, gitignore'da
├── .gitignore
├── README.md               # TR+EN kurulum: 1) pocketbase indir 2) setup 3) start
└── LICENSE                 # MIT
```

## Veri Modeli

### `mangas` koleksiyonu
| Alan | Tip | Not |
|---|---|---|
| title | text, required | |
| slug | text, required, unique | URL için |
| cover | file (1, image) | thumb üretimi PB otomatik |
| description | editor/text | |
| author, artist | text | |
| status | select: ongoing/completed/hiatus/cancelled | |
| type | select: manga/webtoon/manhwa/manhua | reader modunu belirler |
| genres | json (string dizisi) | |
| featured | bool | ana sayfa hero |
| views | number | |

API kuralları: list/view = herkese açık (`""`), create/update/delete = sadece superuser (kural `null`).

### `chapters` koleksiyonu
| Alan | Tip | Not |
|---|---|---|
| manga | relation → mangas, required, cascadeDelete | |
| number | number, required | 10.5 gibi ara bölüm destekli |
| title | text | opsiyonel |
| pages | file (çoklu, max 200, image) | sıra = yüklenme sırası |
| published | bool | taslak desteği |
| views | number | |

list/view kuralı: `published = true` (admin SDK'sı superuser olduğu için hepsini görür). Yazma: superuser.

### `settings` koleksiyonu (tek kayıt)
site_name, site_description, logo(file), accent_color(text, ör. `#e11d48`), theme(select: dark/light), hero_enabled(bool), items_per_page(number), footer_text, social_links(json: {discord,twitter,...}), show_views(bool).
list/view herkese açık; yazma superuser. Seed migration 1 kayıt ekler.

**Admin girişi:** ayrı kullanıcı sistemi YOK (YAGNI) — admin paneli `pb.collection("_superusers").authWithPassword(...)` ile PocketBase superuser'ı kullanır. setup.bat superuser'ı oluşturur.

---

## Görevler

### Görev 1: `.gitignore` + `LICENSE`
**Dosya:** `D:\basitsss\.gitignore`, `LICENSE`
```gitignore
pb_data/
pocketbase.exe
pocketbase
*.zip
.hermes/
```
LICENSE: standart MIT metni.
**Doğrulama:** dosyalar mevcut.

### Görev 2: Init migration — koleksiyonlar
**Dosya:** `pb_migrations/1700000000_init_collections.js`
`migrate((app) => {...})` içinde `new Collection({...})` ile yukarıdaki 3 koleksiyonu şema+kurallarla oluştur (PB 0.39 JSVM API'si; alanlar `fields:[{type:"text",...}]` formatında). Down bloğunda koleksiyonları sil.
**Doğrulama:** `./pocketbase.exe migrate` → hata yok; `./pocketbase.exe serve` sonrası `http://127.0.0.1:8090/api/collections` (superuser token ile) 3 koleksiyonu listeler. Geçici `pb_data` silinip temiz test yapılabilir.

### Görev 3: Seed migration — varsayılan ayarlar
**Dosya:** `pb_migrations/1700000001_seed_settings.js`
settings'e 1 kayıt: `{site_name:"MangaSite", accent_color:"#e11d48", theme:"dark", items_per_page:24, hero_enabled:true, show_views:true, footer_text:"Powered by MangaSite"}`.
**Doğrulama:** serve sonrası `curl http://127.0.0.1:8090/api/collections/settings/records` → 1 kayıt.

### Görev 4: `setup.bat` + `setup.sh`
**Dosya:** `setup.bat`
```bat
@echo off
if not exist pocketbase.exe (echo pocketbase.exe bulunamadi! https://pocketbase.io/docs/ adresinden indirin. & pause & exit /b 1)
set /p PB_EMAIL="Admin e-posta: "
set /p PB_PASS="Admin sifre (min 10 karakter): "
pocketbase.exe migrate
pocketbase.exe superuser upsert %PB_EMAIL% %PB_PASS%
echo.
echo Kurulum tamam! Baslatmak icin: start.bat
pause
```
`setup.sh` aynı akış (bash, `./pocketbase`). 
**Doğrulama:** çalıştır → "Kurulum tamam!" çıktısı; `superuser upsert` exit 0.

### Görev 5: `start.bat` + `start.sh`
```bat
@echo off
pocketbase.exe serve --http=127.0.0.1:8090
```
(`.sh`: `./pocketbase serve --http=0.0.0.0:8090`). README'de LAN/host notu.
**Doğrulama:** `start.bat` → "Server started at http://127.0.0.1:8090" logu; tarayıcıda `/` pb_public'i servis eder.

### Görev 6: Ortak katman — `js/pb.js` + `css/style.css`
`pb.js`: SDK'yı CDN'den import etmiş sayfalara ortak yardımcılar:
- `const pb = new PocketBase(location.origin)`
- `loadSettings()`: settings kaydını çek, `document.documentElement.style.setProperty('--accent', s.accent_color)`, `data-theme` attribute, site adı/logo'yu header'a bas, sonucu cache'le
- `fileUrl(record, filename, thumb)` → `pb.files.getURL`
- ortak header/footer render (5 sayfada aynı nav: Ana Sayfa, Kütüphane; admin linki footer'da)

`style.css`: CSS değişkenleri (`--accent`, `--bg`, `--card`...), dark/light `[data-theme]` blokları, responsive grid kart bileşeni, header/footer.
**Doğrulama:** geçici test sayfasıyla settings'in çekilip accent renginin uygulandığını konsolda gör.

### Görev 7: Ana sayfa — `index.html` + `js/home.js`
Bölümler: (a) hero slider — `featured=true` mangalar (settings.hero_enabled ise), (b) "Son Yüklenenler" — son bölümü eklenen 12 seri (chapters'ı `-created` sıralı çekip manga'ya expand, uniq), (c) "Popüler" — `-views` ilk 10.
Kartlar: kapak thumb (`300x400` thumb param), başlık, son bölüm no, tür etiketi.
**Doğrulama:** elle 1-2 manga+bölüm ekledikten sonra ana sayfa kartları listeler; boş DB'de "Henüz seri yok" boş-durum mesajı.

### Görev 8: Kütüphane — `library.html` + `js/library.js`
Arama kutusu (title ~ filtresi, debounce 300ms), tür/status/type filtreleri (select), sıralama (yeni/A-Z/popüler), sayfalama (settings.items_per_page). Hepsi `pb.collection('mangas').getList(page, perPage, {filter, sort})` ile.
**Doğrulama:** filtre + arama kombinasyonu doğru sonuç döner; URL query'ye state yazılır (paylaşılabilir link).

### Görev 9: Manga detay — `manga.html` + `js/manga.js`
`?slug=` ile `getFirstListItem`. Kapak, başlık, yazar/çizer, durum, türler, açıklama; "İlk Bölüm / Son Bölüm" butonları; bölüm listesi (`-number` sıralı, yayınlanmışlar), her satır reader linki + tarih. Sayfa açılışında `views+1` (PB `update` yerine public rule sorunu olmaması için: views artırımı sadece admin SDK'sız yapılamayacağından basit tutulur — v1'de views artışını atla veya `chapters` view'ında say; **karar: v1'de views alanı sadece admin panelden manuel/otomatik değil, okuma sayacı v2**. YAGNI).
**Doğrulama:** var olmayan slug → "Bulunamadı" sayfası; bölüm linkleri doğru chapter ID taşır.

### Görev 10: Okuyucu — `reader.html` + `js/reader.js`
`?c=CHAPTER_ID` ile chapter + expand manga çek. İki mod (manga.type'a göre otomatik, kullanıcı değiştirebilir, localStorage'da saklanır):
- **Webtoon:** tüm sayfalar dikey akış, lazy-load (`loading="lazy"` + IntersectionObserver ile 3 sayfa önden yükleme)
- **Sayfalı (manga):** tek görsel, ←/→ ok tuşları + ekran sol/sağ tık, sayfa sayacı
Üst bar: seri adı (detaya link), bölüm dropdown (aynı manganın bölümleri), önceki/sonraki bölüm butonları. Bar scroll'da gizlenir.
**Doğrulama:** klavye ile gezinme, son sayfada "Sonraki Bölüm" yönlendirmesi, ilk/son bölümde butonlar disable.

### Görev 11: Admin — iskelet + giriş (`admin/index.html`, `css/admin.css`, `js/admin.js` bölüm 1)
Tek sayfa SPA: giriş formu → `pb.collection('_superusers').authWithPassword`. Başarılıysa sidebar'lı panel (Sekmeler: **Seriler**, **Bölümler**, **Ayarlar**), `pb.authStore.isValid` kontrolü + çıkış butonu. Auth localStorage'da kalıcı.
**Doğrulama:** yanlış şifre → hata mesajı; doğru giriş → panel; sayfa yenilenince oturum korunur.

### Görev 12: Admin — Seriler sekmesi (manga ekleme/düzenleme)
Tablo: kapak thumb, başlık, tür, durum, bölüm sayısı, düzenle/sil. "Yeni Seri" → modal form: tüm mangas alanları, kapak için dosya seçici + önizleme, slug otomatik üretim (başlıktan, düzenlenebilir), genres için etiket girişi. Kaydet: `FormData` ile create/update. Sil: onay + cascade uyarısı.
**Doğrulama:** ekle→listede görünür→düzenle→değişir→sil→kaybolur; siteye yansıdığını index'te gör.

### Görev 13: Admin — Bölümler sekmesi (bölüm yükleme/düzenleme)
Üstte seri seçici (dropdown). Seçilince bölüm tablosu (no, başlık, sayfa sayısı, yayın durumu, düzenle/sil). "Yeni Bölüm": numara, başlık, published checkbox, **çoklu görsel yükleme** (drag&drop alanı + dosya seçici, dosya adına göre doğal sıralama `localeCompare(..., {numeric:true})`, önizleme ızgarası, sürükleyerek yeniden sıralama). Büyük yüklemede progress göstergesi (dosyaları tek `FormData`'da `pages` alanına ekle). Düzenlemede mevcut sayfaları görüntüle + tek tek sil (`pages-` alan modifier'ı).
**Doğrulama:** 10+ görselli bölüm yüklenir, reader'da doğru sırada açılır; published=false bölüm sitede görünmez.

### Görev 14: Admin — Ayarlar sekmesi
settings kaydını forma yükle: site adı, açıklama, logo yükleme, accent renk (color picker), tema, sayfa başına öğe, hero aç/kapa, footer metni, sosyal linkler. Kaydet → update → "Kaydedildi" toast.
**Doğrulama:** accent rengini değiştir → siteyi yenile → tüm sayfalarda renk değişmiş.

### Görev 15: README.md (TR + EN özet)
İçerik: özellik listesi + ekran görüntüsü placeholder'ları; kurulum:
1. Repo'yu klonla / ZIP indir
2. [pocketbase.io](https://pocketbase.io/docs/) → kendi işletim sistemin için binary'yi indir, klasöre koy
3. `setup.bat` (Windows) / `./setup.sh` (Linux/macOS) çalıştır
4. `start.bat` → site: `http://127.0.0.1:8090`, admin: `/admin/`, PB paneli: `/_/`
Ek bölümler: yayına alma (VPS + systemd örneği, `--http=0.0.0.0:80`), yedekleme (`pb_data` kopyala), SSS.
**Doğrulama:** temiz klasörde README adımları birebir izlenerek site ayağa kalkar.

### Görev 16: Uçtan uca test + GitHub'a hazırlık
1. `pb_data`'yı sil → `setup.bat` → `start.bat` → temiz kurulum çalışıyor mu
2. Admin'den 2 seri + 3'er bölüm yükle; 5 sayfayı gez (mobil görünüm dahil, DevTools)
3. `git init` + ilk commit (kullanıcı onayıyla `edsporfekt` hesabına yeni public repo push — repo adı kullanıcıya sorulacak, ör. `manga-site`)
**Doğrulama:** `git status` temiz, `pb_data`/`pocketbase.exe` repoda yok.

---

## Riskler / Kararlar
- **PB 0.39 migration API'si:** JSVM `Collection` şema formatı sürüme duyarlı — Görev 2'de gerçek deneme + `migrate` çıktısıyla doğrulanacak (tahmin değil).
- **Çoklu dosya limiti:** PB varsayılan istek boyutu ~32MB; çok sayfalı bölümlerde README'ye not + gerekirse `--maxBodySize` yönlendirmesi... (PB'de ilgili ayar varsa Görev 13'te doğrulanır; yoksa sayfaları parçalı `pages+` append ile yükleme fallback'i uygulanır).
- **Views sayacı:** public update kuralı güvenlik açığı olur → v1'de okuyucu tarafı sayaç yok (YAGNI). İleride PB hook (`pb_hooks/`) ile güvenli sayaç eklenebilir.
- **Bölüm görsel sırası:** PB çoklu dosya sırası yüklenme sırasını korur; admin'deki sıralama UI'ı bu sırayla FormData'ya ekler.
- **Tek komut hedefi:** karşılandı — `start.bat` = `pocketbase serve` (site + API + PB admin UI aynı process).

## Açık Sorular (uygulamaya başlamadan)
1. Site dili sadece Türkçe mi, yoksa arayüz metinleri ayarlardan değiştirilebilir mi? (v1: TR sabit, öneri)
2. GitHub repo adı?
