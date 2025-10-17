import type { PublicEmpreendimento } from "../types";

export function slugifyValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

const DELIMITER = "--";

function buildCityStateSegment(empreendimento: Pick<PublicEmpreendimento, "cidade" | "estado"> & Partial<Pick<PublicEmpreendimento, "tipo" | "status" | "bairro">>) {
  const citySlug = slugifyValue(empreendimento.cidade);
  const stateSlug = slugifyValue(empreendimento.estado);

  // Qualifiers to improve SEO: prefer explicit phrases when status/tipo/bairro present
  const qualifiers: string[] = [];

  // Tipo (ex: 'apartamentos')
  const tipo = empreendimento.tipo ? slugifyValue(empreendimento.tipo) : "apartamentos";

  // Status-based qualifiers
  if (empreendimento.status) {
    const st = empreendimento.status.toLowerCase();
    if (st.includes("entreg")) qualifiers.push("prontos-para-morar");
    else if (st.includes("lanc")) qualifiers.push("em-lancamento");
    else if (st.includes("obra")) qualifiers.push("em-obra");
  }

  // Bairro can be used to create more specific landing pages when present
  if (empreendimento.bairro) {
    qualifiers.push(slugifyValue(empreendimento.bairro));
  }

  const qualifierSegment = qualifiers.length ? `-${qualifiers.join("-")}` : "-venda";

  return `${tipo}${qualifierSegment}-${citySlug}-${stateSlug}`;
}

// Exported helper to build landing segment from explicit params
export function buildCityLandingSegment(city: string, state: string, opts?: { tipo?: string; status?: string; bairro?: string }) {
  const fake = {
    cidade: city,
    estado: state,
    tipo: opts?.tipo,
    status: opts?.status,
    bairro: opts?.bairro
  } as Pick<PublicEmpreendimento, "cidade" | "estado"> & Partial<Pick<PublicEmpreendimento, "tipo" | "status" | "bairro">>;

  return buildCityStateSegment(fake);
}

export function normalizeStatus(value?: string): string | undefined {
  if (!value) return undefined;
  return value.trim().toLowerCase();
}

export function buildEmpreendimentoPath(
  empreendimento: Pick<PublicEmpreendimento, "id" | "nome" | "cidade" | "estado"> & { slug?: string | null }
): string {
  const slugSource = empreendimento.slug ?? empreendimento.nome;
  const safeSlug = slugifyValue(slugSource) || "empreendimento";
  const baseSegment = buildCityStateSegment(empreendimento);
  return `${baseSegment}/${safeSlug}${DELIMITER}${empreendimento.id}`;
}

export function parseEmpreendimentoParam(param: string): { id: string; slugFragment?: string } {
  const lastDelimiterIndex = param.lastIndexOf(DELIMITER);

  if (lastDelimiterIndex === -1) {
    return { id: param };
  }

  const slugFragment = param.slice(0, lastDelimiterIndex);
  const id = param.slice(lastDelimiterIndex + DELIMITER.length);

  return { id, slugFragment: slugFragment ? slugFragment.toLowerCase() : undefined };
}
