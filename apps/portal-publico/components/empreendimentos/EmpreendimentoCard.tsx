import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Sparkles, Building2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmpreendimentoCardProps {
  empreendimento: {
    id: string;
    nome: string;
    cidade: string;
    estado: string;
    bairro?: string | null;
    tipo?: string | null;
    status?: string | null;
    destaque?: string | null;
    is_oportunidade?: boolean | null;
    preco_minimo?: string | number | null;
    data_entrega_prevista?: string | null;
    imagem_capa?: string | null;
    updated_at?: string | null;
  };
  slug: string;
}

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

export function EmpreendimentoCard({ empreendimento, slug }: EmpreendimentoCardProps) {
  const price = formatCurrency(empreendimento.preco_minimo);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const detalhesHref = siteUrl ? `${siteUrl}/empreendimentos/${slug}` : `/empreendimentos/${slug}`;

  return (
    <Card className="group flex h-full flex-col overflow-hidden border border-primary/10 bg-white shadow-lg transition hover:-translate-y-1 hover:border-secondary/40 hover:shadow-2xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {empreendimento.imagem_capa ? (
          <Image
            src={empreendimento.imagem_capa}
            alt={empreendimento.nome}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Building2 className="h-12 w-12 text-slate-300" />
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {empreendimento.is_oportunidade && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs font-medium text-primary-900 shadow">
              <Sparkles className="h-3 w-3" />
              Oportunidade
            </span>
          )}
          {empreendimento.status && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-xs font-semibold text-white shadow">
              {formatStatus(empreendimento.status)}
            </span>
          )}
        </div>

        {price && (
          <div className="absolute bottom-3 right-3 rounded-lg bg-white/95 px-3 py-2 shadow backdrop-blur-sm">
            <p className="text-xs text-slate-500">A partir de</p>
            <p className="text-sm font-semibold text-primary">{price}</p>
          </div>
        )}
      </div>

      <CardHeader>
        <CardTitle className="line-clamp-1 text-xl font-semibold text-primary-900 transition group-hover:text-primary">
          {empreendimento.nome}
        </CardTitle>
        {empreendimento.destaque && (
          <CardDescription className="line-clamp-2 text-slate-600">
            {empreendimento.destaque}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start gap-2 text-sm text-slate-500">
          <MapPin className="mt-0.5 h-4 w-4" />
          <span className="line-clamp-1">
            {empreendimento.bairro ? `${empreendimento.bairro}, ` : ""}
            {empreendimento.cidade}/{empreendimento.estado}
          </span>
        </div>

        {empreendimento.data_entrega_prevista && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar className="h-4 w-4" />
            <span>
              Entrega: {new Date(empreendimento.data_entrega_prevista).toLocaleDateString("pt-BR", {
                month: "short",
                year: "numeric"
              })}
            </span>
          </div>
        )}

        <div className="flex-1" />
        <Link href={detalhesHref} className="block" aria-label={`Ver detalhes do empreendimento ${empreendimento.nome}`}>
          <Button variant="accent" className="w-full rounded-xl py-5 text-base font-semibold shadow-sm">
            Ver Apartamento
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
