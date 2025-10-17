"use client";

import Link from "next/link";
import type { SuggestionCard } from "@/lib/suggestions";

export default function SuggestionsCardList({ items }: { items: SuggestionCard[] }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((it) => (
        <Link key={it.id} href={`/${it.slug}`} className="block rounded-lg border p-3 hover:shadow-md">
          <div className="h-36 w-full bg-slate-100 mb-3 flex items-center justify-center overflow-hidden">
            {it.image ? <img src={it.image} alt={it.title} className="object-cover h-full w-full" /> : <div className="text-sm text-muted-foreground">Imagem</div>}
          </div>
          <div>
            <h3 className="font-semibold text-sm">{it.title}</h3>
            <p className="text-xs text-muted-foreground">{it.subtitle}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
