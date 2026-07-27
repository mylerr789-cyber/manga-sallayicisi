import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-[50vh] place-items-center text-center">
      <div>
        <p className="text-6xl font-bold text-accent">404</p>
        <p className="mt-3 text-lg font-medium">Sayfa bulunamadı</p>
        <p className="mt-1 text-sm text-muted">Aradığın içerik kaldırılmış veya hiç var olmamış olabilir.</p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
