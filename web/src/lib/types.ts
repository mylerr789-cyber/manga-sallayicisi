export interface Manga {
  id: string;
  collectionId: string;
  collectionName: string;
  title: string;
  slug: string;
  cover: string;
  description: string;
  author: string;
  artist: string;
  status: "ongoing" | "completed" | "hiatus" | "cancelled" | "";
  type: "manga" | "webtoon" | "manhwa" | "manhua" | "";
  genres: string[] | null;
  featured: boolean;
  created: string;
  updated: string;
}

export interface Chapter {
  id: string;
  collectionId: string;
  collectionName: string;
  manga: string;
  number: number;
  title: string;
  pages: string[];
  published: boolean;
  created: string;
  updated: string;
  expand?: { manga?: Manga };
}

export interface SiteSettings {
  id: string;
  collectionId: string;
  collectionName: string;
  site_name: string;
  site_description: string;
  logo: string;
  accent_color: string;
  theme: "dark" | "light";
  hero_enabled: boolean;
  items_per_page: number;
  footer_text: string;
  social_links: Record<string, string> | null;
  updated: string;
}

export const STATUS_LABELS: Record<string, string> = {
  ongoing: "Devam Ediyor",
  completed: "Tamamlandı",
  hiatus: "Ara Verildi",
  cancelled: "İptal Edildi",
};

export const TYPE_LABELS: Record<string, string> = {
  manga: "Manga",
  webtoon: "Webtoon",
  manhwa: "Manhwa",
  manhua: "Manhua",
};

export const GENRES = [
  "Aksiyon", "Macera", "Komedi", "Dram", "Fantastik", "Korku",
  "Gizem", "Romantizm", "Bilim Kurgu", "Spor", "Doğaüstü", "Psikolojik",
  "Tarihi", "Dövüş Sanatları", "İsekai", "Okul", "Askeri", "Yaşamdan Kesitler",
];
