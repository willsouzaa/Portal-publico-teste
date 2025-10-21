import Link from "next/link";
import React from "react";

type Crumb = { label: string; href?: string };

export function Breadcrumb({ items, renderJsonLd = false }: { items: Crumb[]; renderJsonLd?: boolean }) {
  const jsonLd = renderJsonLd
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((it, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: it.label,
          item: it.href ?? undefined
        }))
      }
    : null;

  return (
    <nav aria-label="breadcrumb" className="mb-3">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
        {items.map((it, idx) => (
          <li key={idx} className="inline-flex items-center">
            {it.href ? (
              <Link href={it.href} className="text-slate-600 hover:underline">
                {it.label}
              </Link>
            ) : (
              <span className="text-slate-500">{it.label}</span>
            )}
            {idx < items.length - 1 && <span className="mx-2">›</span>}
          </li>
        ))}
      </ol>
      {renderJsonLd && jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
    </nav>
  );
}

export default Breadcrumb;
