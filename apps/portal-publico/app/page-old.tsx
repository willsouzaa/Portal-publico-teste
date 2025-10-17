import Link from "next/link";
import { ArrowRight, Calendar, MapPin, Sparkles } from "lucide-react";

import { buildDefaultMetadata } from "../lib/seo";
import { createSupabaseServerClient } from "../lib/supabase/server";
import type { PublicEmpreendimento } from "../lib/types";
import { buildEmpreendimentoPath } from "../lib/urls";

export const revalidate = 60;

export const metadata = buildDefaultMetadata({
  title: "San Remo | Empreendimentos",
  description: "Veja os empreendimentos aprovados e atualizados em tempo real."
});

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

function formatCurrency(value?: string | number | null): string | null {
  if (value === null || value === undefined || value === "") return null;
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return null;
  return numeric.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

async function fetchEmpreendimentos(): Promise<PublicEmpreendimento[]> {
  const supabase = createSupabaseServerClient({ schema: "public" });
  const { data, error } = await supabase
    .from("public_empreendimentos")
    .select(
      "id, nome, tipo, cidade, estado, bairro, destaque, descricao, status, data_entrega_prevista, is_oportunidade, preco_minimo, updated_at"
    )
    .order("updated_at", { ascending: false })
    .limit(24);

  if (error) {
    console.error("[portal-publico] erro ao buscar empreendimentos:", error);
    return [];
  }

  return data ?? [];
}

export default async function HomePage() {
  const empreendimentos = await fetchEmpreendimentos();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.sanremo.com.br";

  return (
    <div className="page-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: empreendimentos.map((item, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: `${siteUrl}/empreendimentos/${buildEmpreendimentoPath(item)}`,
              name: item.nome
            }))
          })
        }}
      />
      <section className="hero">
        <span className="hero__eyebrow">Empreendimentos San Remo</span>
        <h1 className="hero__title">
          Viver com excelência começa em um endereço San Remo
        </h1>
        <p className="hero__subtitle">
          Explore lançamentos e oportunidades exclusivas selecionadas pela nossa equipe. Cada empreendimento reflete o compromisso da San Remo com sofisticação, localização privilegiada e qualidade construtiva.
        </p>
      </section>

      <section className="grid-list">
        {empreendimentos.map((item) => (
          <article key={item.id} className="empreendimento-card">
            <div className="empreendimento-card__media">
              <div className="empreendimento-card__badge-group">
                <span className="badge badge--legal">
                  {item.tipo ?? "Empreendimento"}
                </span>
                <span className="badge badge--status">{formatStatus(item.status)}</span>
              </div>
              {item.is_oportunidade && (
                <span className="badge badge--opportunity">
                  <Sparkles size={14} />
                  Oportunidade
                </span>
              )}
              <div className="empreendimento-card__price">
                <small>A partir de</small>
                <span>{formatCurrency(item.preco_minimo) ?? "Consulte"}</span>
              </div>
              <div className="detail-gallery detail-gallery--empty">
                <span>{item.nome}</span>
              </div>
            </div>

            <div className="empreendimento-card__body">
              <div className="chip">{item.cidade} · {item.estado}</div>
              <h2 className="empreendimento-card__title">{item.nome}</h2>

              <div className="empreendimento-card__location">
                <MapPin size={16} />
                <span>
                  {item.bairro ? `${item.bairro}, ` : ""}
                  {item.cidade}/{item.estado}
                </span>
              </div>

              {item.destaque && (
                <p className="empreendimento-card__description">{item.destaque}</p>
              )}

              <div className="empreendimento-card__stats">
                <span>
                  <strong>Status:</strong> {formatStatus(item.status)}
                </span>
                {item.data_entrega_prevista && (
                  <span className="empreendimento-card__meta">
                    <Calendar size={16} />
                    Entrega: {new Date(item.data_entrega_prevista).toLocaleDateString("pt-BR")}
                  </span>
                )}
                {item.descricao && (
                  <span>
                    <strong>Descrição:</strong> {item.descricao.slice(0, 70)}{item.descricao.length > 70 ? "…" : ""}
                  </span>
                )}
              </div>

              <Link href={`/empreendimentos/${buildEmpreendimentoPath(item)}`} className="empreendimento-card__cta">
                Ver detalhes
                <ArrowRight size={18} />
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
