import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { HeroAnimated } from "@/components/HeroAnimated";
import { EmpreendimentoCard } from "@/components/empreendimentos/EmpreendimentoCard";
import { EmpreendimentoList } from "@/components/empreendimentos/EmpreendimentoList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buildDefaultMetadata } from "@/lib/seo";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PublicEmpreendimento } from "@/lib/types";
import { buildEmpreendimentoPath, buildCityLandingSegment } from "@/lib/urls";
import WhatsappButton from "./components/WhatsappButton";
import LeadModalClientWrapper from "@/components/LeadModalClientWrapper";
import DebugOpenModal from "@/components/DebugOpenModal";

export const revalidate = 60;

const DEFAULT_CITY = "Florianópolis";
const DEFAULT_STATE = "SC";
const STATUS_LABELS: Record<string, string> = {
  pre_lancamento: "Pré-lançamento",
  lancamento: "Lançamento",
  obra: "Em obra",
  entregue: "Pronto para morar"
};

const KEYWORDS_BASE = [
  "apartamentos à venda",
  "imóveis em santa catarina",
  "lançamentos imobiliários",
  "empreendimentos san remo",
  "apartamentos prontos para morar",
  "investimento imobiliário"
];

const BENEFITS = [
  {
    title: "Curadoria San Remo",
    description:
      "Selecionamos empreendimentos com alto potencial de valorização, qualidade construtiva e localização estratégica em Santa Catarina."
  },
  {
    title: "Atendimento consultivo",
    description:
      "Nossa equipe acompanha cada etapa da jornada de compra, oferecendo transparência, segurança jurídica e negociação personalizada."
  },
  {
    title: "Portfólio premium",
    description:
      "Lançamentos, imóveis em obras e prontos para morar com condições especiais, infraestrutura completa e design contemporâneo."
  }
];

const ARTICLES = [
  {
    title: "Guia completo para investir em Florianópolis",
    excerpt: "Descubra por que Itapema é um dos mercados imobiliários mais promissores de Santa Catarina.",
    href: "/blog/guia-investir-itapema"
  },
  {
    title: "Como escolher o imóvel ideal no litoral catarinense",
    excerpt: "Dicas práticas para avaliar infraestrutura, plantas e diferenciais que valorizam seu investimento.",
    href: "/blog/como-escolher-imovel-litoral"
  },
  {
    title: "Tendências de alto padrão em 2025",
    excerpt: "Conheça os acabamentos, tecnologias e áreas comuns que estão transformando os empreendimentos premium.",
    href: "/blog/tendencias-alto-padrao-2025"
  }
];

type SearchParams = Record<string, string | string[] | undefined>;

type FilterParams = {
  q?: string;
  cidade?: string;
  estado?: string;
  bairro?: string;
  status?: string;
  precoMin?: number;
  precoMax?: number;
};

async function fetchEmpreendimentos(): Promise<PublicEmpreendimento[]> {
  const supabase = createSupabaseServerClient({ schema: "public" });
  const { data, error } = await supabase
    .from("public_empreendimentos")
    .select("*")
    .order("is_oportunidade", { ascending: false })
    .order("preco_minimo", { ascending: true });

  if (error) {
    console.error("[portal-publico] erro ao buscar empreendimentos:", error);
    return [];
  }

  return data ?? [];
}

function normalizeParam(value?: string | string[]): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function parseFilters(searchParams: SearchParams): FilterParams {
  const q = normalizeParam(searchParams.q)?.trim();
  const cidade = normalizeParam(searchParams.cidade)?.trim();
  const estado = normalizeParam(searchParams.estado)?.trim()?.toUpperCase();
  const bairro = normalizeParam(searchParams.bairro)?.trim();
  const status = normalizeParam(searchParams.status)?.trim();
  const precoMinRaw = normalizeParam(searchParams.precoMin);
  const precoMaxRaw = normalizeParam(searchParams.precoMax);

  const precoMin = precoMinRaw ? Number(precoMinRaw) : undefined;
  const precoMax = precoMaxRaw ? Number(precoMaxRaw) : undefined;

  return {
    q: q?.length ? q : undefined,
    cidade: cidade?.length ? cidade : undefined,
    estado: estado?.length ? estado : undefined,
    bairro: bairro?.length ? bairro : undefined,
    status: status?.length ? status : undefined,
    precoMin: Number.isFinite(precoMin) ? precoMin : undefined,
    precoMax: Number.isFinite(precoMax) ? precoMax : undefined
  };
}

