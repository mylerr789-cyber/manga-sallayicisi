# Manga & Webtoon Yayın Sitesi — Next.js + PocketBase Planı

> **For Hermes:** Bu planı görev görev uygula.

**Hedef:** `setup.bat` ile kurulan, `start.bat` ile tek komutla (PocketBase + Next.js birlikte) ayağa kalkan, GitHub'da ücretsiz yayınlanacak, admin panelinden tamamen ayarlanabilir manga/webtoon sitesi.

**Mimari:** Backend = PocketBase (DB + dosya depolama + auth, migration'larla otomatik şema). Frontend = Next.js 15 (App Router) + Tailwind CSS v4 + PocketBase JS SDK. Admin paneli Next.js içinde `/admin` route'u (client-side, superuser auth). Production: `next build` + `next start`; `start.bat` iki süreci `concurrently` ile tek komutta başlatır.

**Teknoloji:** PocketBase 0.39.x (`D:\basitsss\pocketbase.exe` hazır), Node 22 (mevcut), Next.js 15, Tailwind CSS 4, pocketbase SDK ^0.26, concurrently.

---

## Dizin Yapısı (nihai)

```
D:\basitsss\
├── pocketbase.exe            # kullanıcı indirir (gitignore)
├── pb_migrations\            # şema + seed (otomatik uygulanır)
│   ├── 1700000000_init_collections.js
│   └── 1700000001_seed_settings.js
├── pb_data\                  # runtime (gitignore)
├── setup.bat / setup.sh      # KURULUM: node kontrol + npm install + migrate + superuser + build
├── start.bat / start.sh      # TEK KOMUT: pocketbase serve + next start (concurrently)
├── web\                      # Next.js uygulaması
│   ├── package.json
│   ├── next.config.ts        # images.remotePatterns → 127.0.0.1:8090
│   ├── .env.local.example    # NEXT_PUBLIC_PB_URL=http://127.0.0.1:8090
│   ├── src\
│   │   ├── app\
│   │   │   ├── layout.tsx            # settings çek → tema/accent/site adı, Header/Footer
│   │   │   ├── page.tsx              # 1. Ana sayfa
│   │   │   ├── library\page.tsx      # 2. Kütüphane
│   │   │   ├── manga\[slug]\page.tsx # 3. Manga detay
│   │   │   ├── read\[chapterId]\page.tsx # 4. Okuyucu
│   │   │   ├── admin\                # 5. Admin dashboard
│   │   │   │   ├── layout.tsx        # auth guard + sidebar
│   │   │   │   ├── page.tsx          # özet (seri/bölüm sayısı)
│   │   │   │   ├── series\page.tsx   # manga ekle/düzenle
│   │   │   │   ├── chapters\page.tsx # bölüm yükle/düzenle
│   │   │   │   └── settings\page.tsx # site ayarları
│   │   │   └── globals.css           # Tailwind + CSS değişkenleri
│   │   ├── lib\
│   │   │   ├── pb.ts                 # PocketBase client factory + fileUrl helper
│   │   │   └── types.ts              # Manga, Chapter, Settings tipleri
│   │   └── components\
│   │       ├── Header.tsx  Footer.tsx  MangaCard.tsx  HeroSlider.tsx
│   │       ├── reader\ (WebtoonReader.tsx, PagedReader.tsx, ReaderBar.tsx)
│   │       └── admin\ (LoginForm.tsx, MangaForm.tsx, ChapterForm.tsx, PageUploader.tsx)
├── .gitignore
├── README.md                 # TR+EN kurulum
└── LICENSE                   # MIT
```

## Veri Modeli (PocketBase)

### `mangas`
| Alan | Tip |
|---|---|
| title | text, required |
| slug | text, required, unique |
| cover | file (1, image) |
| description | text |
| author, artist | text |
| status | select: ongoing/completed/hiatus/cancelled |
| type | select: manga/webtoon/manhwa/manhua |
| genres | json (string[]) |
| featured | bool |

Kurallar: list/view `""` (public), yazma `null` (sadece superuser).

### `chapters`
| Alan | Tip |
|---|---|
| manga | relation→mangas, required, cascadeDelete |
| number | number, required (10.5 destekli) |
| title | text |
| pages | file (çoklu, max 200, image) |
| published | bool |

list/view: `published = true`; yazma superuser.

### `settings` (tek kayıt, seed ile)
site_name, site_description, logo(file), accent_color(text), theme(dark/light), hero_enabled(bool), items_per_page(number), footer_text, social_links(json).
list/view public; yazma superuser.

**Admin auth:** `pb.collection("_superusers").authWithPassword` — ayrı kullanıcı sistemi yok (YAGNI).

---

## Görevler

### Görev 1: Temel dosyalar
`.gitignore` (pb_data/, pocketbase.exe, pocketbase, web/node_modules/, web/.next/, web/.env.local, .hermes/), MIT `LICENSE`.
**Doğrulama:** dosyalar mevcut.

### Görev 2: PB init migration
`pb_migrations/1700000000_init_collections.js` — 3 koleksiyon, şema + kurallar (PB 0.39 JSVM formatı; gerçek `migrate` çıktısıyla doğrula, tahmin yok).
**Doğrulama:** `./pocketbase.exe migrate` hatasız; serve sonrası koleksiyonlar API'de görünür.

### Görev 3: PB seed migration
`1700000001_seed_settings.js` — varsayılan settings kaydı: `{site_name:"MangaSite", accent_color:"#e11d48", theme:"dark", items_per_page:24, hero_enabled:true, footer_text:"Powered by MangaSite"}`.
**Doğrulama:** `curl http://127.0.0.1:8090/api/collections/settings/records` → 1 kayıt.

### Görev 4: Next.js iskeleti
```bash
cd /d/basitsss && npx create-next-app@latest web --ts --tailwind --app --src-dir --no-eslint --use-npm --yes
cd web && npm i pocketbase
```
`next.config.ts`: `images.remotePatterns` → `http://127.0.0.1:8090/api/files/**`. `.env.local.example` + `.env.local`: `NEXT_PUBLIC_PB_URL=http://127.0.0.1:8090`.
**Doğrulama:** `npm run dev` → localhost:3000 açılır.

### Görev 5: `lib/pb.ts` + `lib/types.ts`
- `newPB()` client factory (server component'lerde her istek için yeni instance), `fileUrl(record, filename, thumb?)`
- `getSettings()`: settings kaydı, `revalidate: 60` cache'li fetch
- TS tipleri: `Manga`, `Chapter`, `SiteSettings`
**Doğrulama:** `npx tsc --noEmit` temiz.

### Görev 6: `layout.tsx` + Header/Footer + tema
Root layout server component: `getSettings()` → `<html data-theme={s.theme} style={{'--accent': s.accent_color}}>`, `<title>` = site_name. Header: logo/site adı, nav (Ana Sayfa, Kütüphane), arama ikonu. Footer: footer_text + sosyal linkler. `globals.css`: Tailwind v4 `@theme` ile `--accent` bağlama, dark/light değişkenleri.
**Doğrulama:** PB'de accent değiştir → sayfa yenile → renk değişir.

### Görev 7: Ana sayfa (`app/page.tsx`)
Server component: (a) hero — `featured=true` (hero_enabled ise), (b) Son Eklenen Bölümler — son 12 chapter `-created` + manga expand, seri bazında uniq, (c) tüm seriler grid. `MangaCard`: kapak (`next/image`, PB thumb `300x420`), başlık, tür rozeti, son bölüm.
**Doğrulama:** test verisiyle kartlar görünür; boş DB'de boş-durum mesajı.

### Görev 8: Kütüphane (`app/library/page.tsx`)
`searchParams` tabanlı (paylaşılabilir URL): arama (`title ~`), tür/status/type filtreleri, sıralama (yeni/A-Z), sayfalama (items_per_page). Filtre barı client component, listeyi server render.
**Doğrulama:** `?q=x&genre=y&page=2` kombinasyonları doğru sonuç döner.

### Görev 9: Manga detay (`app/manga/[slug]/page.tsx`)
`getFirstListItem(slug=...)`. Kapak, meta, açıklama, İlk/Son Bölüm butonları, bölüm listesi (`-number`, published, tarihli). `generateMetadata` ile SEO title/og. Bulunamazsa `notFound()`.
**Doğrulama:** geçersiz slug → 404 sayfası; bölüm linkleri `/read/[id]`.

### Görev 10: Okuyucu (`app/read/[chapterId]/page.tsx`)
Server'da chapter + manga expand + aynı serinin bölüm listesi çek → client `Reader` bileşenine ver. İki mod (manga.type'tan otomatik, kullanıcı değiştirir, localStorage):
- **WebtoonReader:** dikey akış, lazy-load
- **PagedReader:** tek sayfa, ←/→ klavye + sol/sağ tık, sayaç
`ReaderBar`: seri linki, bölüm dropdown, önceki/sonraki butonları; scroll'da gizlenir.
**Doğrulama:** klavye gezinme, son sayfada sonraki bölüme geçiş, uçlarda disable.

### Görev 11: Admin — guard + login (`app/admin/layout.tsx`, `LoginForm`)
Client layout: `pb.authStore.isValid && isSuperuser` değilse login formu; girişte `_superusers.authWithPassword`, authStore localStorage'da kalıcı. Sidebar: Özet, Seriler, Bölümler, Ayarlar, Çıkış. `robots: noindex`.
**Doğrulama:** yanlış şifre hata; giriş sonrası yenilemede oturum korunur.

### Görev 12: Admin — Seriler (`admin/series/page.tsx`, `MangaForm`)
Tablo (kapak, başlık, tür, durum, bölüm sayısı) + Yeni/Düzenle modal: tüm alanlar, kapak önizlemeli dosya seçici, slug otomatik (başlıktan, düzenlenebilir), genres etiket girişi. FormData ile create/update; sil → onay + cascade uyarısı.
**Doğrulama:** CRUD tam tur; sitede yansıması görünür.

### Görev 13: Admin — Bölümler (`admin/chapters/page.tsx`, `ChapterForm`, `PageUploader`)
Seri seçici → bölüm tablosu. Yeni Bölüm: numara, başlık, published, **çoklu görsel drag&drop** (dosya adına doğal sıralama `localeCompare(numeric)`, önizleme ızgarası, sürükle-sırala), tek FormData'da `pages`, yükleme progress'i. Düzenlemede mevcut sayfaları listele + tek tek sil (`pages-` modifier).
**Doğrulama:** 10+ sayfalık bölüm yüklenir, okuyucuda sıra doğru; published=false sitede görünmez. Büyük yüklemede PB body limiti test edilir (gerekirse `pages+` ile parçalı yükleme fallback).

### Görev 14: Admin — Ayarlar (`admin/settings/page.tsx`)
Settings kaydı forma: site adı, açıklama, logo, accent (color picker), tema, sayfa/öğe, hero, footer, sosyal linkler. Update → toast. (Site tarafı 60sn cache — README'ye not.)
**Doğrulama:** renk değiştir → sitede değişir.

### Görev 15: `setup.bat`/`setup.sh` + `start.bat`/`start.sh`
`setup.bat`:
```bat
@echo off
where node >nul 2>nul || (echo Node.js gerekli: https://nodejs.org & pause & exit /b 1)
if not exist pocketbase.exe (echo pocketbase.exe eksik: https://pocketbase.io/docs/ & pause & exit /b 1)
set /p PB_EMAIL="Admin e-posta: "
set /p PB_PASS="Admin sifre (min 10): "
pocketbase.exe migrate
pocketbase.exe superuser upsert %PB_EMAIL% %PB_PASS%
cd web && call npm install && call npm run build && cd ..
echo Kurulum tamam! Baslat: start.bat
pause
```
`start.bat`:
```bat
@echo off
cd web && npx concurrently -n pb,web -c blue,green "..\pocketbase.exe serve --dir ..\pb_data --migrationsDir ..\pb_migrations" "npm run start"
```
(concurrently `web/package.json`'da devDependency; `--dir/--migrationsDir` yol doğruluğu gerçek çalıştırmayla test edilir — gerekirse start.bat kökten iki `start` penceresi açan fallback.) `.sh` eşdeğerleri.
**Doğrulama:** temiz makine simülasyonu: `pb_data` + `node_modules` sil → setup → start → site :3000, PB :8090 çalışır.

### Görev 16: README + uçtan uca test + GitHub
README (TR + EN özet): gereksinimler (Node 18+, PocketBase binary), 3 adımlı kurulum, adresler (site `:3000`, admin `/admin`, PB paneli `:8090/_/`), yayına alma (VPS/systemd, reverse proxy notu), yedekleme (`pb_data`). Test: temiz kurulum + 2 seri, 3'er bölüm, 5 sayfa gezisi (mobil dahil). `git init` + commit + kullanıcı onayıyla public repo push.
**Doğrulama:** README adımlarıyla sıfırdan kurulum çalışır; repoda `pb_data`/`node_modules`/exe yok.

---

## Riskler / Kararlar
- **Node zorunluluğu:** son kullanıcı Node 18+ kurmalı (README'de belirgin). Vanilla sürüme göre tek ek gereksinim.
- **İki process:** concurrently ile tek komutta; pencere kapanınca ikisi de durur.
- **PB 0.39 migration formatı:** Görev 2'de gerçek `migrate` çıktısıyla doğrulanır.
- **next/image + PB:** remotePatterns 127.0.0.1 sabit; farklı host için `NEXT_PUBLIC_PB_URL` + config notu README'de.
- **Views sayacı:** public update güvenlik açığı → v1'de yok (ileride pb_hooks ile).
- **Settings cache:** site tarafında 60sn revalidate — ayar değişimi en geç 1dk'da yansır.

## Açık Sorular
1. Arayüz dili v1'de sabit Türkçe mi? (önerim: evet)
2. GitHub repo adı?
