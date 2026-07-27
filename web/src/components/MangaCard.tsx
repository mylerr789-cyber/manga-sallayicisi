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
      className="group overflow-hidden rounded-xl border border-line bg-card transition-colors hover:border-accent"
    >
      <div className="relative aspect-[3/4.2] w-full overflow-hidden bg-bg-soft">
        {manga.cover ? (
          <Image
            src={fileUrl(manga, manga.cover, "300x420")}
            alt={manga.title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 200px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-4xl text-muted">📖</div>
        )}
        {manga.type && (
          <span className="absolute left-2 top-2 rounded bg-accent px-1.5 py-0.5 text-[11px] font-semibold text-white">
            {TYPE_LABELS[manga.type]}
          </span>
        )}
      </div>
      <div className="p-2.5">
        <h3 className="truncate text-sm font-semibold group-hover:text-accent transition-colors">
          {manga.title}
        </h3>
        {latestChapter !== undefined && (
          <p className="mt-0.5 text-xs text-muted">Bölüm {latestChapter}</p>
        )}
      </div>
    </Link>
  );
}
