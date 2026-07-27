import type { SiteSettings } from "@/lib/types";

const SOCIAL_LABELS: Record<string, string> = {
  discord: "Discord",
  twitter: "Twitter / X",
  instagram: "Instagram",
  youtube: "YouTube",
  telegram: "Telegram",
};

export default function Footer({ settings }: { settings: SiteSettings }) {
  const socials = Object.entries(settings.social_links || {}).filter(
    ([, url]) => url
  );

  return (
    <footer className="halftone mt-20 border-t-2 border-ink bg-bg-soft">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-10 text-center">
        <span className="font-display text-lg uppercase tracking-wide">
          {settings.site_name}
        </span>
        {socials.length > 0 && (
          <div className="flex flex-wrap justify-center gap-5 font-mono text-xs uppercase tracking-[0.15em] text-muted">
            {socials.map(([key, url]) => (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-accent"
              >
                {SOCIAL_LABELS[key] || key}
              </a>
            ))}
          </div>
        )}
        <p className="text-sm text-muted">{settings.footer_text}</p>
      </div>
    </footer>
  );
}
