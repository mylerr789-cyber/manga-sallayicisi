"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { fileUrl } from "@/lib/pb";
import { STATUS_LABELS, TYPE_LABELS, type Manga } from "@/lib/types";

export default function HeroSlider({
  mangas,
  latestByManga = {},
}: {
  mangas: Manga[];
  latestByManga?: Record<string, number>;
}) {
  const [i, setI] = useState(0);
  const [fade, setFade] = useState(false);

  const go = useCallback(
    (idx: number) => {
      if (idx === i) return;
      setFade(true);
      setTimeout(() => {
        setI(idx);
        setFade(false);
      }, 180);
    },
    [i]
  );

  useEffect(() => {
    if (mangas.length < 2) return;
    const t = setInterval(() => go((i + 1) % mangas.length), 7000);
    return () => clearInterval(t);
  }, [mangas.length, i, go]);

  if (!mangas.length) return null;
  const m = mangas[i];
  const genres = (Array.isArray(m.genres) ? m.genres : []).slice(0, 3);
  const latest = latestByManga[m.id];

  return (
    <section className="panel speedlines relative overflow-hidden">
      {/* arka katman: dev kontur başlık */}
      <div
        aria-hidden
        className="text-outline pointer-events-none absolute -bottom-4 left-0 right-0 select-none overflow-hidden whitespace-nowrap font-display text-[7rem] uppercase leading-none sm:text-[10rem]"
      >
        {m.title} {m.title}
      </div>

      {/* eğik accent bandı */}
      <div
        aria-hidden
        className="absolute -right-16 top-6 hidden rotate-45 border-y-2 border-ink bg-accent px-16 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-white sm:block"
      >
        {m.status ? STATUS_LABELS[m.status] : "Seri"}
      </div>

      <div
        className={`relative flex flex-col gap-7 p-6 transition-opacity duration-200 sm:flex-row sm:p-9 ${
          fade ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* kapak: iki katmanlı baskı provası */}
        <Link
          href={`/manga/${m.slug}`}
          className="group relative mx-auto block h-72 w-52 shrink-0 sm:mx-0"
        >
          <div
            aria-hidden
            className="absolute inset-0 border-2 border-ink bg-accent"
            style={{ transform: "rotate(4deg) translate(6px, 4px)" }}
          />
          <div
            className="panel absolute inset-0 overflow-hidden transition-transform duration-200 group-hover:-translate-y-1"
            style={{ transform: "rotate(-2deg)" }}
          >
            {m.cover ? (
              <Image
                src={fileUrl(m, m.cover, "600x0")}
                alt={m.title}
                fill
                sizes="208px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="halftone grid h-full place-items-center font-display text-4xl text-muted">?</div>
            )}
          </div>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <div className="flex items-center gap-3">
            <p className="eyebrow">Öne çıkan</p>
            {m.type && (
              <span className="border-2 border-ink bg-card px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest">
                {TYPE_LABELS[m.type]}
              </span>
            )}
          </div>

          <Link href={`/manga/${m.slug}`}>
            <h2 className="mt-2 line-clamp-2 font-display text-5xl uppercase leading-[0.9] tracking-wide transition-colors hover:text-accent sm:text-6xl">
              {m.title}
            </h2>
          </Link>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
            {m.author && <span>{m.author}</span>}
            {latest !== undefined && (
              <span className="text-accent">Son bölüm · {latest}</span>
            )}
            {genres.map((g) => (
              <span key={g}>{g}</span>
            ))}
          </div>

          {m.description && (
            <p className="mt-3 line-clamp-2 max-w-xl text-sm leading-relaxed text-muted">
              {m.description}
            </p>
          )}

          <div className="mt-5 flex items-center gap-4">
            <Link href={`/manga/${m.slug}`} className="btn-ink">
              Okumaya başla →
            </Link>
            {mangas.length > 1 && (
              <span className="font-mono text-xs tracking-[0.2em] text-muted">
                {String(i + 1).padStart(2, "0")} / {String(mangas.length).padStart(2, "0")}
              </span>
            )}
          </div>
        </div>
      </div>

      {mangas.length > 1 && (
        <div className="absolute bottom-4 right-5 flex gap-2">
          {mangas.map((_, idx) => (
            <button
              key={idx}
              onClick={() => go(idx)}
              aria-label={`Slayt ${idx + 1}`}
              className={`h-2.5 border-2 border-ink transition-all ${
                idx === i ? "w-7 bg-accent" : "w-2.5 bg-card hover:bg-card-hover"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
