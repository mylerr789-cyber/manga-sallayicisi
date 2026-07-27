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
        placeholder="Seri ara"
        className="w-32 border-2 border-ink bg-card px-3 py-1.5 font-mono text-xs uppercase tracking-wider outline-none transition-colors placeholder:text-muted focus:border-accent sm:w-52"
      />
    </form>
  );
}
