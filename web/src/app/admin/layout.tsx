"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { pbClient, isAdmin } from "@/lib/pb-client";

const NAV = [
  { href: "/admin", label: "Özet", icon: "▦" },
  { href: "/admin/series", label: "Seriler", icon: "📚" },
  { href: "/admin/chapters", label: "Bölümler", icon: "📄" },
  { href: "/admin/settings", label: "Ayarlar", icon: "⚙" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(isAdmin());
    setReady(true);
  }, []);

  if (!ready) return <div className="p-10 text-center text-muted">Yükleniyor...</div>;

  if (!authed) return <LoginForm onSuccess={() => setAuthed(true)} />;

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <aside className="shrink-0 md:w-52">
        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors ${
                pathname === item.href
                  ? "bg-accent font-semibold text-white"
                  : "text-muted hover:bg-card hover:text-fg"
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => {
              pbClient().authStore.clear();
              setAuthed(false);
            }}
            className="whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm text-muted hover:bg-card hover:text-fg"
          >
            <span className="mr-2">⏻</span>Çıkış
          </button>
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await pbClient().collection("_superusers").authWithPassword(email, pass);
      onSuccess();
    } catch {
      setErr("Giriş başarısız — e-posta veya şifre hatalı.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-sm">
      <div className="rounded-2xl border border-line bg-card p-6">
        <h1 className="text-xl font-bold">Yönetici Girişi</h1>
        <p className="mt-1 text-sm text-muted">
          Kurulumda oluşturduğun admin hesabıyla gir.
        </p>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-posta"
            className="w-full rounded-lg border border-line bg-bg-soft px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <input
            type="password"
            required
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Şifre"
            className="w-full rounded-lg border border-line bg-bg-soft px-3 py-2 text-sm outline-none focus:border-accent"
          />
          {err && <p className="text-sm text-red-500">{err}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-accent py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}
