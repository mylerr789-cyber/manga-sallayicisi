"use client";

import { useCallback, useEffect, useState } from "react";
import { pbClient } from "@/lib/pb-client";
import { fileUrl } from "@/lib/pb";
import type { Chapter, Manga } from "@/lib/types";

export default function ChaptersAdmin() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [mangaId, setMangaId] = useState("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [editing, setEditing] = useState<Chapter | "new" | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    pbClient()
      .collection("mangas")
      .getFullList<Manga>({ sort: "title" })
      .then((list) => {
        setMangas(list);
        if (list.length && !mangaId) setMangaId(list[0].id);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadChapters = useCallback(async () => {
    if (!mangaId) return;
    setLoading(true);
    try {
      const pb = pbClient();
      setChapters(
        await pb.collection("chapters").getFullList<Chapter>({
          filter: pb.filter("manga.id = {:mid}", { mid: mangaId }),
          sort: "-number",
        })
      );
    } catch {}
    setLoading(false);
  }, [mangaId]);

  useEffect(() => {
    loadChapters();
  }, [loadChapters]);

  async function remove(ch: Chapter) {
    if (!confirm(`Bölüm ${ch.number} silinecek. Emin misin?`)) return;
    await pbClient().collection("chapters").delete(ch.id);
    loadChapters();
  }

  async function togglePublish(ch: Chapter) {
    await pbClient().collection("chapters").update(ch.id, { published: !ch.published });
    loadChapters();
  }

  const manga = mangas.find((m) => m.id === mangaId);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Bölümler</h1>
        <button
          onClick={() => setEditing("new")}
          disabled={!mangaId}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
        >
          + Yeni Bölüm
        </button>
      </div>

      {mangas.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-line p-8 text-center text-sm text-muted">
          Önce Seriler sekmesinden bir seri eklemelisin.
        </p>
      ) : (
        <>
          <select
            value={mangaId}
            onChange={(e) => setMangaId(e.target.value)}
            className="mt-4 w-full max-w-sm rounded-lg border border-line bg-card px-3 py-2 text-sm outline-none focus:border-accent"
          >
            {mangas.map((m) => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>

          {loading ? (
            <p className="mt-8 text-center text-muted">Yükleniyor...</p>
          ) : chapters.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-line p-8 text-center text-sm text-muted">
              Bu seride bölüm yok.
            </p>
          ) : (
            <div className="mt-5 overflow-x-auto rounded-xl border border-line">
              <table className="w-full text-sm">
                <thead className="bg-bg-soft text-left text-xs uppercase text-muted">
                  <tr>
                    <th className="px-3 py-2.5">Bölüm</th>
                    <th className="px-3 py-2.5">Başlık</th>
                    <th className="px-3 py-2.5">Sayfa</th>
                    <th className="px-3 py-2.5">Durum</th>
                    <th className="px-3 py-2.5">Tarih</th>
                    <th className="px-3 py-2.5 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {chapters.map((ch) => (
                    <tr key={ch.id} className="border-t border-line bg-card">
                      <td className="px-3 py-2 font-medium">{ch.number}</td>
                      <td className="px-3 py-2 text-muted">{ch.title || "—"}</td>
                      <td className="px-3 py-2 text-muted">{ch.pages?.length || 0}</td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => togglePublish(ch)}
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            ch.published
                              ? "bg-green-500/15 text-green-500"
                              : "bg-yellow-500/15 text-yellow-500"
                          }`}
                        >
                          {ch.published ? "Yayında" : "Taslak"}
                        </button>
                      </td>
                      <td className="px-3 py-2 text-xs text-muted">
                        {new Date(ch.created).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button onClick={() => setEditing(ch)} className="rounded px-2 py-1 text-accent hover:bg-bg-soft">
                          Düzenle
                        </button>
                        <button onClick={() => remove(ch)} className="rounded px-2 py-1 text-red-500 hover:bg-bg-soft">
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {editing && manga && (
        <ChapterForm
          manga={manga}
          chapter={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            loadChapters();
          }}
        />
      )}
    </div>
  );
}

/* ---------------- Bölüm formu ---------------- */

function ChapterForm({
  manga,
  chapter,
  onClose,
  onSaved,
}: {
  manga: Manga;
  chapter: Chapter | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [number, setNumber] = useState(chapter ? String(chapter.number) : "");
  const [title, setTitle] = useState(chapter?.title || "");
  const [published, setPublished] = useState(chapter?.published ?? true);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [err, setErr] = useState("");

  function addFiles(list: FileList | File[]) {
    const imgs = Array.from(list).filter((f) => f.type.startsWith("image/"));
    // dosya adına göre doğal sıralama (1, 2, 10 doğru sırada)
    imgs.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    setFiles((prev) => [...prev, ...imgs]);
  }

  function move(i: number, dir: -1 | 1) {
    setFiles((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function removeExistingPage(filename: string) {
    if (!chapter) return;
    if (!confirm(`${filename} silinsin mi?`)) return;
    await pbClient().collection("chapters").update(chapter.id, { "pages-": filename });
    onSaved();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const pb = pbClient();
      const fd = new FormData();
      fd.set("manga", manga.id);
      fd.set("number", number);
      fd.set("title", title);
      fd.set("published", published ? "true" : "false");
      // yeni dosyalar: mevcut kayda append (+), yeni kayıtta normal alan
      for (const f of files) fd.append(chapter ? "pages+" : "pages", f);

      setProgress(files.length ? `${files.length} sayfa yükleniyor...` : "Kaydediliyor...");
      if (chapter) await pb.collection("chapters").update(chapter.id, fd);
      else await pb.collection("chapters").create(fd);
      onSaved();
    } catch (ex) {
      const rd = (ex as { response?: { data?: Record<string, { code?: string; message?: string }> } })?.response?.data;
      if (rd) {
        const tr: Record<string, string> = {
          validation_not_unique: "aynı seride bu bölüm numarası zaten var",
          validation_invalid_format: "geçersiz format",
          validation_required: "boş bırakılamaz",
        };
        const parts = Object.entries(rd).map(([k, v]) => {
          const t = v?.code ? tr[v.code] || v.message : v?.message || "geçersiz";
          return k === "number" ? `bölüm no: ${t}` : `${k}: ${t}`;
        });
        setErr(`Hata: ${parts.join(" · ")}`);
      } else {
        const msg = ex instanceof Error ? ex.message : "Kayıt başarısız";
        setErr(`Hata: ${msg}`);
      }
    } finally {
      setBusy(false);
      setProgress("");
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
        <h2 className="text-lg font-bold">
          {chapter ? `Bölüm ${chapter.number} — Düzenle` : "Yeni Bölüm"}
          <span className="ml-2 text-sm font-normal text-muted">({manga.title})</span>
        </h2>

        <form onSubmit={submit} className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              type="number"
              step="0.1"
              min="0"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="Bölüm no *"
              className={input}
            />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Başlık (opsiyonel)"
              className={input}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="accent-[var(--accent)]"
            />
            Yayında (kapatırsan taslak olur, sitede görünmez)
          </label>

          {/* mevcut sayfalar */}
          {chapter && chapter.pages?.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase text-muted">
                Mevcut Sayfalar ({chapter.pages.length})
              </p>
              <div className="grid max-h-48 grid-cols-6 gap-1.5 overflow-y-auto sm:grid-cols-8">
                {chapter.pages.map((p, i) => (
                  <div key={p} className="group relative aspect-[3/4] overflow-hidden rounded border border-line">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={fileUrl(chapter, p, "0x100")} alt="" className="h-full w-full object-cover" />
                    <span className="absolute bottom-0 left-0 bg-black/70 px-1 text-[10px] text-white">{i + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeExistingPage(p)}
                      className="absolute right-0 top-0 hidden bg-red-600 px-1 text-[10px] text-white group-hover:block"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* yeni sayfa yükleme */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              addFiles(e.dataTransfer.files);
            }}
            className={`rounded-xl border-2 border-dashed p-5 text-center transition-colors ${
              dragOver ? "border-accent bg-accent/5" : "border-line"
            }`}
          >
            <p className="text-sm text-muted">
              Sayfa görsellerini buraya sürükle veya{" "}
              <label className="cursor-pointer text-accent hover:underline">
                dosya seç
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => e.target.files && addFiles(e.target.files)}
                />
              </label>
            </p>
            <p className="mt-1 text-xs text-muted/70">
              Dosya adına göre otomatik sıralanır (01.jpg, 02.jpg...)
            </p>
          </div>

          {files.length > 0 && (
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase text-muted">
                  Yüklenecek ({files.length})
                </p>
                <button type="button" onClick={() => setFiles([])} className="text-xs text-red-500 hover:underline">
                  Temizle
                </button>
              </div>
              <div className="grid max-h-56 grid-cols-4 gap-1.5 overflow-y-auto sm:grid-cols-6">
                {files.map((f, i) => (
                  <div key={`${f.name}-${i}`} className="relative overflow-hidden rounded border border-line bg-bg-soft">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={URL.createObjectURL(f)} alt="" className="aspect-[3/4] w-full object-cover" />
                    <div className="flex items-center justify-between px-1 py-0.5 text-[10px]">
                      <button type="button" onClick={() => move(i, -1)} className="px-0.5 text-muted hover:text-fg">◀</button>
                      <span className="truncate text-muted">{i + 1}</span>
                      <button type="button" onClick={() => move(i, 1)} className="px-0.5 text-muted hover:text-fg">▶</button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFiles(files.filter((_, x) => x !== i))}
                      className="absolute right-0 top-0 bg-red-600 px-1 text-[10px] text-white"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {progress && <p className="text-sm text-accent">{progress}</p>}
          {err && <p className="text-sm text-red-500">{err}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-line px-4 py-2 text-sm hover:bg-bg-soft">
              İptal
            </button>
            <button
              type="submit"
              disabled={busy || (!chapter && files.length === 0)}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "Yükleniyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