function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function applyFilters(
  empreendimentos: PublicEmpreendimento[],
  filters: FilterParams
): PublicEmpreendimento[] {
  return empreendimentos.filter((emp) => {
    if (filters.q) {
      const haystack = [
        emp.nome,
        emp.cidade,
        emp.estado,
        emp.bairro ?? "",
        emp.destaque ?? "",
        emp.descricao ?? ""
      ]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(filters.q.toLowerCase())) {
        return false;
      }
    }

    if (filters.cidade && emp.cidade.toLowerCase() !== filters.cidade.toLowerCase()) {
      return false;
    }

    if (filters.estado && emp.estado.toLowerCase() !== filters.estado.toLowerCase()) {
      return false;
    }

    if (filters.bairro) {
      const bairro = emp.bairro ?? "";
      if (bairro.toLowerCase() !== filters.bairro.toLowerCase()) {
        return false;
      }
    }

    if (filters.status && emp.status !== filters.status) {
      return false;
    }

    const preco = toNumber(emp.preco_minimo);
    if (filters.precoMin !== undefined && (preco === null || preco < filters.precoMin)) {
      return false;
    }

    if (filters.precoMax !== undefined && (preco === null || preco > filters.precoMax)) {
      return false;
    }

    return true;
  });
}

function getHighlightEmpreendimentos(
  empreendimentos: PublicEmpreendimento[]
): PublicEmpreendimento[] {
  const oportunidades = empreendimentos.filter((emp) => emp.is_oportunidade);
  const restantes = empreendimentos.filter((emp) => !emp.is_oportunidade);
  return [...oportunidades, ...restantes].slice(0, 5);
}

function getCityStateMap(empreendimentos: PublicEmpreendimento[]): Record<string, string> {
  return empreendimentos.reduce<Record<string, string>>((acc, emp) => {
    if (!acc[emp.cidade]) {
      acc[emp.cidade] = emp.estado;
    }
    return acc;
  }, {});
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function buildCanonicalPath(city: string, state: string): string {
  return buildCityLandingSegment(city, state);
}

function buildStructuredData(
  empreendimentos: PublicEmpreendimento[],
  slugMap: Record<string, string>,
  siteUrl: string,
  city: string,
  state: string,
  description: string
) {
  const offers = empreendimentos.slice(0, 12).map((emp) => {
    const price = toNumber(emp.preco_minimo);
    return {
      "@type": "Offer",
      url: `${siteUrl}/${slugMap[emp.id]}`,
      price: price ?? undefined,
      priceCurrency: price ? "BRL" : undefined,
      availability: "https://schema.org/InStock",
      itemOffered: {
        "@type": "Apartment",
        name: emp.nome,
        description: emp.destaque ?? emp.descricao ?? undefined,
        address: {
          "@type": "PostalAddress",
          addressLocality: emp.cidade,
          addressRegion: emp.estado,
          streetAddress: emp.bairro ?? undefined,
          addressCountry: "BR"
        }
      }
    };
  });

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: `Apartamentos à venda em ${city}, ${state}`,
    description,
    url: `${siteUrl}/${buildCanonicalPath(city, state)}`,
    offers
  };
}

