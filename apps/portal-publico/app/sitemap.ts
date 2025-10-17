import type { MetadataRoute } from "next";
import { createSupabaseServerClient } from "../lib/supabase/server";
import { buildEmpreendimentoPath } from "../lib/urls";
import { buildCityLandingSegment } from "../lib/urls";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createSupabaseServerClient({ schema: "public" });
  const { data } = await supabase
    .from("public_empreendimentos")
    .select("id, nome, cidade, estado, updated_at")
    .order("updated_at", { ascending: false })
    .limit(1000);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.sanremo.com.br";
  // Build base entries for root and individual empreendimento pages
  const baseEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily" as const,
      priority: 1
    },
    ...(data ?? []).map((item) => ({
      url: `${baseUrl}/${buildEmpreendimentoPath(item)}`,
      lastModified: item.updated_at ?? new Date().toISOString(),
      changeFrequency: "weekly" as const,
      priority: 0.7
    }))
  ];

  // Add city landing pages for distinct cities (limit 50)
  const { data: cities } = await supabase
    .from("public_empreendimentos")
    .select("cidade, estado")
    .limit(500);

  const uniq = new Map<string, { cidade: string; estado: string }>();
  (cities ?? []).forEach((c: any) => {
    const key = `${c.cidade}||${c.estado}`;
    if (!uniq.has(key)) uniq.set(key, { cidade: c.cidade, estado: c.estado });
  });

  const cityEntries = Array.from(uniq.values()).slice(0, 50).map((c) => ({
    url: `${baseUrl}/landing/${buildCityLandingSegment(c.cidade, c.estado)}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.6
  }));

  return [...baseEntries, ...cityEntries];
}
