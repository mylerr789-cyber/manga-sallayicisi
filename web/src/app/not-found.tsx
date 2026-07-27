import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-[55vh] place-items-center">
      <div className="panel halftone max-w-md p-10 text-center">
        <p className="font-display text-7xl uppercase text-accent">404</p>
        <p className="mt-3 font-display text-xl uppercase">Bu sayfa basılmamış</p>
        <p className="mt-2 text-sm text-muted">
          Aradığın içerik kaldırılmış veya hiç var olmamış olabilir.
        </p>
        <Link href="/" className="btn-ink mt-6">
          Ana sayfaya dön
        </Link>
      </div>
    </div>
  );
}
