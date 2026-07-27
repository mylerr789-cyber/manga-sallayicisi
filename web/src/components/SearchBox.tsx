"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBox() {
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(q.trim() ? `/library?q=${encodeURIComponent(q.trim())}` : "/library");
      }}
    >
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Seri ara..."
        className="w-36 sm:w-56 rounded-lg border border-line bg-card px-3 py-1.5 text-sm outline-none placeholder:text-muted focus:border-accent transition-colors"
      />
    </form>
  );
}
