"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GENRES, STATUS_LABELS, TYPE_LABELS } from "@/lib/types";

const SORT_LABELS: Record<string, string> = { new: "En yeni", az: "A–Z", za: "Z–A" };

export default function FilterBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [genresOpen, setGenresOpen] = useState(!!params.get("genre"));
  const first = useRef(true);

  const activeGenres = (params.get("genre") || "").split(",").filter(Boolean);
  const activeStatus = params.get("status") || "";
  const activeType = params.get("type") || "";
  const activeSort = params.get("sort") || "new";
  const activeCount =
    activeGenres.length + (activeStatus ? 1 : 0) + (activeType ? 1 : 0) + (params.get("q") ? 1 : 0);

  function push(next: URLSearchParams) {
    next.delete("page");
    const qs = next.toString();
    router.push(`/library${qs ? `?${qs}` : ""}`);
  }

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    push(next);
  }

  function toggleGenre(g: string) {
    const set = new Set(activeGenres);
    if (set.has(g)) set.delete(g);
    else set.add(g);
    setParam("genre", [...set].join(","));
  }

  function clearAll() {
    setQ("");
    router.push("/library");
  }

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => setParam("q", q.trim()), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const chip = (active: boolean) =>
    `border-2 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide transition-colors ${
      active
        ? "border-ink bg-accent text-white"
        : "border-line bg-card text-muted hover:border-ink hover:text-fg"
    }`;

  return (
    <div className="panel space-y-0 divide-y-2 divide-line">
      {/* arama + sıralama + temizle */}
      <div className="flex flex-wrap items-center gap-2 p-3">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Seri adı ara"
          className="w-full border-2 border-line bg-bg-soft px-3 py-1.5 font-mono text-xs uppercase tracking-wide outline-none transition-colors placeholder:text-muted focus:border-accent sm:w-56"
        />
        <div className="flex gap-1.5" role="group" aria-label="Sıralama">
          {Object.entries(SORT_LABELS).map(([v, l]) => (
            <button key={v} onClick={() => setParam("sort", v === "new" ? "" : v)} className={chip(activeSort === v)}>
              {l}
            </button>
          ))}
        </div>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="ml-auto border-2 border-ink bg-ink px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-bg transition-opacity hover:opacity-80"
          >
            ✕ Temizle ({activeCount})
          </button>
        )}
      </div>

      {/* kategori + durum */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="eyebrow mr-1">Kategori</span>
          {Object.entries(TYPE_LABELS).map(([v, l]) => (
            <button key={v} onClick={() => setParam("type", activeType === v ? "" : v)} className={chip(activeType === v)}>
              {l}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="eyebrow mr-1">Durum</span>
          {Object.entries(STATUS_LABELS).map(([v, l]) => (
            <button key={v} onClick={() => setParam("status", activeStatus === v ? "" : v)} className={chip(activeStatus === v)}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* türler (açılır) */}
      <div className="p-3">
        <button
          onClick={() => setGenresOpen(!genresOpen)}
          className="flex w-full items-center gap-2 text-left"
          aria-expanded={genresOpen}
        >
          <span className="eyebrow">Türler</span>
          {activeGenres.length > 0 && (
            <span className="font-mono text-[11px] text-fg">— {activeGenres.join(", ")}</span>
          )}
          <span className="ml-auto font-mono text-xs text-muted">{genresOpen ? "▲" : "▼"}</span>
        </button>
        {genresOpen && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {GENRES.map((g) => (
              <button key={g} onClick={() => toggleGenre(g)} className={chip(activeGenres.includes(g))}>
                {g}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
