import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/pb";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ variable: "--font-sans", subsets: ["latin", "latin-ext"] });

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
      <body className={`${inter.variable} antialiased min-h-screen flex flex-col`}>
        <Header settings={settings} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
          {children}
        </main>
        <Footer settings={settings} />
      </body>
    </html>
  );
}
