import Link from "next/link";
import Image from "next/image";
import { fileUrl } from "@/lib/pb";
import { TYPE_LABELS, type Manga } from "@/lib/types";

export default function MangaCard({
  manga,
  latestChapter,
}: {
  manga: Manga;
  latestChapter?: number;
}) {
  return (
    <Link
      href={`/manga/${manga.slug}`}
      className="panel panel-hover group block"
    >
      <div className="relative aspect-[3/4.2] w-full overflow-hidden border-b-2 border-ink bg-bg-soft">
        {manga.cover ? (
          <Image
            src={fileUrl(manga, manga.cover, "300x420")}
            alt={manga.title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 200px"
            className="object-cover"
          />
        ) : (
          <div className="halftone grid h-full place-items-center font-display text-2xl text-muted">
            ?
          </div>
        )}
        {manga.type && (
          <span className="absolute left-0 top-2 border-y-2 border-r-2 border-ink bg-accent px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-white">
            {TYPE_LABELS[manga.type]}
          </span>
        )}
      </div>
      <div className="px-2.5 py-2">
        <h3 className="truncate text-sm font-semibold transition-colors group-hover:text-accent">
          {manga.title}
        </h3>
        {latestChapter !== undefined && (
          <p className="mt-0.5 font-mono text-[11px] text-muted">
            BLM {latestChapter}
          </p>
        )}
      </div>
    </Link>
  );
}
