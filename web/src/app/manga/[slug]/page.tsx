import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { newPB, fileUrl } from "@/lib/pb";
import { STATUS_LABELS, TYPE_LABELS, type Chapter, type Manga } from "@/lib/types";

export const revalidate = 60;

async function getManga(slug: string): Promise<Manga | null> {
  try {
    const pb = newPB();
    return await pb.collection("mangas").getFirstListItem<Manga>(
      pb.filter("slug = {:slug}", { slug })
    );
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const manga = await getManga(slug);
  if (!manga) return { title: "Bulunamadı" };
  return {
    title: manga.title,
    description: manga.description?.slice(0, 160),
    openGraph: {
      title: manga.title,
      images: manga.cover ? [fileUrl(manga, manga.cover, "600x0")] : [],
    },
  };
}

export default async function MangaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const manga = await getManga(slug);
  if (!manga) notFound();

  let chapters: Chapter[] = [];
  try {
    const pb = newPB();
    chapters = await pb.collection("chapters").getFullList<Chapter>({
      filter: pb.filter("manga = {:id}", { id: manga.id }),
      sort: "-number",
      fields: "id,number,title,created,collectionId",
    });
  } catch {}

  const first = chapters[chapters.length - 1];
  const last = chapters[0];
  const genres = Array.isArray(manga.genres) ? manga.genres : [];

  return (
    <div className="space-y-10">
      <section className="flex flex-col gap-8 sm:flex-row">
        <div className="relative mx-auto w-52 shrink-0 sm:mx-0 sm:w-60">
          <div className="panel relative aspect-[3/4.2] overflow-hidden" style={{ transform: "rotate(-1.5deg)" }}>
            {manga.cover ? (
              <Image
                src={fileUrl(manga, manga.cover, "600x0")}
                alt={manga.title}
                fill
                sizes="240px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="halftone grid h-full place-items-center font-display text-5xl text-muted">?</div>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-3 font-mono text-[11px] uppercase tracking-[0.18em]">
            {manga.type && <span className="text-accent">{TYPE_LABELS[manga.type]}</span>}
            {manga.status && <span className="text-muted">{STATUS_LABELS[manga.status]}</span>}
          </div>
          <h1 className="mt-2 font-display text-4xl uppercase leading-[0.95] tracking-wide sm:text-5xl">
            {manga.title}
          </h1>
          <div className="mt-3 space-y-0.5 font-mono text-xs text-muted">
            {manga.author && <p>Yazar — {manga.author}</p>}
            {manga.artist && manga.artist !== manga.author && <p>Çizer — {manga.artist}</p>}
          </div>

          {genres.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {genres.map((g) => (
                <Link
                  key={g}
                  href={`/library?genre=${encodeURIComponent(g)}`}
                  className="border-2 border-ink bg-card px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wide text-muted transition-colors hover:border-accent hover:text-fg"
                >
                  {g}
                </Link>
              ))}
            </div>
          )}

          {manga.description && (
            <p className="mt-5 max-w-xl whitespace-pre-line text-sm leading-relaxed text-muted">
              {manga.description}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {first && (
              <Link href={`/read/${first.id}`} className="btn-ink">
                İlk bölümü oku
              </Link>
            )}
            {last && last.id !== first?.id && (
              <Link href={`/read/${last.id}`} className="btn-ghost">
                Son bölüm · {last.number}
              </Link>
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="section-title mb-4 text-2xl">
          Bölümler
          <span className="font-mono text-xs tracking-widest text-muted">({chapters.length})</span>
        </h2>
        {chapters.length === 0 ? (
          <div className="panel halftone p-10 text-center">
            <p className="font-display text-xl uppercase">Henüz bölüm yok</p>
            <p className="mt-1 text-sm text-muted">Yeni bölümler yayınlandığında burada listelenir.</p>
          </div>
        ) : (
          <div className="panel divide-y-2 divide-line">
            {chapters.map((ch) => (
              <Link
                key={ch.id}
                href={`/read/${ch.id}`}
                className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-card-hover"
              >
                <span className="font-display text-lg text-accent">{ch.number}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium group-hover:text-accent">
                  {ch.title || `Bölüm ${ch.number}`}
                </span>
                <span className="font-mono text-[11px] uppercase text-muted">
                  {new Date(ch.created).toLocaleDateString("tr-TR")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
