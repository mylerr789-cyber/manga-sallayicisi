"use client";

import { useEffect, useState } from "react";
import { pbClient } from "@/lib/pb-client";
import { fileUrl } from "@/lib/pb";
import type { SiteSettings } from "@/lib/types";
import { GENRES } from "@/lib/types";

const SOCIAL_KEYS = ["discord", "twitter", "instagram", "youtube", "telegram"];

export default function SettingsAdmin() {
  const [rec, setRec] = useState<SiteSettings | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [newGenre, setNewGenre] = useState("");

  useEffect(() => {
    pbClient()
      .collection("settings")
      .getList<SiteSettings>(1, 1)
      .then((r) => {
        if (r.items[0]) {
          setRec(r.items[0]);
          if (r.items[0].logo) setLogoPreview(fileUrl(r.items[0], r.items[0].logo));
        }
      })
      .catch(() => {});
  }, []);

  if (!rec) return <p className="mt-8 text-center text-muted">Yükleniyor...</p>;

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setRec((p) => (p ? { ...p, [key]: value } : p));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rec) return;
    setBusy(true);
    setMsg("");
    try {
      const fd = new FormData();
      fd.set("site_name", rec.site_name);
      fd.set("site_description", rec.site_description);
      fd.set("accent_color", rec.accent_color);
      fd.set("theme", rec.theme);
      fd.set("hero_enabled", rec.hero_enabled ? "true" : "false");
      fd.set("items_per_page", String(rec.items_per_page));
      fd.set("footer_text", rec.footer_text);
      fd.set("social_links", JSON.stringify(rec.social_links || {}));
      fd.set("genres", JSON.stringify(rec.genres?.length ? rec.genres : GENRES));
      if (logo) fd.set("logo", logo);
      await pbClient().collection("settings").update(rec.id, fd);
      setMsg("✓ Kaydedildi — site tarafına yansıması 1 dakikayı bulabilir.");
    } catch {
      setMsg("✗ Kaydetme başarısız.");
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-lg border border-line bg-bg-soft px-3 py-2 text-sm outline-none focus:border-accent";
  const label = "block text-xs font-semibold uppercase text-muted mb-1";

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold">Site Ayarları</h1>
      <form onSubmit={submit} className="mt-5 space-y-4">
        <div>
          <label className={label}>Site Adı</label>
          <input required value={rec.site_name} onChange={(e) => set("site_name", e.target.value)} className={input} />
        </div>

        <div>
          <label className={label}>Site Açıklaması</label>
          <textarea
            value={rec.site_description}
            onChange={(e) => set("site_description", e.target.value)}
            rows={2}
            className={input}
          />
        </div>

        <div className="flex items-center gap-4">
          <div>
            <label className={label}>Logo</label>
            <label className="block cursor-pointer">
              <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-lg border border-dashed border-line bg-bg-soft">
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreview} alt="" className="h-full w-full object-contain" />
                ) : (
                  <span className="text-xs text-muted">Seç</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setLogo(f);
                    setLogoPreview(URL.createObjectURL(f));
                  }
                }}
              />
            </label>
          </div>

          <div>
            <label className={label}>Vurgu Rengi</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={rec.accent_color || "#e11d48"}
                onChange={(e) => set("accent_color", e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border border-line bg-bg-soft"
              />
              <code className="text-sm text-muted">{rec.accent_color}</code>
            </div>
          </div>

          <div>
            <label className={label}>Tema</label>
            <select value={rec.theme} onChange={(e) => set("theme", e.target.value as "dark" | "light")} className={input}>
              <option value="dark">Koyu</option>
              <option value="light">Açık</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Sayfa Başına Seri</label>
            <input
              type="number"
              min={1}
              max={100}
              value={rec.items_per_page}
              onChange={(e) => set("items_per_page", parseInt(e.target.value, 10) || 24)}
              className={input}
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={rec.hero_enabled}
                onChange={(e) => set("hero_enabled", e.target.checked)}
                className="accent-[var(--accent)]"
              />
              Ana sayfa hero aktif
            </label>
          </div>
        </div>

        <div>
          <label className={label}>Footer Metni</label>
          <input value={rec.footer_text} onChange={(e) => set("footer_text", e.target.value)} className={input} />
        </div>

        <div>
          <label className={label}>Türler</label>
          <p className="mb-2 text-xs text-muted">
            Seri formunda ve kütüphane filtresinde görünen tür listesi. Silinen türler mevcut serilerden otomatik kalkmaz.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(rec.genres?.length ? rec.genres : GENRES).map((g) => (
              <span
                key={g}
                className="flex items-center gap-1.5 rounded-full border border-line bg-bg-soft px-2.5 py-1 text-xs"
              >
                {g}
                <button
                  type="button"
                  aria-label={`${g} türünü sil`}
                  onClick={() =>
                    set("genres", (rec.genres?.length ? rec.genres : GENRES).filter((x) => x !== g))
                  }
                  className="text-muted transition-colors hover:text-red-500"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              value={newGenre}
              onChange={(e) => setNewGenre(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const g = newGenre.trim();
                  const cur = rec.genres?.length ? rec.genres : GENRES;
                  if (g && !cur.includes(g)) set("genres", [...cur, g]);
                  setNewGenre("");
                }
              }}
              placeholder="Yeni tür (Enter ile ekle)"
              className={input}
            />
            <button
              type="button"
              onClick={() => {
                const g = newGenre.trim();
                const cur = rec.genres?.length ? rec.genres : GENRES;
                if (g && !cur.includes(g)) set("genres", [...cur, g]);
                setNewGenre("");
              }}
              className="shrink-0 rounded-lg border border-line bg-bg-soft px-3 text-sm hover:border-accent"
            >
              Ekle
            </button>
          </div>
        </div>

        <div>
          <label className={label}>Sosyal Bağlantılar</label>
          <div className="space-y-2">
            {SOCIAL_KEYS.map((key) => (
              <div key={key} className="flex items-center gap-2">
                <span className="w-24 text-sm capitalize text-muted">{key}</span>
                <input
                  type="url"
                  placeholder={`https://...`}
                  value={rec.social_links?.[key] || ""}
                  onChange={(e) =>
                    set("social_links", { ...(rec.social_links || {}), [key]: e.target.value })
                  }
                  className={input}
                />
              </div>
            ))}
          </div>
        </div>

        {msg && <p className={`text-sm ${msg.startsWith("✓") ? "text-green-500" : "text-red-500"}`}>{msg}</p>}

        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </form>
    </div>
  );
}
