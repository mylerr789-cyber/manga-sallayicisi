"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GENRES, STATUS_LABELS, TYPE_LABELS } from "@/lib/types";

export default function FilterBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const first = useRef(true);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    router.push(`/library?${next.toString()}`);
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

  const select =
    "border-2 border-ink bg-card px-2.5 py-1.5 font-mono text-xs uppercase tracking-wide outline-none focus:border-accent";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Ara"
        className={`${select} w-full sm:w-48 placeholder:text-muted`}
      />
      <select value={params.get("genre") || ""} onChange={(e) => setParam("genre", e.target.value)} className={select}>
        <option value="">Tür: hepsi</option>
        {GENRES.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>
      <select value={params.get("status") || ""} onChange={(e) => setParam("status", e.target.value)} className={select}>
        <option value="">Durum: hepsi</option>
        {Object.entries(STATUS_LABELS).map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
      <select value={params.get("type") || ""} onChange={(e) => setParam("type", e.target.value)} className={select}>
        <option value="">Kategori: hepsi</option>
        {Object.entries(TYPE_LABELS).map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
      <select value={params.get("sort") || "new"} onChange={(e) => setParam("sort", e.target.value)} className={select}>
        <option value="new">En yeni</option>
        <option value="az">A-Z</option>
        <option value="za">Z-A</option>
      </select>
    </div>
  );
}
