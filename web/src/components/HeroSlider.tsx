"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { fileUrl } from "@/lib/pb";
import { STATUS_LABELS, type Manga } from "@/lib/types";

export default function HeroSlider({ mangas }: { mangas: Manga[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (mangas.length < 2) return;
    const t = setInterval(() => setI((p) => (p + 1) % mangas.length), 6000);
    return () => clearInterval(t);
  }, [mangas.length]);

  if (!mangas.length) return null;
  const m = mangas[i];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-line">
      <div className="absolute inset-0">
        {m.cover && (
          <Image
            src={fileUrl(m, m.cover, "600x0")}
            alt=""
            fill
            className="object-cover opacity-25 blur-lg scale-110"
            aria-hidden
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-bg/95 via-bg/70 to-transparent" />
      </div>

      <div className="relative flex gap-5 p-5 sm:p-8">
        <Link
          href={`/manga/${m.slug}`}
          className="relative hidden h-52 w-36 shrink-0 overflow-hidden rounded-lg border border-line sm:block"
        >
          {m.cover ? (
            <Image src={fileUrl(m, m.cover, "300x420")} alt={m.title} fill className="object-cover" />
          ) : (
            <div className="grid h-full place-items-center bg-card text-3xl">📖</div>
          )}
        </Link>
        <div className="flex min-w-0 flex-col justify-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">
            Öne Çıkan
          </span>
          <Link href={`/manga/${m.slug}`}>
            <h2 className="mt-1 line-clamp-2 text-2xl font-bold sm:text-3xl hover:text-accent transition-colors">
              {m.title}
            </h2>
          </Link>
          {m.status && (
            <span className="mt-2 text-xs text-muted">{STATUS_LABELS[m.status]}</span>
          )}
          <p className="mt-2 line-clamp-3 max-w-xl text-sm text-muted">{m.description}</p>
          <div className="mt-4">
            <Link
              href={`/manga/${m.slug}`}
              className="inline-block rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Okumaya Başla
            </Link>
          </div>
        </div>
      </div>

      {mangas.length > 1 && (
        <div className="absolute bottom-3 right-4 flex gap-1.5">
          {mangas.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Slayt ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                idx === i ? "w-5 bg-accent" : "w-1.5 bg-muted/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
