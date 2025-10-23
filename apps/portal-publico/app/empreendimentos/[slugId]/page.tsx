import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Building2, Sparkles, Home } from "lucide-react";
import type { Metadata } from "next";

import { buildDefaultMetadata } from "../../../lib/seo";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import type { PublicEmpreendimentoDetail, PublicGaleriaFoto, PublicTipologia } from "../../../lib/types";
import { buildEmpreendimentoPath, parseEmpreendimentoParam, slugifyValue } from "../../../lib/urls";
import { ImageGallery } from "@/components/empreendimentos/ImageGallery";
import { CardPhotoSlider } from "@/components/empreendimentos/CardPhotoSlider";
import { TipologiasInteractive } from "@/components/empreendimentos/TipologiasInteractive";
import { EmpreendimentoCard } from "@/components/empreendimentos/EmpreendimentoCard";
import { LeadForm } from "@/components/shared/LeadForm";
import Eyebrow from '@/components/typography/Eyebrow';
import SectionTitle from '@/components/typography/SectionTitle';
import SectionLead from '@/components/typography/SectionLead';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Params {
  params: {
    slugId: string;
  };
}

async function fetchEmpreendimentoById(id: string): Promise<PublicEmpreendimentoDetail | null> {
  const supabase = createSupabaseServerClient({ schema: "public" });
  const { data, error } = await supabase
    .from("public_empreendimentos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar empreendimento:", error);
    return null;
  }

  return data;
}

async function fetchRegionSuggestions(
  cidade: string,
  currentId: string
): Promise<PublicEmpreendimentoDetail[]> {
  const supabase = createSupabaseServerClient({ schema: "public" });
  const { data, error } = await supabase
    .from("public_empreendimentos")
    .select("*")
    .eq("cidade", cidade)
    .neq("id", currentId)
    .order("is_oportunidade", { ascending: false })
    .order("preco_minimo", { ascending: true })
    .limit(4);

  if (error) {
    console.error("Erro ao buscar sugestões de empreendimentos:", error);
    return [];
  }

  return data ?? [];
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = parseEmpreendimentoParam(params.slugId);
  const empreendimento = await fetchEmpreendimentoById(id);

  if (!empreendimento) {
    return buildDefaultMetadata({
      title: "Empreendimento não encontrado | San Remo",
      description: "O empreendimento solicitado não está disponível."
    });
  }

  const baseMeta = buildDefaultMetadata({
    title: `${empreendimento.nome} | San Remo`,
    description: empreendimento.destaque ?? "Conheça os detalhes deste empreendimento San Remo."
  });

  const canonicalSegment = buildEmpreendimentoPath(empreendimento);
  const canonicalPath = `/${canonicalSegment}`;
  const coverImage = empreendimento.imagem_capa ?? undefined;

  return {
    ...baseMeta,
    alternates: {
      canonical: canonicalPath
    },
    openGraph: {
      ...baseMeta.openGraph,
      url: canonicalPath,
      images: coverImage
        ? [{ url: coverImage, width: 1200, height: 630, alt: empreendimento.nome }]
        : baseMeta.openGraph?.images
    }
  } satisfies Metadata;
}

export const revalidate = 60;

