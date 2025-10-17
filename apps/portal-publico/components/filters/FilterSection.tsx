"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { formatLabel } from "@/lib/utils";

export interface FilterSectionValues {
  status: string[];
  oportunidade: boolean;
  quartos: number;
  banheiros: number;
  suites: number;
  vagas: number;
  priceRange: [number, number];
  areaRange: [number, number];
  tipoApartamento: string[];
  tipoSacada: string[];
  cidade?: string;
  keywords?: string;
}

interface FilterSectionProps {
  initialValues?: Partial<FilterSectionValues>;
  statusOptions: Array<{ value: string; label: string }>;
  tipoApartamentoOptions?: string[];
  tipoSacadaOptions?: string[];
  cidadeOptions?: string[];
  maxQuartos?: number;
  maxBanheiros?: number;
  maxSuites?: number;
  maxVagas?: number;
  priceRangeLimit?: [number, number];
  areaRangeLimit?: [number, number];
  title?: string;
  applyLabel?: string;
  keywordsLabel?: string;
  keywordsPlaceholder?: string;
}

const DEFAULT_PRICE_LIMIT: [number, number] = [0, 5_000_000];
const DEFAULT_AREA_LIMIT: [number, number] = [0, 400];
const DEFAULT_COUNT_MAX = 7;

const mergeValues = (
  input?: Partial<FilterSectionValues>,
  priceLimit: [number, number] = DEFAULT_PRICE_LIMIT,
  areaLimit: [number, number] = DEFAULT_AREA_LIMIT
): FilterSectionValues => ({
  status: input?.status ?? [],
  oportunidade: input?.oportunidade ?? false,
  quartos: input?.quartos ?? 0,
  banheiros: input?.banheiros ?? 0,
  suites: input?.suites ?? 0,
  vagas: input?.vagas ?? 0,
  priceRange: input?.priceRange ?? priceLimit,
  areaRange: input?.areaRange ?? areaLimit,
  tipoApartamento: input?.tipoApartamento ?? [],
  tipoSacada: input?.tipoSacada ?? [],
  cidade: input?.cidade,
  keywords: input?.keywords ?? "",
});

const clampRange = (value: [number, number], limit: [number, number]) => {
  const [min, max] = value;
  const [limitMin, limitMax] = limit;
  const clampedMin = Math.max(limitMin, Math.min(min, limitMax));
  const clampedMax = Math.max(clampedMin, Math.min(max, limitMax));
  return [clampedMin, clampedMax] as [number, number];
};

