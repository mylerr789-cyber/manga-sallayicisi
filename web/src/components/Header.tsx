import Link from "next/link";
import Image from "next/image";
import { fileUrl } from "@/lib/pb";
import type { SiteSettings } from "@/lib/types";
import SearchBox from "./SearchBox";

export default function Header({ settings }: { settings: SiteSettings }) {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-bg/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-5 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          {settings.logo ? (
            <Image
              src={fileUrl(settings, settings.logo)}
              alt=""
              width={32}
              height={32}
            />
          ) : (
            <span
              className="grid h-8 w-8 place-items-center bg-accent font-display text-lg text-white"
              style={{ transform: "skewX(-8deg)" }}
            >
              {settings.site_name.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="font-display text-xl uppercase tracking-wide">
            {settings.site_name}
          </span>
        </Link>

        <nav className="hidden items-center gap-5 font-mono text-xs uppercase tracking-[0.18em] text-muted sm:flex">
          <Link href="/" className="transition-colors hover:text-accent">
            Ana Sayfa
          </Link>
          <Link href="/library" className="transition-colors hover:text-accent">
            Kütüphane
          </Link>
        </nav>

        <div className="ml-auto">
          <SearchBox />
        </div>
      </div>
    </header>
  );
}
