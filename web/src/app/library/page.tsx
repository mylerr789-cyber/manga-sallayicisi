import Link from "next/link";
import { Suspense } from "react";
import { newPB, getSettings } from "@/lib/pb";
import type { Manga } from "@/lib/types";
import MangaCard from "@/components/MangaCard";
import FilterBar from "@/components/FilterBar";

export const metadata = { title: "Kütüphane" };
export const revalidate = 60;

type SP = { q?: string; genre?: string; status?: string; type?: string; sort?: string; page?: string };

const SORTS: Record<string, string> = { new: "-created", az: "title", za: "-title" };

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const settings = await getSettings();
  const pb = newPB();
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);

  const filters: string[] = [];
  const fparams: Record<string, string> = {};
  if (sp.q) {
    filters.push(`title ~ {:q}`);
    fparams.q = sp.q;
  }
  if (sp.genre) {
    filters.push(`genres ~ {:genre}`);
    fparams.genre = sp.genre;
  }
  if (sp.status) {
    filters.push(`status = {:status}`);
    fparams.status = sp.status;
  }
  if (sp.type) {
    filters.push(`type = {:type}`);
    fparams.type = sp.type;
  }

  let items: Manga[] = [];
  let totalPages = 1;
  let totalItems = 0;

  try {
    const res = await pb.collection("mangas").getList<Manga>(page, settings.items_per_page || 24, {
      filter: filters.length ? pb.filter(filters.join(" && "), fparams) : "",
      sort: SORTS[sp.sort || "new"] || "-created",
    });
    items = res.items;
    totalPages = res.totalPages;
    totalItems = res.totalItems;
  } catch (e) {
    console.error("library query error:", e);
  }

  function pageLink(p: number) {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (v && k !== "page") next.set(k, v);
    if (p > 1) next.set("page", String(p));
    const qs = next.toString();
    return `/library${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold">Kütüphane</h1>
        <span className="text-sm text-muted">{totalItems} seri</span>
      </div>

      <Suspense>
        <FilterBar />
      </Suspense>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line p-10 text-center text-muted">
          Sonuç bulunamadı.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((m) => (
            <MangaCard key={m.id} manga={m} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {page > 1 && (
            <Link href={pageLink(page - 1)} className="rounded-lg border border-line bg-card px-3 py-1.5 text-sm hover:border-accent">
              ← Önceki
            </Link>
          )}
          <span className="px-2 text-sm text-muted">
            Sayfa {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link href={pageLink(page + 1)} className="rounded-lg border border-line bg-card px-3 py-1.5 text-sm hover:border-accent">
              Sonraki →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