const FilterSection: React.FC<FilterSectionProps> = ({
  initialValues,
  statusOptions,
  tipoApartamentoOptions = [],
  tipoSacadaOptions = [],
  cidadeOptions = [],
  maxQuartos = DEFAULT_COUNT_MAX,
  maxBanheiros = DEFAULT_COUNT_MAX,
  maxSuites = DEFAULT_COUNT_MAX,
  maxVagas = DEFAULT_COUNT_MAX,
  priceRangeLimit = DEFAULT_PRICE_LIMIT,
  areaRangeLimit = DEFAULT_AREA_LIMIT,
  title = "Filtrar resultados",
  applyLabel = "Ver empreendimentos",
  keywordsLabel,
  keywordsPlaceholder = "Buscar por termos específicos",
}) => {
  const defaults = useMemo(() => mergeValues(initialValues, priceRangeLimit, areaRangeLimit), [initialValues, priceRangeLimit, areaRangeLimit]);
  const [values, setValues] = useState<FilterSectionValues>(defaults);

  useEffect(() => {
    setValues(defaults);
  }, [defaults]);

  const updateStatus = (value: string, checked: boolean) => {
    setValues(prev => {
      const next = checked ? Array.from(new Set([...prev.status, value])) : prev.status.filter(s => s !== value);
      return { ...prev, status: next };
    });
  };

  const toggleArrayValue = (key: 'tipoApartamento' | 'tipoSacada', value: string, exclusive = false) => {
    setValues(prev => {
      const list = prev[key];
      const exists = list.includes(value);

      if (exclusive) {
        return {
          ...prev,
          [key]: exists ? [] : [value],
        } as FilterSectionValues;
      }

      return {
        ...prev,
        [key]: exists ? list.filter(item => item !== value) : [...list, value],
      } as FilterSectionValues;
    });
  };

  const handleApply = () => {
    const clampedPrice = clampRange(values.priceRange, priceRangeLimit);
    const clampedArea = clampRange(values.areaRange, areaRangeLimit);

    const params = new URLSearchParams();
    if (values.keywords && values.keywords.trim().length) params.set('q', values.keywords.trim());
    if (values.cidade) params.set('cidade', values.cidade);
    if (values.status && values.status.length) params.set('status', values.status[0]);
    if (Number.isFinite(clampedPrice[0]) && clampedPrice[0] > 0) params.set('precoMin', String(clampedPrice[0]));
    if (Number.isFinite(clampedPrice[1]) && clampedPrice[1] > 0) params.set('precoMax', String(clampedPrice[1]));

    const query = params.toString();
    const base = window.location.pathname;
    window.location.href = query ? `${base}?${query}` : base;
  };

  const handleClear = () => {
    const base = window.location.pathname;
    window.location.href = base;
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-white/70">Use os filtros para refinar os empreendimentos exibidos.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={handleClear} className="text-sm">Limpar</Button>
          <Button onClick={handleApply} className="bg-primary text-primary-foreground text-sm">{applyLabel}</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label className="text-sm font-semibold text-muted-foreground">O que você procura?</Label>
          <Input
            placeholder="Ex: vista para o mar, 3 suítes, rooftop"
            value={values.keywords ?? ''}
            onChange={(e) => setValues(prev => ({ ...prev, keywords: e.target.value }))}
            className="mt-2 h-12"
          />
        </div>

        <div>
          <Label className="text-sm font-semibold text-muted-foreground">Cidade</Label>
          <select
            value={values.cidade ?? ''}
            onChange={(e) => setValues(prev => ({ ...prev, cidade: e.target.value || undefined }))}
            className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-white/90 px-3 text-sm text-slate-900"
          >
            <option value="">Qualquer cidade</option>
            {cidadeOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <Label className="text-sm font-semibold text-muted-foreground">Status</Label>
          <div className="mt-2 space-y-2">
            {statusOptions.map(option => (
              <label key={option.value} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={values.status.includes(option.value)}
                  onCheckedChange={(checked: boolean | 'indeterminate' | null | undefined) => updateStatus(option.value, Boolean(checked))}
                />
                <span>{formatLabel(option.label ?? option.value)}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label className="text-sm font-semibold text-muted-foreground">Faixa de preço</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <span className="text-xs text-muted-foreground">Preço mínimo</span>
              <Input
                type="number"
                value={values.priceRange[0]}
                onChange={(e) => {
                  const val = Number(e.target.value || 0);
                  setValues(prev => ({ ...prev, priceRange: clampRange([val, prev.priceRange[1]], priceRangeLimit) }));
                }}
                className="mt-1 h-10 text-sm"
              />
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Preço máximo</span>
              <Input
                type="number"
                value={values.priceRange[1]}
                onChange={(e) => {
                  const val = Number(e.target.value || 0);
                  setValues(prev => ({ ...prev, priceRange: clampRange([prev.priceRange[0], val], priceRangeLimit) }));
                }}
                className="mt-1 h-10 text-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold text-muted-foreground">Área (m²)</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <span className="text-xs text-muted-foreground">Área mínima</span>
              <Input
                type="number"
                value={values.areaRange[0]}
                onChange={(e) => {
                  const val = Number(e.target.value || 0);
                  setValues(prev => ({ ...prev, areaRange: clampRange([val, prev.areaRange[1]], areaRangeLimit) }));
                }}
                className="mt-1 h-10 text-sm"
              />
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Área máxima</span>
              <Input
                type="number"
                value={values.areaRange[1]}
                onChange={(e) => {
                  const val = Number(e.target.value || 0);
                  setValues(prev => ({ ...prev, areaRange: clampRange([prev.areaRange[0], val], areaRangeLimit) }));
                }}
                className="mt-1 h-10 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;
