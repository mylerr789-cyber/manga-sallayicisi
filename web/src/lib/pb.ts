import PocketBase from "pocketbase";
import type { SiteSettings } from "./types";

export const PB_URL =
  process.env.NEXT_PUBLIC_PB_URL || "http://127.0.0.1:8090";

/** Server component'ler için her çağrıda yeni instance (auth state paylaşımı olmasın). */
export function newPB(): PocketBase {
  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);
  return pb;
}

/** PB dosya URL'i. thumb ör: "300x420" */
export function fileUrl(
  record: { id: string; collectionId: string },
  filename: string,
  thumb?: string
): string {
  if (!filename) return "";
  const base = `${PB_URL}/api/files/${record.collectionId}/${record.id}/${filename}`;
  return thumb ? `${base}?thumb=${thumb}` : base;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  id: "",
  collectionId: "",
  collectionName: "settings",
  site_name: "Manga Sallayıcısı",
  site_description: "",
  logo: "",
  accent_color: "#e11d48",
  theme: "dark",
  hero_enabled: true,
  items_per_page: 24,
  footer_text: "",
  social_links: null,
  updated: "",
};

/** Site ayarları — 60 sn cache'li fetch (server-side). */
export async function getSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch(
      `${PB_URL}/api/collections/settings/records?perPage=1`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return DEFAULT_SETTINGS;
    const data = await res.json();
    if (!data.items?.length) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...data.items[0] };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
