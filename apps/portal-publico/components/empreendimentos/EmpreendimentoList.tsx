
"use client";
// Função utilitária para normalizar strings (remover acentos e caixa)
function normalize(str?: string | null): string {
  return (str || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Building2, Sparkles, TrendingUp } from "lucide-react";

import {
  EmpreendimentoFilters,
  type FilterOption,
  type FilterState
} from "@/components/empreendimentos/EmpreendimentoFilters";
import { EmpreendimentoCard } from "@/components/empreendimentos/EmpreendimentoCard";

interface Empreendimento {
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
}

interface EmpreendimentoListProps {
  empreendimentos: Empreendimento[];
  slugMap: Record<string, string>;
  initialFilters?: Partial<FilterState>;
  filterOptions?: {
    cidades?: FilterOption[];
    tipos?: FilterOption[];
    status?: FilterOption[];
  };
  showAll?: boolean;
  initialLimit?: number;
}

const DEFAULT_FILTERS: FilterState = {
  search: "",
  cidade: "",
  bairro: "",
  tipo: "",
  status: "",
  precoMin: "",
  precoMax: ""
};

export function EmpreendimentoList({ empreendimentos, slugMap, initialFilters, filterOptions, showAll = false, initialLimit = 10 }: EmpreendimentoListProps) {
  const initialFilterState = useMemo<FilterState>(
    () => ({
      ...DEFAULT_FILTERS,
      ...initialFilters
    }),
    [initialFilters]
  );

  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  // visibleCount controla quantos itens são exibidos no momento (infinite scroll)
  const [visibleCount, setVisibleCount] = useState<number>(initialLimit);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const filteredEmpreendimentos = useMemo(() => {
    return empreendimentos.filter((emp) => {
      if (filters.search) {
        const searchNorm = normalize(filters.search);
        const matchesSearch =
          normalize(emp.nome).includes(searchNorm) ||
          normalize(emp.cidade).includes(searchNorm) ||
          normalize(emp.bairro).includes(searchNorm) ||
          normalize(emp.destaque).includes(searchNorm);

        if (!matchesSearch) return false;
      }

      if (filters.cidade && emp.cidade !== filters.cidade) {
        return false;
      }

      if (filters.bairro && emp.bairro !== filters.bairro) {
        return false;
      }

      if (filters.tipo && emp.tipo !== filters.tipo) {
        return false;
      }

      if (filters.status) {
        if (filters.status === "planta") {
          // Considera como "na planta" tudo que NÃO é pronto para morar/entregue
          const prontoLabels = ["entregue", "pronto para morar", "pronto", "pronto morar"];
          if (
            typeof emp.status === "string" &&
            prontoLabels.some(label => (emp.status as string).toLowerCase().includes(label))
          ) {
            return false;
          }
        } else if (emp.status == null || emp.status !== filters.status) {
          return false;
        }
      }

      if (filters.precoMin || filters.precoMax) {
        const preco = typeof emp.preco_minimo === "number" ? emp.preco_minimo : Number(emp.preco_minimo);
        if (filters.precoMin && preco < Number(filters.precoMin)) return false;
        if (filters.precoMax && preco > Number(filters.precoMax)) return false;
      }

      return true;
    });
  }, [empreendimentos, filters]);

  // Quando os filtros ou a lista base mudam, resetamos a contagem visível
  useEffect(() => {
    setVisibleCount(initialLimit);
  }, [initialLimit, filters, empreendimentos]);

  // IntersectionObserver para carregar mais empreendimentos quando o sentinel entra em view
  useEffect(() => {
    if (showAll) return; // nada a fazer quando mostrando tudo
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 10, filteredEmpreendimentos.length));
        }
      });
    }, { root: null, rootMargin: "0px", threshold: 0.1 });

    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [filteredEmpreendimentos.length, showAll]);

  const stats = {
    total: empreendimentos.length,
    oportunidades: empreendimentos.filter((item) => item.is_oportunidade).length,
    lancamentos: empreendimentos.filter((item) => item.status === "lancamento").length
  };

  return (
    <div className="space-y-10">

      <EmpreendimentoFilters
        onFilterChange={setFilters}
        initialFilters={initialFilterState}
        options={filterOptions}
      />

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-slate-500">
          Mostrando <span className="font-semibold text-primary-900">{filteredEmpreendimentos.length}</span> de {" "}
          <span className="font-semibold text-primary-900">{empreendimentos.length}</span> empreendimentos
        </p>
        <p className="text-sm text-slate-400">
          Dados atualizados diretamente da curadoria San Remo.
        </p>
      </div>

      {filteredEmpreendimentos.length > 0 ? (
        <>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {filteredEmpreendimentos.slice(0, showAll ? filteredEmpreendimentos.length : visibleCount).map((emp) => (
              <EmpreendimentoCard key={emp.id} empreendimento={emp} slug={slugMap[emp.id]} />
            ))}
          </div>

          {/* Sentinel for infinite scroll */}
          {!showAll && filteredEmpreendimentos.length > visibleCount && (
            <div className="mt-6 flex flex-col items-center gap-3">
              <div ref={sentinelRef} aria-hidden="true" className="w-full h-2" />
              <button
                type="button"
                onClick={() => setVisibleCount((v) => Math.min(v + 10, filteredEmpreendimentos.length))}
                className="inline-flex items-center rounded-xl border border-primary/20 bg-primary/10 px-6 py-3 text-sm font-semibold text-primary hover:bg-primary/20"
              >
                Carregar mais
              </button>
              <p className="text-xs text-slate-400">Role para carregar automaticamente mais resultados</p>
            </div>
          )}
        </>
      ) : (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/70 p-12 text-center">
          <Building2 className="mb-4 h-12 w-12 text-slate-300" />
          <h3 className="text-lg font-semibold text-primary-900">Nenhum empreendimento encontrado</h3>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            Ajuste os filtros ou explore outras cidades para descobrir mais oportunidades selecionadas pela San Remo.
          </p>
        </div>
      )}
    </div>
  );
}