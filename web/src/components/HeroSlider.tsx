"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { fileUrl } from "@/lib/pb";
import { STATUS_LABELS, TYPE_LABELS, type Manga } from "@/lib/types";

export default function HeroSlider({ mangas }: { mangas: Manga[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (mangas.length < 2) return;
    const t = setInterval(() => setI((p) => (p + 1) % mangas.length), 7000);
    return () => clearInterval(t);
  }, [mangas.length]);

  if (!mangas.length) return null;
  const m = mangas[i];

  return (
    <section className="panel halftone relative overflow-hidden">
      <div className="relative flex flex-col gap-6 p-5 sm:flex-row sm:p-8">
        {/* kapak: hafif dönük baskı provası */}
        <Link
          href={`/manga/${m.slug}`}
          className="relative mx-auto block h-64 w-44 shrink-0 sm:mx-0"
        >
          <div
            className="panel panel-hover absolute inset-0 overflow-hidden"
            style={{ transform: "rotate(-2deg)" }}
          >
            {m.cover ? (
              <Image
                src={fileUrl(m, m.cover, "600x0")}
                alt={m.title}
                fill
                sizes="176px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="grid h-full place-items-center font-display text-3xl text-muted">?</div>
            )}
          </div>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <p className="eyebrow">Öne çıkan seri</p>
          <Link href={`/manga/${m.slug}`}>
            <h2 className="mt-2 line-clamp-2 font-display text-4xl uppercase leading-[0.95] tracking-wide transition-colors hover:text-accent sm:text-5xl">
              {m.title}
            </h2>
          </Link>
          <div className="mt-3 flex flex-wrap gap-3 font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
            {m.type && <span>{TYPE_LABELS[m.type]}</span>}
            {m.status && (
              <span className="text-accent">{STATUS_LABELS[m.status]}</span>
            )}
          </div>
          {m.description && (
            <p className="mt-3 line-clamp-3 max-w-xl text-sm leading-relaxed text-muted">
              {m.description}
            </p>
          )}
          <div className="mt-5">
            <Link href={`/manga/${m.slug}`} className="btn-ink">
              Okumaya başla →
            </Link>
          </div>
        </div>
      </div>

      {mangas.length > 1 && (
        <div className="absolute bottom-3 right-4 flex gap-2">
          {mangas.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Slayt ${idx + 1}`}
              className={`h-2.5 border-2 border-ink transition-colors ${
                idx === i ? "w-6 bg-accent" : "w-2.5 bg-card"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
