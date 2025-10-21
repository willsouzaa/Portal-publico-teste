import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSeededSuggestions } from "@/lib/suggestions";
import { buildEmpreendimentoPath } from "@/lib/urls";
import type { PublicEmpreendimento } from "@/lib/types";
import Breadcrumb from '@/components/shared/Breadcrumb';

export const revalidate = 60;

type Props = { params: { slug: string } };

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const supabase = createSupabaseServerClient({ schema: "public" });
  const { data: cities } = await supabase
    .from("public_empreendimentos")
    .select("cidade, estado")
    .limit(500);

  const uniq = new Map<string, { cidade: string; estado: string }>();
  (cities ?? []).forEach((c: any) => {
    if (!c || !c.cidade || !c.estado) return;
    const key = `${c.cidade}||${c.estado}`;
    if (!uniq.has(key)) uniq.set(key, { cidade: c.cidade, estado: c.estado });
  });

  const slugs = Array.from(uniq.values()).slice(0, 50).map((c) => ({ slug: buildEmpreendimentoPath({ id: "", nome: c.cidade, cidade: c.cidade, estado: c.estado }).split('/')[0] }));
  // also include seeded suggestions if available
  const suggestions = getSeededSuggestions().map(s => ({ slug: s.slug }));
  return [...suggestions.slice(0, 10), ...slugs].slice(0, 50);
}

export default async function LandingPage({ params }: Props) {
  const { slug } = params;
  const suggestions = getSeededSuggestions();
  const match = suggestions.find((s) => s.slug === slug);

  // if no exact match, try to find by city fragment
  const city = match?.region.city ?? slug.split("-").slice(-2, -1)[0];

  const supabase = createSupabaseServerClient({ schema: "public" });
  const { data } = await supabase
    .from("public_empreendimentos")
    .select("*")
    .eq("cidade", city)
    .order("is_oportunidade", { ascending: false })
    .limit(24);

  const empreendimentos: PublicEmpreendimento[] = data ?? [];

  if (!empreendimentos.length) {
    notFound();
  }

  return (
    <div className="container py-12">
      <Breadcrumb items={[{ label: 'SanRemo', href: '/' }, { label: match?.title ?? `Resultados para ${city}` }]} />
      <h1 className="text-2xl font-semibold mb-6">{match?.title ?? `Resultados para ${city}`}</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {empreendimentos.map((emp) => (
          <a key={emp.id} href={`/${buildEmpreendimentoPath(emp)}`} className="block border rounded p-4">
            <div className="mb-2 font-semibold">{emp.nome}</div>
            <div className="text-sm text-muted-foreground">{emp.cidade} - {emp.estado}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
