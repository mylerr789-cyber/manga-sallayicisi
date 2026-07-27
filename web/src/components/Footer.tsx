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
    <footer className="mt-16 border-t border-line bg-bg-soft">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center text-sm text-muted">
        {socials.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4">
            {socials.map(([key, url]) => (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
              >
                {SOCIAL_LABELS[key] || key}
              </a>
            ))}
          </div>
        )}
        <p>{settings.footer_text || settings.site_name}</p>
        <a href="/admin" className="text-xs opacity-60 hover:opacity-100">
          Yönetim
        </a>
      </div>
    </footer>
  );
}
