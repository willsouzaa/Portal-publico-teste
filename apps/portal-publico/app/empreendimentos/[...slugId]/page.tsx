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
import Breadcrumb from "@/components/shared/Breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Params {
  params: {
    // catch-all route may provide string[] or string
    slugId: string | string[];
  };
}

async function fetchEmpreendimentoById(id: string): Promise<PublicEmpreendimentoDetail | null> {
  const supabase = createSupabaseServerClient({ schema: "public" });
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? process.env.NEXT_PUBLIC_SUPABASE_BUCKET ?? "empreendimentos";

  const { data, error } = await supabase
    .from("public_empreendimentos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar empreendimento:", error);
    return null;
  }

  if (!data) return null;

  const resolvePublic = (path?: string | null): string | null => {
    if (!path) return null;
    if (typeof path !== "string") return null;
    if (path.startsWith("http") || path.startsWith("data:")) return path;
    try {
      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
      return publicData?.publicUrl ?? path;
    } catch (e) {
      console.error("Erro ao resolver publicUrl:", e);
      return path;
    }
  };

  // Normaliza imagem_capa para URL pública
  (data as any).imagem_capa = resolvePublic((data as any).imagem_capa) ?? (data as any).imagem_capa;

  // Normaliza galeria (aceita array de strings ou objetos)
  if (Array.isArray((data as any).galeria)) {
    (data as any).galeria = (data as any).galeria.map((g: any) => {
      if (!g) return g;
      if (typeof g === "string") return { url: resolvePublic(g) ?? g };
      const candidate = g.url ?? g.path ?? g.imagem ?? g.imagem_capa ?? null;
      return { ...g, url: resolvePublic(candidate) ?? candidate };
    });
  }

  // Normaliza imagens das tipologias (imagem_capa ou campos alternativos)
  if (Array.isArray((data as any).tipologias)) {
    (data as any).tipologias = (data as any).tipologias.map((t: any) => {
      if (!t) return t;
      const candidate = t.imagem_capa ?? t.url ?? t.path ?? t.imagem ?? null;
      return { ...t, imagem_capa: resolvePublic(candidate) ?? candidate };
    });
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
  const rawParam = Array.isArray(params.slugId) ? params.slugId.join("/") : params.slugId;
  const { id } = parseEmpreendimentoParam(rawParam);
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

// Helpers copied from shared workspace to compute tipologia resumo and ranges
const sanitizeNumber = (value: number | string | null | undefined): number | undefined => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const computeMinMax = (values: Array<number | undefined>) => {
  const sanitized = values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  if (!sanitized.length) {
    return { min: undefined, max: undefined };
  }

  const min = Math.min(...sanitized);
  const max = Math.max(...sanitized);
  return { min, max };
};

const computeTipologiaResumo = (tipologias: any[] = []) => {
  const valores = tipologias.map((t: any) => sanitizeNumber(t.valor ?? t.preco));
  const areas = tipologias.map((t: any) => sanitizeNumber(t.metragem ?? t.area_privativa));
  const quartos = tipologias.map((t: any) => sanitizeNumber(t.num_quartos ?? t.quartos));
  const banheiros = tipologias.map((t: any) => sanitizeNumber(t.num_banheiros ?? t.banheiros));
  const vagas = tipologias.map((t: any) => sanitizeNumber(t.num_vagas ?? t.vagas));
  const suites = tipologias.map((t: any) => sanitizeNumber(t.num_suites ?? t.suites));

  const { min: priceMin, max: priceMax } = computeMinMax(valores);
  const { min: areaMin, max: areaMax } = computeMinMax(areas);
  const { min: quartosMin, max: quartosMax } = computeMinMax(quartos);
  const { min: banheirosMin, max: banheirosMax } = computeMinMax(banheiros);
  const { min: vagasMin, max: vagasMax } = computeMinMax(vagas);
  const { min: suitesMin, max: suitesMax } = computeMinMax(suites);

  return {
    priceMin,
    priceMax,
    areaMin,
    areaMax,
    quartosMin,
    quartosMax,
    banheirosMin,
    banheirosMax,
    vagasMin,
    vagasMax,
    suitesMin,
    suitesMax,
  };
};

const formatRange = (
  min?: number,
  max?: number,
  options?: { suffix?: string; unit?: string; pluralLabel?: string; singularLabel?: string }
) => {
  if (typeof min !== 'number' && typeof max !== 'number') return undefined;

  const suffix = options?.suffix ?? '';
  const unit = options?.unit ?? '';
  const singularLabel = options?.singularLabel;
  const pluralLabel = options?.pluralLabel;

  const formatValue = (value: number) => {
    const formatted = unit ? `${value}${unit}` : value.toString();
    return suffix ? `${formatted}${suffix}` : formatted;
  };

  if (typeof min === 'number' && typeof max === 'number') {
    if (min === max) {
      const base = formatValue(min);
      if (singularLabel && pluralLabel) {
        const label = min === 1 ? singularLabel : pluralLabel;
        return `${min} ${label}`;
      }
      return base;
    }
    const minLabel = formatValue(min);
    const maxLabel = formatValue(max);
    return `${minLabel} a ${maxLabel}`;
  }

  const value = typeof min === 'number' ? min : max!;
  if (singularLabel && pluralLabel) {
    const label = value === 1 ? singularLabel : pluralLabel;
    return `${value} ${label}`;
  }
  return formatValue(value);
};

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
  const rawParam = Array.isArray(params.slugId) ? params.slugId.join("/") : params.slugId;
  const { id, slugFragment } = parseEmpreendimentoParam(rawParam);
  // If the param contains a base segment (e.g. "base/slug"), normalize to last segment
  const slugFragmentNormalized = slugFragment ? slugFragment.split('/').pop() : undefined;
  const empreendimento = await fetchEmpreendimentoById(id);

  if (!empreendimento) {
    notFound();
  }

  const canonicalSegment = buildEmpreendimentoPath(empreendimento);
  const canonicalSlug = slugifyValue(empreendimento.slug ?? empreendimento.nome) || "empreendimento";

  if (!slugFragmentNormalized || slugFragmentNormalized !== canonicalSlug) {
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

  const resumo = computeTipologiaResumo(tipologias as any[]);
  const formattedMinPrice = formatCurrency(resumo.priceMin ?? empreendimento.preco_minimo as any);
  const areaRange = formatRange(resumo.areaMin, resumo.areaMax, { unit: 'm²' });
  const quartosRange = formatRange(resumo.quartosMin, resumo.quartosMax, { singularLabel: 'quarto', pluralLabel: 'quartos' });
  const banheirosRange = formatRange(resumo.banheirosMin, resumo.banheirosMax, { singularLabel: 'banheiro', pluralLabel: 'banheiros' });
  const vagasRange = formatRange(resumo.vagasMin, resumo.vagasMax, { singularLabel: 'vaga', pluralLabel: 'vagas' });
  const suitesRange = formatRange(resumo.suitesMin, resumo.suitesMax, { singularLabel: 'suíte', pluralLabel: 'suítes' });

  const resumoInfo = [
    { label: 'Área', value: areaRange },
    { label: 'Quartos', value: quartosRange },
    { label: 'Banheiros', value: banheirosRange },
    { label: 'Vagas', value: vagasRange },
    { label: 'Suítes', value: suitesRange },
  ].filter(item => Boolean(item.value));

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

      <Breadcrumb
                  items={[
                    { label: "SanRemo", href: "/" },
                    { label: `Apartamentos em ${empreendimento.cidade}, ${empreendimento.estado}`, href: `/?cidade=${encodeURIComponent(empreendimento.cidade)}&estado=${encodeURIComponent(empreendimento.estado)}` },
                    { label: empreendimento.tipo ?? 'Empreendimentos' },
                    ...(empreendimento.bairro ? [{ label: empreendimento.bairro, href: `/?bairro=${encodeURIComponent(empreendimento.bairro)}&cidade=${encodeURIComponent(empreendimento.cidade)}` }] : []),
                    { label: empreendimento.nome }
                  ]}
                />
                
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        aria-label="Hero do empreendimento"
      >
        {galleryImages.length > 0 ? (
          <div className="absolute inset-0">
            <CardPhotoSlider images={galleryImages} empreendimentoNome={empreendimento.nome} showControls={false} />
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
          <div className="container flex flex-col gap-3 py-3 text-white md:py-6 min-h-[120px]">
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
                  <span className="rounded-full bg-white/10 px-4 py-1">
                    {empreendimento.cidade} · {empreendimento.estado}
                  </span>
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
                  <h1 className="text-3xl font-semibold leading-tight md:text-4xl lg:text-5xl">
                    {empreendimento.nome}
                  </h1>
                  <p className="max-w-2xl text-sm text-white/90">
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

                    {/* Quick resumo stats copied from SPA card */}
                    {formattedMinPrice && (
                      <div className="mt-3 flex flex-col border-t border-white/15 pt-3">
                        <span className="text-xs uppercase tracking-[0.12em] text-white/70">A partir de</span>
                        <span className="text-lg font-semibold text-white">{formattedMinPrice}</span>
                      </div>
                    )}

                        {resumoInfo.length > 0 && (
                          <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-white/80">
                            {resumoInfo.map(item => (
                              <div key={item.label} className="flex justify-between">
                                <span>{item.label}</span>
                                <span className="font-medium text-white">{item.value}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-4">
                          <a
                            href={`https://wa.me/554888888888?text=${encodeURIComponent("Quero receber o ebook do " + empreendimento.nome)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-full items-center justify-center rounded-xl bg-primary/80 px-4 py-3 text-sm font-semibold text-white"
                          >
                            Receber ebook
                          </a>
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
              {/* SPA-style empreendimento card (visual parity with SPA) - server-rendered */}
              <article className="empreendimento-card">
                <div className="empreendimento-card__media">
                  {galleryImages.length > 0 ? (
                    <CardPhotoSlider images={galleryImages} empreendimentoNome={empreendimento.nome} />
                  ) : (
                    <img
                      src={empreendimento.imagem_capa ?? ''}
                      alt={empreendimento.nome}
                    />
                  )}
                  
                  <div className="empreendimento-card__badge-group">
                    {(empreendimento as any).modelo_juridico && (
                      <span className="badge badge--legal">{(empreendimento as any).modelo_juridico === 'spe' ? 'SPE' : (empreendimento as any).modelo_juridico === 'scp' ? 'SCP' : 'INCORP.'}</span>
                    )}
                    <span className="badge badge--status">{formatStatus(empreendimento.status)}</span>
                  </div>

                  {empreendimento.is_oportunidade && (
                    <div className="badge--opportunity">Oportunidade</div>
                  )}

                  {formattedMinPrice && (
                    <div className="empreendimento-card__price">
                      <small>A partir de</small>
                      <div>{formattedMinPrice}</div>
                    </div>
                  )}
                </div>

                <div className="empreendimento-card__body">
                  <h2 className="empreendimento-card__title">{empreendimento.nome}</h2>

                  <div className="empreendimento-card__meta">
                    <div className="empreendimento-card__location">
                      <MapPin className="h-3 w-3" />
                      <span>{empreendimento.cidade}{empreendimento.bairro ? `, ${empreendimento.bairro}` : ''}, {empreendimento.estado}</span>
                    </div>
                    <div className="empreendimento-card__meta">
                      <Building2 className="h-3 w-3" />
                      <span className="truncate">{(empreendimento as any).incorporadoras?.nome ?? ''}</span>
                    </div>
                  </div>

                  <p className="empreendimento-card__description">{empreendimento.destaque ?? empreendimento.descricao ?? ''}</p>

                  <div className="empreendimento-card__stats">
                    {resumoInfo.map(item => (
                      <div key={item.label} className="">
                        <strong>{item.label}</strong>
                        <div>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <a href="#lead" className="empreendimento-card__cta">Ver informações</a>
                  </div>
                </div>
              </article>


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
