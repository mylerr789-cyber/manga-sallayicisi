"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { pbClient } from "@/lib/pb-client";

export default function AdminHome() {
  const [stats, setStats] = useState({ mangas: 0, chapters: 0, drafts: 0 });

  useEffect(() => {
    const pb = pbClient();
    Promise.all([
      pb.collection("mangas").getList(1, 1),
      pb.collection("chapters").getList(1, 1),
      pb.collection("chapters").getList(1, 1, { filter: "published = false" }),
    ])
      .then(([m, c, d]) =>
        setStats({ mangas: m.totalItems, chapters: c.totalItems, drafts: d.totalItems })
      )
      .catch(() => {});
  }, []);

  const cards = [
    { label: "Toplam Seri", value: stats.mangas, href: "/admin/series" },
    { label: "Toplam Bölüm", value: stats.chapters, href: "/admin/chapters" },
    { label: "Taslak Bölüm", value: stats.drafts, href: "/admin/chapters" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Özet</h1>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-xl border border-line bg-card p-5 hover:border-accent transition-colors"
          >
            <p className="text-3xl font-bold text-accent">{c.value}</p>
            <p className="mt-1 text-sm text-muted">{c.label}</p>
          </Link>
        ))}
      </div>
      <div className="mt-8 rounded-xl border border-line bg-card p-5 text-sm text-muted">
        <p className="font-semibold text-fg">Hızlı Başlangıç</p>
        <ol className="mt-2 list-inside list-decimal space-y-1">
          <li><Link href="/admin/series" className="text-accent hover:underline">Seriler</Link> sekmesinden yeni seri ekle</li>
          <li><Link href="/admin/chapters" className="text-accent hover:underline">Bölümler</Link> sekmesinden sayfaları yükle</li>
          <li><Link href="/admin/settings" className="text-accent hover:underline">Ayarlar</Link>dan site adını ve rengini özelleştir</li>
        </ol>
      </div>
    </div>
  );
}
