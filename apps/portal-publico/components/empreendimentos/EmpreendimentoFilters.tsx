"use client";

import { useMemo, useState } from "react";
import { Search, Filter, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export interface FilterState {
  search: string;
  cidade: string;
  bairro: string;
  tipo: string;
  status: string;
  precoMin: string;
  precoMax: string;
}

export type FilterOption = {
  label: string;
  value: string;
};

type FilterOptions = {
  cidades: FilterOption[];
  tipos: FilterOption[];
  status: FilterOption[];
};

interface FiltersProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
  options?: Partial<FilterOptions>;
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

const DEFAULT_OPTIONS: FilterOptions = {
  cidades: [{ label: "Todas", value: "" }],
  tipos: [{ label: "Todos", value: "" }],
  status: [{ label: "Todos", value: "" }]
};

function mergeOptions(defaultOptions: FilterOption[], customOptions?: FilterOption[]) {
  if (!customOptions?.length) {
    return defaultOptions;
  }

  const seen = new Set<string>();
  const merged: FilterOption[] = [];

  [...defaultOptions, ...customOptions].forEach((option) => {
    if (seen.has(option.value)) {
      return;
    }

    seen.add(option.value);
    merged.push(option);
  });

  return merged;
}

export function EmpreendimentoFilters({ onFilterChange, initialFilters, options }: FiltersProps) {
  const resolvedOptions = useMemo(
    () => ({
      cidades: mergeOptions(DEFAULT_OPTIONS.cidades, options?.cidades),
      tipos: mergeOptions(DEFAULT_OPTIONS.tipos, options?.tipos),
      status: mergeOptions(DEFAULT_OPTIONS.status, options?.status)
    }),
    [options]
  );

  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...DEFAULT_FILTERS,
    ...initialFilters
  }));

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const resetFilters = { ...DEFAULT_FILTERS };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const activeFiltersCount = (
    (filters.search ? 1 : 0) +
    (filters.cidade ? 1 : 0) +
    (filters.tipo ? 1 : 0) +
    (filters.status ? 1 : 0) +
    (filters.precoMin ? 1 : 0) +
    (filters.precoMax ? 1 : 0)
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar empreendimentos"
            value={filters.search}
            onChange={(event) => handleFilterChange("search", event.target.value)}
            className="h-12 rounded-xl border-slate-200 bg-white pl-10 text-sm focus-visible:ring-primary"
          />
        </div>
        <Button
          variant={isOpen ? "default" : "outline"}
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative h-12 rounded-xl border-primary/30 bg-white text-primary shadow-sm hover:border-primary hover:bg-primary/5"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-primary-900">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </div>

      {isOpen && (
        <Card className="space-y-4 rounded-2xl border border-primary/10 bg-white p-6 shadow-lg">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary-900">Cidade</label>
              <select
                value={filters.cidade}
                onChange={(event) => handleFilterChange("cidade", event.target.value)}
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary"
              >
                {resolvedOptions.cidades.map((cidade) => (
                  <option key={cidade.value || "todas"} value={cidade.value}>
                    {cidade.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary-900">Tipo</label>
              <select
                value={filters.tipo}
                onChange={(event) => handleFilterChange("tipo", event.target.value)}
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary"
              >
                {resolvedOptions.tipos.map((tipo) => (
                  <option key={tipo.value || "todos"} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary-900">Status</label>
              <select
                value={filters.status}
                onChange={(event) => handleFilterChange("status", event.target.value)}
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary"
              >
                {resolvedOptions.status.map((status) => (
                  <option key={status.value || "todos"} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary-900">Preço mínimo</label>
              <Input
                type="number"
                placeholder="R$ 0"
                value={filters.precoMin}
                onChange={(event) => handleFilterChange("precoMin", event.target.value)}
                className="h-11 rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary-900">Preço máximo</label>
              <Input
                type="number"
                placeholder="R$ 0"
                value={filters.precoMax}
                onChange={(event) => handleFilterChange("precoMax", event.target.value)}
                className="h-11 rounded-xl border-slate-200"
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="w-full rounded-xl text-sm font-semibold text-primary hover:bg-primary/5"
                disabled={activeFiltersCount === 0}
              >
                <X className="mr-2 h-4 w-4" />
                Limpar filtros
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
