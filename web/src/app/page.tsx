import Link from "next/link";
import { newPB, getSettings } from "@/lib/pb";
import type { Chapter, Manga } from "@/lib/types";
import MangaCard from "@/components/MangaCard";
import HeroSlider from "@/components/HeroSlider";

export const revalidate = 60;

export default async function HomePage() {
  const pb = newPB();
  const settings = await getSettings();

  let featured: Manga[] = [];
  let latestChapters: Chapter[] = [];
  let allMangas: Manga[] = [];

  try {
    [featured, latestChapters, allMangas] = await Promise.all([
      settings.hero_enabled
        ? pb.collection("mangas").getFullList<Manga>({ filter: "featured = true", sort: "-created" })
        : Promise.resolve([]),
      pb.collection("chapters").getList<Chapter>(1, 40, { sort: "-created", expand: "manga" })
        .then((r) => r.items),
      pb.collection("mangas").getList<Manga>(1, 18, { sort: "-created" }).then((r) => r.items),
    ]);
  } catch {
    // PB kapalıysa boş durumla render et
  }

  const seen = new Set<string>();
  const latest: { manga: Manga; chapterNumber: number }[] = [];
  const latestByManga: Record<string, number> = {};
  for (const ch of latestChapters) {
    const m = ch.expand?.manga;
    if (!m) continue;
    if (!(m.id in latestByManga)) latestByManga[m.id] = ch.number;
    if (seen.has(m.id)) continue;
    seen.add(m.id);
    if (latest.length < 12) latest.push({ manga: m, chapterNumber: ch.number });
  }

  return (
    <div className="space-y-12">
      {featured.length > 0 && (
        <HeroSlider mangas={featured.slice(0, 5)} latestByManga={latestByManga} />
      )}

      <section>
        <div className="mb-5 flex items-end justify-between">
          <h2 className="section-title text-2xl">Son Güncellenen</h2>
          <Link
            href="/library"
            className="font-mono text-xs uppercase tracking-[0.15em] text-accent hover:underline"
          >
            Tümü →
          </Link>
        </div>
        {latest.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {latest.map(({ manga, chapterNumber }) => (
              <MangaCard key={manga.id} manga={manga} latestChapter={chapterNumber} />
            ))}
          </div>
        )}
      </section>

      {allMangas.length > 0 && (
        <section>
          <h2 className="section-title mb-5 text-2xl">Tüm Seriler</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {allMangas.map((m) => (
              <MangaCard key={m.id} manga={m} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="panel halftone p-12 text-center">
      <p className="font-display text-3xl uppercase">Raflar henüz boş</p>
      <p className="mt-2 text-sm text-muted">
        İlk seriyi eklemek için{" "}
        <Link href="/admin" className="text-accent hover:underline">
          yönetim paneline
        </Link>{" "}
        git.
      </p>
    </div>
  );
}