function formatCurrency(value?: string | number | null): string | null {
  if (value === null || value === undefined || value === "") return null;
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return null;
  return numeric.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const statusLabels: Record<string, string> = {
  pre_lancamento: "Pré-lançamento",
  lancamento: "Lançamento",
  obra: "Em obra",
  entregue: "Entregue"
};

function formatStatus(value?: string | null) {
  if (!value) return "Status não informado";
  return statusLabels[value] ?? value.charAt(0).toUpperCase() + value.slice(1);
}

export default async function EmpreendimentoPage({ params }: Params) {
  const { id, slugFragment } = parseEmpreendimentoParam(params.slugId);
  const empreendimento = await fetchEmpreendimentoById(id);

  if (!empreendimento) {
    notFound();
  }

  const canonicalSegment = buildEmpreendimentoPath(empreendimento);
  const canonicalSlug = slugifyValue(empreendimento.slug ?? empreendimento.nome) || "empreendimento";

  if (!slugFragment || slugFragment !== canonicalSlug) {
    redirect(`/${canonicalSegment}`);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.sanremo.com.br";
  const canonicalUrl = `${siteUrl}/${canonicalSegment}`;

  const sugestoesRaw = await fetchRegionSuggestions(empreendimento.cidade, empreendimento.id);
  const sugestoes = sugestoesRaw.map((item) => ({
    data: item,
    slug: buildEmpreendimentoPath(item)
  }));

  const galleryImages = Array.isArray(empreendimento.galeria)
    ? empreendimento.galeria
        .map((item: PublicGaleriaFoto) => item.url)
        .filter((url): url is string => Boolean(url))
    : empreendimento.imagem_capa
        ? [empreendimento.imagem_capa]
        : [];

  const tipologias: PublicTipologia[] = Array.isArray(empreendimento.tipologias)
    ? empreendimento.tipologias
    : [];

  const destaqueResumo = empreendimento.destaque ?? empreendimento.descricao ?? "Conheça os diferenciais deste empreendimento selecionado pela San Remo.";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateListing",
            name: empreendimento.nome,
            description: destaqueResumo,
            url: canonicalUrl,
            address: {
              "@type": "PostalAddress",
              addressLocality: empreendimento.cidade,
              addressRegion: empreendimento.estado,
              streetAddress: empreendimento.bairro ?? undefined,
              addressCountry: "BR"
            },
            offers: empreendimento.preco_minimo
              ? {
                  "@type": "Offer",
                  price: Number(empreendimento.preco_minimo),
                  priceCurrency: "BRL"
                }
              : undefined
          })
        }}
      />

      {/* Hero */}
      <section
        className="relative overflow-hidden"
        aria-label="Hero do empreendimento"
      >
        {galleryImages.length > 0 ? (
          <div className="absolute inset-0">
            <CardPhotoSlider images={galleryImages} empreendimentoNome={empreendimento.nome} />
          </div>
        ) : (
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${empreendimento.imagem_capa ?? ''})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        )}
        <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
        <div className="relative z-10">
          <div className="container flex flex-col gap-8 py-12 text-white md:py-16 min-h-[280px]">
            <Link
              href="/"
              className="inline-flex items-center gap-2 self-start rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para empreendimentos
            </Link>

            <div className="grid gap-8 lg:grid-cols-[2fr,1fr] lg:items-center">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/90">
                  <Eyebrow className="rounded-full bg-white/10 px-4 py-1">{empreendimento.cidade} · {empreendimento.estado}</Eyebrow>
                  {empreendimento.is_oportunidade && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#e5a855] px-4 py-1 text-[#13263d]">
                      <Sparkles className="h-3 w-3" /> Oportunidade
                    </span>
                  )}
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-white">
                    <Building2 className="h-3.5 w-3.5" /> {formatStatus(empreendimento.status)}
                  </span>
                </div>

                <div className="space-y-4">
                  <h1 className="text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
                    {empreendimento.nome}
                  </h1>
                  <p className="max-w-2xl text-base text-white/90">
                    {destaqueResumo}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-sm text-white/90 md:text-base">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span>
                      {empreendimento.bairro ? `${empreendimento.bairro}, ` : ""}
                      {empreendimento.cidade}/{empreendimento.estado}
                    </span>
                  </div>
                  {empreendimento.data_entrega_prevista && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      <span>
                        Entrega prevista: {new Date(empreendimento.data_entrega_prevista).toLocaleDateString("pt-BR", {
                          month: "short",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-5 rounded-3xl border border-white/15 bg-white/10 p-8 text-white backdrop-blur">
                {empreendimento.preco_minimo && (
                  <div>
                    <span className="text-xs uppercase tracking-[0.25em] text-white/70">Investimento inicial</span>
                    <p className="mt-2 text-3xl font-semibold">
                      {formatCurrency(empreendimento.preco_minimo)}
                    </p>
                  </div>
                )}
                <div className="grid gap-3 text-sm text-white/80">
                  <div className="flex justify-between border-b border-white/15 pb-3">
                    <span>Status</span>
                    <span className="font-medium text-white">{formatStatus(empreendimento.status)}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/15 pb-3">
                    <span>Segmento</span>
                    <span className="font-medium text-white">{empreendimento.tipo ?? "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Atualizado em</span>
                    <span className="font-medium text-white">
                      {new Date(empreendimento.updated_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conteúdo principal */}
      <section className="bg-gradient-to-b from-white via-white to-slate-50">
        <div className="container space-y-14 py-14">
          <div className="grid gap-10 lg:grid-cols-[2fr,1fr]">
            <div className="space-y-10">

              {(empreendimento.descricao || empreendimento.destaque) && (
                <Card className="border border-[#0f2f4e]/10 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-semibold text-[#0f2f4e]">
                      Diferenciais do projeto
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-base leading-relaxed text-slate-600">
                    {empreendimento.destaque && (
                      <p className="text-lg font-semibold text-[#0f2f4e]">
                        {empreendimento.destaque}
                      </p>
                    )}
                    {empreendimento.descricao && (
                      <div className="whitespace-pre-wrap">
                        {empreendimento.descricao}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {tipologias.length > 0 && (
                <TipologiasInteractive tipologias={tipologias} />
              )}
            </div>

            <aside className="space-y-6">
              <Card className="border border-[#0f2f4e]/10 bg-white/95 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-[#0f2f4e]">
                    Informações rápidas
                  </CardTitle>
                  <CardDescription>
                    Principais dados do empreendimento para o seu primeiro contato.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Tipo de empreendimento</span>
                    <span className="font-medium text-[#0f2f4e]">{empreendimento.tipo ?? "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Localização</span>
                    <span className="font-medium text-[#0f2f4e]">
                      {empreendimento.cidade}/{empreendimento.estado}
                    </span>
                  </div>
                  {empreendimento.data_entrega_prevista && (
                    <div className="flex justify-between">
                      <span>Entrega prevista</span>
                      <span className="font-medium text-[#0f2f4e]">
                        {new Date(empreendimento.data_entrega_prevista).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <LeadForm empreendimentoId={empreendimento.id} empreendimentoNome={empreendimento.nome} />
            </aside>
          </div>
        </div>
      </section>

      {sugestoes.length > 0 && (
        <section className="bg-white py-16">
          <div className="container space-y-8">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <span className="text-sm font-medium uppercase tracking-[0.3em] text-[#e5a855]">
                  Mais opções na região
                </span>
                <h2 className="text-3xl font-semibold text-[#0f2f4e]">
                  Empreendimentos em {empreendimento.cidade}
                </h2>
                <p className="text-slate-600">
                  Conheça outras oportunidades selecionadas pela San Remo próximas a este endereço.
                </p>
              </div>
              <Link
                href={`/?cidade=${encodeURIComponent(empreendimento.cidade)}&estado=${encodeURIComponent(empreendimento.estado)}`}
                className="inline-flex items-center text-sm font-semibold text-[#e5a855] hover:text-[#e5a855]/80"
              >
                Ver todos em {empreendimento.cidade}
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sugestoes.map(({ data, slug }) => (
                <EmpreendimentoCard key={data.id} empreendimento={data} slug={slug} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
