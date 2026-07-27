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

  // Son bölümlerden seri bazında uniq son güncellenen 12 seri
  const seen = new Set<string>();
  const latest: { manga: Manga; chapterNumber: number }[] = [];
  for (const ch of latestChapters) {
    const m = ch.expand?.manga;
    if (!m || seen.has(m.id)) continue;
    seen.add(m.id);
    latest.push({ manga: m, chapterNumber: ch.number });
    if (latest.length >= 12) break;
  }

  return (
    <div className="space-y-10">
      {featured.length > 0 && <HeroSlider mangas={featured.slice(0, 5)} />}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Son Güncellenen Seriler</h2>
          <Link href="/library" className="text-sm text-accent hover:underline">
            Tümünü Gör →
          </Link>
        </div>
        {latest.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {latest.map(({ manga, chapterNumber }) => (
              <MangaCard key={manga.id} manga={manga} latestChapter={chapterNumber} />
            ))}
          </div>
        )}
      </section>

      {allMangas.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold">Tüm Seriler</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
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
    <div className="rounded-xl border border-dashed border-line p-10 text-center text-muted">
      <p className="text-3xl">📚</p>
      <p className="mt-2 font-medium">Henüz seri eklenmemiş</p>
      <p className="mt-1 text-sm">
        Yönetim panelinden ilk serini ekleyerek başla:{" "}
        <Link href="/admin" className="text-accent hover:underline">/admin</Link>
      </p>
    </div>
  );
}