export async function generateMetadata({
  searchParams
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const filters = parseFilters(searchParams);
  const city = filters.cidade ?? DEFAULT_CITY;
  const state = filters.estado ?? DEFAULT_STATE;

  const title = `Apartamentos à venda em ${city}, ${state} | San Remo Imóveis`;
  const description = `Descubra empreendimentos à venda em ${city}, ${state}. Lançamentos, prontos para morar e oportunidades exclusivas com a San Remo Imóveis.`;
  const baseMetadata = buildDefaultMetadata({ title, description });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.sanremo.com.br";
  const canonicalPath = buildCanonicalPath(city, state);

  return {
    ...baseMetadata,
    keywords: Array.from(new Set([...KEYWORDS_BASE, city, `${city} ${state}`, "san remo imóveis"])),
    alternates: {
      canonical: `${siteUrl}/${canonicalPath}`
    },
    openGraph: {
      ...baseMetadata.openGraph,
      url: `${siteUrl}/${canonicalPath}`,
      title,
      description
    },
    twitter: {
      ...baseMetadata.twitter,
      title,
      description
    }
  };
}

export default async function HomePage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  // Server-side canonicalization: remove empty query parameters produced by external links or bots.
  // If the cleaned query string differs from the incoming one, perform a server redirect to the
  // canonical (clean) URL so crawlers and users see a single canonical version.
  const originalParams = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    const value = Array.isArray(v) ? v[0] : v;
    originalParams.append(k, value === undefined || value === null ? "" : String(value));
  }

  const cleanedParams = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    const value = Array.isArray(v) ? v[0] : v;
    if (value == null) continue;
    const s = String(value).trim();
    if (s.length === 0) continue;
    cleanedParams.append(k, s);
  }

  if (originalParams.toString() !== cleanedParams.toString()) {
    const qs = cleanedParams.toString();
    const cleanPath = qs ? `/?${qs}` : "/";
    // Use a 308 permanent redirect for canonicalization (preserve method semantics).
    redirect(cleanPath);
  }

  const filters = parseFilters(searchParams);
  const empreendimentos = await fetchEmpreendimentos();
  const filteredEmpreendimentos = applyFilters(empreendimentos, filters);
  const highlights = getHighlightEmpreendimentos(empreendimentos);
  const cityStateMap = getCityStateMap(empreendimentos);
  const activeCity = filters.cidade ?? DEFAULT_CITY;
  const activeState = filters.estado ?? cityStateMap[activeCity] ?? DEFAULT_STATE;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.sanremo.com.br";
  const canonicalPath = buildCanonicalPath(activeCity, activeState);

  const slugMap: Record<string, string> = {};
  empreendimentos.forEach((emp) => {
    slugMap[emp.id] = buildEmpreendimentoPath(emp);
  });

  const realEstateStructuredData = buildStructuredData(
    filteredEmpreendimentos,
    slugMap,
    siteUrl,
    activeCity,
    activeState,
    `Empreendimentos à venda em ${activeCity}, ${activeState} com a San Remo Imóveis.`
  );

  const itemListStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: filteredEmpreendimentos.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteUrl}/${slugMap[item.id]}`,
      name: item.nome
    }))
  };

  const totalEmpreendimentos = empreendimentos.length;
  const oportunidadesCount = empreendimentos.filter((emp) => emp.is_oportunidade).length;
  const cidadeCount = Object.keys(cityStateMap).length;
  const resultadosLabel = filteredEmpreendimentos.length === 1 ? "empreendimento" : "empreendimentos";

  const heroStats = [
    {
      label: "Empreendimentos ativos",
      value: totalEmpreendimentos
    },
    {
      label: "Oportunidades exclusivas",
      value: oportunidadesCount
    },
    {
      label: "Cidades atendidas",
      value: cidadeCount
    }
  ];

  const cidadeOptions = Object.entries(cityStateMap)
    .sort((a, b) => a[0].localeCompare(b[0], "pt-BR"))
    .map(([city, state]) => ({
      value: city,
      label: `${city} - ${state}`
    }));

  if (filters.cidade && !cidadeOptions.some((option) => option.value.toLowerCase() === filters.cidade!.toLowerCase())) {
    cidadeOptions.push({ value: filters.cidade, label: filters.cidade });
  }

  const tipoOptions = Array.from(
    new Set(
      empreendimentos
        .map((emp) => emp.tipo)
        .filter((value): value is string => Boolean(value && value.length))
    )
  )
    .sort((a, b) => a.localeCompare(b, "pt-BR"))
    .map((tipo) => ({
      value: tipo,
      label: tipo
    }));

  const statusOptionsBase = Object.entries(STATUS_LABELS)
    .filter(([value]) => empreendimentos.some((emp) => emp.status === value))
    .map(([value, label]) => ({
      value,
      label
    }));

  if (statusOptionsBase.length === 0) {
    statusOptionsBase.push(
      ...Object.entries(STATUS_LABELS).map(([value, label]) => ({
        value,
        label
      }))
    );
  }

  if (filters.status && !statusOptionsBase.some((option) => option.value === filters.status)) {
    statusOptionsBase.push({ value: filters.status, label: STATUS_LABELS[filters.status] ?? filters.status });
  }

  const initialFilterState = {
    search: filters.q ?? "",
    cidade: filters.cidade ?? "",
    tipo: "",
    status: filters.status ?? "",
    precoMin: filters.precoMin ? String(filters.precoMin) : "",
    precoMax: filters.precoMax ? String(filters.precoMax) : ""
  };

  const filterOptions = {
    cidades: cidadeOptions,
    tipos: tipoOptions,
    status: statusOptionsBase
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(realEstateStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListStructuredData) }}
      />

      <section className="relative isolate overflow-hidden bg-slate-950 py-10 text-white lg:py-16">
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/branding/ImagemCapa.jpg"
            alt="Ponte Hercílio Luz, Florianópolis"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            priority={true}
            className="z-0 w-full h-full"
          />
        </div>
        {/* Texto alinhado à esquerda */}
        <div className="relative flex justify-start items-center w-full min-h-[220px] py-6 px-4">
          <div className="space-y-2 bg-black/40 rounded-xl p-4 shadow-xl backdrop-blur-sm max-w-md w-full text-left" style={{ position: 'relative', top: '180px', zIndex: 10 }}>
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-secondary">
              Personal Shopper Imobiliário
            </span>
            <h1 className="text-2xl font-semibold leading-tight text-white sm:text-3xl">
              Viva o padrão San Remo no litoral catarinense
            </h1>
            <p className="max-w-md text-sm text-white/80">
              Descubra lançamentos, imóveis em obras e empreendimentos prontos para morar com a curadoria de um time que entende o luxo imobiliário catarinense.
            </p>
          </div>
          {/* Logo animada, só exibe em telas grandes (lg+) */}
          <div className="hidden lg:block absolute" style={{ bottom: '-40px', right: '16rem' }}>
            <img
              src="/branding/san-remo-logo.png"
              alt="San Remo Logo"
              width={220}
              height={220}
              style={{ opacity: 0, transform: 'translateY(40px)', transition: 'opacity 1s 0.5s, transform 1s 0.5s', animation: 'fadeInUpLogo 1s 0.5s forwards' }}
              className="opacity-90 object-contain drop-shadow-xl bg-black/40 rounded-xl p-2 shadow-xl backdrop-blur-sm"
            />
            <style>{`
              @keyframes fadeInUpLogo {
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
          </div>
        </div>
      </section>

      <section className="container py-16 lg:py-24" id="destaques">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-secondary">Curadoria San Remo</span>
            <h2 className="text-3xl font-semibold text-primary-900">Destaques da semana</h2>
            <p className="max-w-2xl text-base text-slate-500">
              Selecionamos oportunidades com condições especiais, localização privilegiada e diferenciais de alto padrão para você investir com segurança.
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-xl border-primary/30 px-5 text-sm font-semibold text-primary hover:border-primary hover:bg-primary/5"
          >
            <Link href="/empreendimentos">Ver todos os empreendimentos</Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {highlights.length > 0 ? (
            highlights.map((emp) => (
              <EmpreendimentoCard key={emp.id} empreendimento={emp} slug={slugMap[emp.id]} />
            ))
          ) : (
            <Card className="col-span-full rounded-2xl border-dashed border-slate-200 bg-white/70 p-10 text-center">
              <CardContent className="space-y-3 text-slate-500">
                <h3 className="text-lg font-semibold text-primary-900">Em breve novos destaques</h3>
                <p className="text-sm">
                  Estamos atualizando nossa vitrine de oportunidades. Enquanto isso, explore o portfólio completo logo abaixo.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <section className="bg-slate-950 py-16 text-white lg:py-24">
        <div className="container grid gap-12 lg:grid-cols-[minmax(0,1fr)_2fr] lg:items-center">
          <div className="space-y-5">
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-secondary">Experiência San Remo</span>
            <h2 className="text-3xl font-semibold">Uma jornada guiada pela confiança</h2>
            <p className="text-sm text-white/70">
              Mais do que apresentar imóveis, conectamos projetos a pessoas, traduzindo objetivos de vida em investimentos imobiliários estratégicos.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {BENEFITS.map((benefit) => (
              <Card key={benefit.title} className="h-full rounded-2xl border-white/10 bg-white/5 p-6 backdrop-blur">
                <CardHeader className="space-y-3 p-0">
                  <CardTitle className="text-xl font-semibold text-secondary">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-3 text-sm text-white/80">
                  {benefit.description}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-16 lg:py-24" id="portfolio">
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-[0.4em] text-secondary">Portfólio completo</span>
          <h2 className="text-3xl font-semibold text-primary-900">Encontre o imóvel ideal</h2>
          <p className="max-w-2xl text-base text-slate-500">
            Filtre por cidade, tipologia, status da obra e faixa de investimento. Todos os dados são atualizados em tempo real com nossa curadoria no Supabase.
          </p>
        </div>

        <div className="mt-12">
          <EmpreendimentoList
            empreendimentos={empreendimentos}
            slugMap={slugMap}
            initialFilters={initialFilterState}
            filterOptions={filterOptions}
            initialLimit={10}
          />
        </div>
      </section>

      <section className="container py-16 lg:py-24" style={{ marginTop: '-200px', position: 'relative', zIndex: 2 }}>
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[#193d6a] p-10 text-white shadow-2xl lg:p-14">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
            <div className="space-y-6">
              <span className="text-xs font-semibold uppercase tracking-[0.4em] text-secondary">Consultoria personalizada</span>
              <h2 className="text-3xl font-semibold">Vamos desenhar seu próximo investimento?</h2>
              <p className="max-w-xl text-base text-white/80">
                Briefing estratégico, análise financeira, visitas acompanhadas e suporte jurídico. Nosso time conduz todo o processo para que você realize um negócio seguro e personalizado.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  className="rounded-xl bg-secondary px-6 py-3 text-sm font-semibold text-primary-900 shadow-sm transition hover:bg-secondary/90"
                >
                  <Link href="https://wa.me/554888888888" target="_blank" rel="noopener noreferrer">
                    Conversar pelo WhatsApp
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-xl border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  <Link href="/contato">Agendar conversa</Link>
                </Button>
              </div>
            </div>

            <div className="space-y-4 text-sm text-white/80">
              <div className="rounded-2xl bg-white/10 p-5">
                <p className="font-semibold text-white">Jornada assistida</p>
                <p className="mt-1">
                  Do briefing inicial à assinatura do contrato, mantemos você informado com relatórios, visitas agendadas e comparativos exclusivos.
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-5">
                <p className="font-semibold text-white">Negociação estratégica</p>
                <p className="mt-1">
                  Acesso direto aos incorporadores, condições diferenciadas e suporte jurídico para garantir transparência e segurança.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 lg:py-24">
        <div className="container space-y-10">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-secondary">Insights San Remo</span>
            <h2 className="text-3xl font-semibold text-primary-900">Conteúdo para investir com segurança</h2>
            <p className="max-w-2xl text-base text-slate-500">
              Atualize-se com análises de mercado, guias práticos e tendências de alto padrão direto do time San Remo.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {ARTICLES.map((article) => (
              <Card key={article.title} className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-primary-900">{article.title}</CardTitle>
                  <CardDescription className="text-sm text-slate-500">{article.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="link" className="px-0 text-sm font-semibold text-primary">
                    <Link href={article.href}>Ler artigo →</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <WhatsappButton />

      <LeadModalClientWrapper />
      <DebugOpenModal />

      <section className="container py-16 lg:py-24">
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-primary-900 text-center mb-8">Imóveis por bairros e cidades</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from(new Set(empreendimentos.map(e => `${e.cidade}, ${e.estado}`))).map((cidadeTag) => {
              const empreendimentosCidade = empreendimentos.filter(e => `${e.cidade}, ${e.estado}` === cidadeTag);
              const primeiroEmpreendimento = empreendimentosCidade.find(e => e.imagem_capa);
              return (
                <Card key={cidadeTag} className="rounded-xl border border-slate-200 bg-white shadow-lg p-4 flex flex-col min-h-[240px] max-w-xs mx-auto">
                  {primeiroEmpreendimento && (
                    <div className="mb-4 rounded-md overflow-hidden aspect-[4/3] bg-slate-100 flex items-center justify-center" style={{ maxHeight: '72px', minHeight: '72px', height: '72px' }}>
                      <Image
                        src={primeiroEmpreendimento.imagem_capa || '/branding/ImagemCapa.jpg'}
                        alt={primeiroEmpreendimento.nome || 'Imagem do imóvel'}
                        width={72}
                        height={54}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                  <CardHeader className="p-0 mb-1">
                    <CardTitle className="text-sm font-semibold text-primary-900">{cidadeTag}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ul className="list-disc ml-4 text-sm text-slate-700">
                      {empreendimentosCidade.filter(e => e.bairro).map((e) => (
                        <li key={e.id}>
                          <Link
                            href={`/empreendimentos?cidade=${encodeURIComponent(e.cidade)}&bairro=${encodeURIComponent(e.bairro ?? '')}`}
                            className="text-primary font-semibold hover:underline"
                          >
                            Apartamentos no bairro {e.bairro}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

