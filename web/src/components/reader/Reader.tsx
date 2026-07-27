"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fileUrl } from "@/lib/pb";
import type { Chapter, Manga } from "@/lib/types";

type Mode = "webtoon" | "paged";

export default function Reader({
  chapter,
  manga,
  siblings,
}: {
  chapter: Chapter;
  manga: Manga;
  siblings: Chapter[];
}) {
  const router = useRouter();
  const defaultMode: Mode = manga.type === "manga" ? "paged" : "webtoon";
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [page, setPage] = useState(0);
  const [barVisible, setBarVisible] = useState(true);

  // localStorage'dan mod tercihi
  useEffect(() => {
    const saved = localStorage.getItem(`reader-mode-${manga.id}`) as Mode | null;
    if (saved === "webtoon" || saved === "paged") setMode(saved);
  }, [manga.id]);

  function changeMode(m: Mode) {
    setMode(m);
    localStorage.setItem(`reader-mode-${manga.id}`, m);
  }

  const idx = siblings.findIndex((s) => s.id === chapter.id);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;

  const pageUrls = useMemo(
    () => chapter.pages.map((p) => fileUrl(chapter, p)),
    [chapter]
  );

  const goNext = useCallback(() => {
    if (mode === "paged" && page < pageUrls.length - 1) setPage((p) => p + 1);
    else if (next) router.push(`/read/${next.id}`);
  }, [mode, page, pageUrls.length, next, router]);

  const goPrev = useCallback(() => {
    if (mode === "paged" && page > 0) setPage((p) => p - 1);
    else if (prev) router.push(`/read/${prev.id}`);
  }, [mode, page, prev, router]);

  // klavye
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "d") goNext();
      if (e.key === "ArrowLeft" || e.key === "a") goPrev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  // scroll'da barı gizle (webtoon)
  useEffect(() => {
    let lastY = window.scrollY;
    function onScroll() {
      const y = window.scrollY;
      setBarVisible(y < 80 || y < lastY);
      lastY = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // bölüm değişince başa dön
  useEffect(() => {
    setPage(0);
    window.scrollTo(0, 0);
  }, [chapter.id]);

  return (
    <div className="-mx-4 -my-6">
      {/* üst bar */}
      <div
        className={`sticky top-16 z-30 border-b-2 border-ink bg-bg/95 backdrop-blur transition-transform ${
          barVisible ? "" : "-translate-y-full"
        }`}
      >
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-2 px-4 py-2 text-sm">
          <Link
            href={`/manga/${manga.slug}`}
            className="max-w-40 truncate font-display uppercase tracking-wide hover:text-accent sm:max-w-none"
          >
            {manga.title}
          </Link>
          <span className="text-muted">/</span>
          <select
            value={chapter.id}
            onChange={(e) => router.push(`/read/${e.target.value}`)}
            className="border-2 border-ink bg-card px-2 py-1 font-mono text-xs outline-none focus:border-accent"
          >
            {[...siblings].reverse().map((s) => (
              <option key={s.id} value={s.id}>
                Bölüm {s.number}
                {s.title ? ` — ${s.title}` : ""}
              </option>
            ))}
          </select>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={() => changeMode(mode === "webtoon" ? "paged" : "webtoon")}
              className="border-2 border-ink bg-accent px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-white"
              title="Okuma modu"
            >
              {mode === "webtoon" ? "▤ Dikey" : "▭ Sayfalı"}
            </button>
            <button
              onClick={goPrev}
              disabled={!prev && !(mode === "paged" && page > 0)}
              className="border-2 border-ink bg-card px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide transition-colors hover:border-accent disabled:opacity-40"
            >
              ← Önceki
            </button>
            <button
              onClick={goNext}
              disabled={!next && !(mode === "paged" && page < pageUrls.length - 1)}
              className="border-2 border-ink bg-card px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide transition-colors hover:border-accent disabled:opacity-40"
            >
              Sonraki →
            </button>
          </div>
        </div>
      </div>

      {pageUrls.length === 0 ? (
        <p className="p-16 text-center text-muted">Bu bölümde sayfa yok.</p>
      ) : mode === "webtoon" ? (
        /* ---- dikey akış ---- */
        <div className="mx-auto max-w-3xl">
          {pageUrls.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt={`Sayfa ${i + 1}`}
              loading={i < 3 ? "eager" : "lazy"}
              className="w-full"
            />
          ))}
          <ChapterEnd next={next} manga={manga} />
        </div>
      ) : (
        /* ---- sayfalı ---- */
        <div className="mx-auto max-w-4xl select-none">
          <div className="relative flex min-h-[70vh] items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pageUrls[page]}
              alt={`Sayfa ${page + 1}`}
              className="max-h-[calc(100vh-8rem)] w-auto max-w-full"
            />
            <button
              onClick={goPrev}
              className="absolute inset-y-0 left-0 w-1/3 cursor-w-resize"
              aria-label="Önceki sayfa"
            />
            <button
              onClick={goNext}
              className="absolute inset-y-0 right-0 w-1/3 cursor-e-resize"
              aria-label="Sonraki sayfa"
            />
          </div>
          {/* ön yükleme */}
          {pageUrls[page + 1] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pageUrls[page + 1]} alt="" className="hidden" />
          )}
          <p className="py-3 text-center font-mono text-xs uppercase tracking-widest text-muted">
            {page + 1} / {pageUrls.length}
          </p>
          {page === pageUrls.length - 1 && <ChapterEnd next={next} manga={manga} />}
        </div>
      )}
    </div>
  );
}

function ChapterEnd({ next, manga }: { next: Chapter | null; manga: Manga }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10">
      {next ? (
        <Link
          href={`/read/${next.id}`}
          className="btn-ink"
        >
          Sonraki Bölüm (Bölüm {next.number}) →
        </Link>
      ) : (
        <p className="text-sm text-muted">Serinin sonuna geldin — yeni bölümler için takipte kal.</p>
      )}
      <Link href={`/manga/${manga.slug}`} className="font-mono text-xs uppercase tracking-[0.15em] text-accent hover:underline">
        Bölüm listesine dön
      </Link>
    </div>
  );
}
