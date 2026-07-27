import Link from "next/link";
import Image from "next/image";
import { fileUrl } from "@/lib/pb";
import type { SiteSettings } from "@/lib/types";
import SearchBox from "./SearchBox";

export default function Header({ settings }: { settings: SiteSettings }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg-soft/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
          {settings.logo ? (
            <Image
              src={fileUrl(settings, settings.logo)}
              alt={settings.site_name}
              width={28}
              height={28}
              className="rounded"
            />
          ) : (
            <span className="grid h-7 w-7 place-items-center rounded bg-accent text-sm text-white">
              {settings.site_name.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="hidden sm:inline">{settings.site_name}</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted">
          <Link href="/" className="hover:text-fg transition-colors">Ana Sayfa</Link>
          <Link href="/library" className="hover:text-fg transition-colors">Kütüphane</Link>
        </nav>
        <div className="ml-auto">
          <SearchBox />
        </div>
      </div>
    </header>
  );
}
