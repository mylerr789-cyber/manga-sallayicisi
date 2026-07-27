import type { Metadata } from "next";
import { Anton, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/pb";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const display = Anton({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-anton",
});
const body = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-plex",
});
const mono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-plexmono",
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: { default: s.site_name, template: `%s — ${s.site_name}` },
    description: s.site_description,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings();

  return (
    <html
      lang="tr"
      data-theme={settings.theme || "dark"}
      style={{ ["--accent" as string]: settings.accent_color || "#e11d48" }}
    >
      <body
        className={`${display.variable} ${body.variable} ${mono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Header settings={settings} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          {children}
        </main>
        <Footer settings={settings} />
      </body>
    </html>
  );
}
