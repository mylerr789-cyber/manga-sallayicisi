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
    <div className="space-y-8">
      <section className="flex flex-col gap-6 sm:flex-row">
        <div className="relative mx-auto aspect-[3/4.2] w-48 shrink-0 overflow-hidden rounded-xl border border-line sm:mx-0 sm:w-56">
          {manga.cover ? (
            <Image
              src={fileUrl(manga, manga.cover, "600x0")}
              alt={manga.title}
              fill
              sizes="224px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="grid h-full place-items-center bg-card text-5xl">📖</div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {manga.type && (
              <span className="rounded bg-accent px-2 py-0.5 text-xs font-semibold text-white">
                {TYPE_LABELS[manga.type]}
              </span>
            )}
            {manga.status && (
              <span className="rounded border border-line bg-card px-2 py-0.5 text-xs text-muted">
                {STATUS_LABELS[manga.status]}
              </span>
            )}
          </div>
          <h1 className="mt-2 text-3xl font-bold">{manga.title}</h1>
          <div className="mt-2 space-y-0.5 text-sm text-muted">
            {manga.author && <p>Yazar: {manga.author}</p>}
            {manga.artist && manga.artist !== manga.author && <p>Çizer: {manga.artist}</p>}
          </div>

          {genres.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {genres.map((g) => (
                <Link
                  key={g}
                  href={`/library?genre=${encodeURIComponent(g)}`}
                  className="rounded-full border border-line bg-card px-2.5 py-0.5 text-xs text-muted hover:border-accent hover:text-fg transition-colors"
                >
                  {g}
                </Link>
              ))}
            </div>
          )}

          {manga.description && (
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted">
              {manga.description}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {first && (
              <Link
                href={`/read/${first.id}`}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                İlk Bölüm
              </Link>
            )}
            {last && last.id !== first?.id && (
              <Link
                href={`/read/${last.id}`}
                className="rounded-lg border border-line bg-card px-4 py-2 text-sm font-semibold hover:border-accent"
              >
                Son Bölüm ({last.number})
              </Link>
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">Bölümler ({chapters.length})</h2>
        {chapters.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-muted">
            Henüz bölüm yayınlanmamış.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-line">
            {chapters.map((ch, idx) => (
              <Link
                key={ch.id}
                href={`/read/${ch.id}`}
                className={`flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-card-hover ${
                  idx % 2 === 0 ? "bg-card" : "bg-bg-soft"
                }`}
              >
                <span className="font-medium">
                  Bölüm {ch.number}
                  {ch.title && <span className="ml-2 font-normal text-muted">{ch.title}</span>}
                </span>
                <span className="text-xs text-muted">
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
