"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { pbClient } from "@/lib/pb-client";
import { fileUrl } from "@/lib/pb";
import { GENRES, STATUS_LABELS, TYPE_LABELS, type Manga } from "@/lib/types";

function slugify(s: string): string {
  const map: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" };
  return s
    .toLowerCase()
    .replace(/[çğıöşü]/g, (c) => map[c] || c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function SeriesAdmin() {
  const [items, setItems] = useState<Manga[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [editing, setEditing] = useState<Manga | "new" | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const pb = pbClient();
      const list = await pb.collection("mangas").getFullList<Manga>({ sort: "-created" });
      setItems(list);
      const chapters = await pb.collection("chapters").getFullList<{ manga: string }>({ fields: "manga" });
      const c: Record<string, number> = {};
      for (const ch of chapters) c[ch.manga] = (c[ch.manga] || 0) + 1;
      setCounts(c);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(m: Manga) {
    if (!confirm(`"${m.title}" ve TÜM bölümleri silinecek. Emin misin?`)) return;
    await pbClient().collection("mangas").delete(m.id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Seriler</h1>
        <button
          onClick={() => setEditing("new")}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          + Yeni Seri
        </button>
      </div>

      {loading ? (
        <p className="mt-8 text-center text-muted">Yükleniyor...</p>
      ) : items.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-line p-8 text-center text-sm text-muted">
          Henüz seri yok. &quot;Yeni Seri&quot; ile başla.
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-sm">
            <thead className="bg-bg-soft text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-3 py-2.5">Seri</th>
                <th className="px-3 py-2.5">Kategori</th>
                <th className="px-3 py-2.5">Durum</th>
                <th className="px-3 py-2.5">Bölüm</th>
                <th className="px-3 py-2.5">Öne Çıkan</th>
                <th className="px-3 py-2.5 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr key={m.id} className="border-t border-line bg-card">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2.5">
                      {m.cover ? (
                        <Image
                          src={fileUrl(m, m.cover, "300x420")}
                          alt=""
                          width={32}
                          height={45}
                          className="rounded object-cover"
                        />
                      ) : (
                        <span className="grid h-11 w-8 place-items-center rounded bg-bg-soft text-xs">📖</span>
                      )}
                      <div>
                        <p className="font-medium">{m.title}</p>
                        <p className="text-xs text-muted">/{m.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-muted">{TYPE_LABELS[m.type] || "—"}</td>
                  <td className="px-3 py-2 text-muted">{STATUS_LABELS[m.status] || "—"}</td>
                  <td className="px-3 py-2 text-muted">{counts[m.id] || 0}</td>
                  <td className="px-3 py-2">{m.featured ? "⭐" : ""}</td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => setEditing(m)} className="rounded px-2 py-1 text-accent hover:bg-bg-soft">
                      Düzenle
                    </button>
                    <button onClick={() => remove(m)} className="rounded px-2 py-1 text-red-500 hover:bg-bg-soft">
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <MangaForm
          manga={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function MangaForm({
  manga,
  onClose,
  onSaved,
}: {
  manga: Manga | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(manga?.title || "");
  const [slug, setSlug] = useState(manga?.slug || "");
  const [slugTouched, setSlugTouched] = useState(!!manga);
  const [description, setDescription] = useState(manga?.description || "");
  const [author, setAuthor] = useState(manga?.author || "");
  const [artist, setArtist] = useState(manga?.artist || "");
  const [status, setStatus] = useState(manga?.status || "ongoing");
  const [type, setType] = useState(manga?.type || "webtoon");
  const [genres, setGenres] = useState<string[]>(
    Array.isArray(manga?.genres) ? manga!.genres! : []
  );
  const [featured, setFeatured] = useState(manga?.featured || false);
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState(
    manga?.cover ? fileUrl(manga, manga.cover, "300x420") : ""
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const fd = new FormData();
      fd.set("title", title);
      fd.set("slug", slug || slugify(title));
      fd.set("description", description);
      fd.set("author", author);
      fd.set("artist", artist);
      fd.set("status", status);
      fd.set("type", type);
      fd.set("genres", JSON.stringify(genres));
      fd.set("featured", featured ? "true" : "false");
      if (cover) fd.set("cover", cover);

      const pb = pbClient();
      if (manga) await pb.collection("mangas").update(manga.id, fd);
      else await pb.collection("mangas").create(fd);
      onSaved();
    } catch (ex) {
      const msg = ex instanceof Error ? ex.message : "Kayıt başarısız";
      setErr(`Hata: ${msg} (slug benzersiz olmalı, sadece a-z 0-9 -)`);
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-lg border border-line bg-bg-soft px-3 py-2 text-sm outline-none focus:border-accent";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line bg-card p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold">{manga ? "Seriyi Düzenle" : "Yeni Seri"}</h2>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <div className="flex gap-4">
            <div className="w-28 shrink-0">
              <label className="block cursor-pointer">
                <div className="relative aspect-[3/4.2] overflow-hidden rounded-lg border border-dashed border-line bg-bg-soft">
                  {coverPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverPreview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-center text-xs text-muted">
                      Kapak
                      <br />
                      Seç
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setCover(f);
                      setCoverPreview(URL.createObjectURL(f));
                    }
                  }}
                />
              </label>
            </div>
            <div className="flex-1 space-y-3">
              <input
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
                placeholder="Başlık *"
                className={input}
              />
              <input
                required
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                placeholder="slug (url) *"
                className={input}
              />
              <div className="grid grid-cols-2 gap-3">
                <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Yazar" className={input} />
                <input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Çizer" className={input} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className={input}>
                  {Object.entries(TYPE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
                <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={input}>
                  {Object.entries(STATUS_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Açıklama"
            rows={4}
            className={input}
          />

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase text-muted">Türler</p>
            <div className="flex flex-wrap gap-1.5">
              {GENRES.map((g) => {
                const active = genres.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() =>
                      setGenres(active ? genres.filter((x) => x !== g) : [...genres, g])
                    }
                    className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                      active
                        ? "border-accent bg-accent text-white"
                        : "border-line bg-bg-soft text-muted hover:border-accent"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="accent-[var(--accent)]"
            />
            Ana sayfada öne çıkar (hero)
          </label>

          {err && <p className="text-sm text-red-500">{err}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-line px-4 py-2 text-sm hover:bg-bg-soft">
              İptal
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
