import Link from "next/link";
import type { Metadata } from "next";

import { EmpreendimentoList } from "@/components/empreendimentos/EmpreendimentoList";
import Eyebrow from '@/components/typography/Eyebrow';
import SectionTitle from '@/components/typography/SectionTitle';
import SectionLead from '@/components/typography/SectionLead';
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PublicEmpreendimento } from "@/lib/types";
import { buildEmpreendimentoPath } from "@/lib/urls";
import WhatsAppBanner from "@/components/WhatsAppBanner";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Todos os empreendimentos | San Remo Imóveis",
    description: "Veja todos os empreendimentos selecionados pela San Remo Imóveis.",
  };
}

async function fetchEmpreendimentos(): Promise<PublicEmpreendimento[]> {
  const supabase = createSupabaseServerClient({ schema: "public" });
  const { data, error } = await supabase
    .from("public_empreendimentos")
    .select("*")
    .order("is_oportunidade", { ascending: false })
    .order("preco_minimo", { ascending: true });

  if (error) {
    console.error("[portal-publico] erro ao buscar empreendimentos (all):", error);
    return [];
  }

  return data ?? [];
}

export default async function AllEmpreendimentosPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const empreendimentos = await fetchEmpreendimentos();

  const slugMap: Record<string, string> = {};
  empreendimentos.forEach((emp) => {
    slugMap[emp.id] = buildEmpreendimentoPath(emp as any);
  });

  const initialFilters: Record<string, any> = {
  search: Array.isArray(searchParams?.q) ? searchParams?.q[0] : searchParams?.q ?? "",
  cidade: Array.isArray(searchParams?.cidade) ? searchParams?.cidade[0] : searchParams?.cidade ?? "",
  tipo: Array.isArray(searchParams?.tipo) ? searchParams?.tipo[0] : searchParams?.tipo ?? "",
  status: Array.isArray(searchParams?.status) ? searchParams?.status[0] : searchParams?.status ?? "",
  precoMin: Array.isArray(searchParams?.precoMin) ? searchParams?.precoMin[0] : searchParams?.precoMin ?? "",
  precoMax: Array.isArray(searchParams?.precoMax) ? searchParams?.precoMax[0] : searchParams?.precoMax ?? "",
  bairro: Array.isArray(searchParams?.bairro) ? searchParams?.bairro[0] : searchParams?.bairro ?? ""
  };

  return (
    <div className="container py-16 lg:py-24">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <SectionTitle>Todos os empreendimentos</SectionTitle>
          <SectionLead>Explore nosso portfólio completo de empreendimentos.</SectionLead>
        </div>
        <div>
          <Link href="/" className="text-sm font-medium text-primary hover:underline">Voltar para a home</Link>
        </div>
      </div>

      <EmpreendimentoList
        empreendimentos={empreendimentos}
        slugMap={slugMap}
        showAll={true}
        initialFilters={initialFilters}
      />
      <WhatsAppBanner
        phone="5548988405365"
        message="Olá! Tenho interesse neste empreendimento."
      />
    </div>

    
  );
}
