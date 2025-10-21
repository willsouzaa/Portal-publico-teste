"use client";

import { useState } from "react";
import { Home } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PublicTipologia } from "@/lib/types";

interface TipologiasInteractiveProps {
  tipologias: PublicTipologia[];
}

function formatCurrency(value?: string | number | null | undefined): string {
  if (!value) return "Consultar valor";
  
  const numericValue = typeof value === "string" ? parseFloat(value) : value;
  
  if (isNaN(numericValue)) return "Consultar valor";
  
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericValue);
}

export function TipologiasInteractive({ tipologias }: TipologiasInteractiveProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!tipologias || tipologias.length === 0) {
    return null;
  }

  const selectedTipo = tipologias[selectedIndex];

  return (
    <Card className="border border-[#0f2f4e]/10 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-[#0f2f4e]">
          Tipologias disponíveis
        </CardTitle>
        <CardDescription>
          Conheça as plantas e configurações pensadas para diferentes perfis de investidores.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-[1fr,2fr]">
          {/* Cards pequenos das tipologias */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {tipologias.map((tipo, index) => (
              <button
                key={tipo.id ?? index}
                onClick={() => setSelectedIndex(index)}
                className={`rounded-lg border-2 p-3 text-left transition-all ${
                  selectedIndex === index
                    ? 'border-[#e5a855] bg-[#e5a855]/5 shadow-md'
                    : 'border-slate-200 bg-white hover:border-[#e5a855]/50 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {tipo.imagem_capa ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={tipo.imagem_capa} alt={tipo.tipo || `Tipologia ${index + 1}`} className="h-6 w-6 rounded object-cover" />
                  ) : (
                    <Home className={`h-4 w-4 ${selectedIndex === index ? 'text-[#e5a855]' : 'text-slate-400'}`} />
                  )}
                  <h3 className={`text-sm font-semibold ${selectedIndex === index ? 'text-[#e5a855]' : 'text-[#0f2f4e]'}`}>
                    {tipo.tipo || `Tipologia ${index + 1}`}
                  </h3>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  {tipo.quartos && <div>{tipo.quartos} quartos</div>}
                  {tipo.area_privativa && <div>{tipo.area_privativa} m²</div>}
                  {tipo.preco && (
                    <div className="font-medium text-[#e5a855]">
                      {formatCurrency(tipo.preco)}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Painel de detalhes */}
          <div className="space-y-4">
            {/* Imagem da tipologia */}
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              {selectedTipo.imagem_capa ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selectedTipo.imagem_capa} alt={selectedTipo.tipo || 'tipologia'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <Home className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm">Planta da {selectedTipo.tipo || 'tipologia'}</p>
                    <p className="text-xs text-slate-400 mt-1">Imagem em breve</p>
                  </div>
                </div>
              )}
            </div>

            {/* Informações detalhadas */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h4 className="text-lg font-semibold text-[#0f2f4e] mb-3">
                {selectedTipo.tipo || `Tipologia ${selectedIndex + 1}`}
              </h4>
              
              <div className="grid gap-3 sm:grid-cols-2">
                {selectedTipo.quartos && (
                  <div className="flex justify-between py-2 border-b border-slate-200">
                    <span className="text-slate-600">Quartos</span>
                    <span className="font-medium text-[#0f2f4e]">{selectedTipo.quartos}</span>
                  </div>
                )}
                {selectedTipo.suites && (
                  <div className="flex justify-between py-2 border-b border-slate-200">
                    <span className="text-slate-600">Suítes</span>
                    <span className="font-medium text-[#0f2f4e]">{selectedTipo.suites}</span>
                  </div>
                )}
                {selectedTipo.banheiros && (
                  <div className="flex justify-between py-2 border-b border-slate-200">
                    <span className="text-slate-600">Banheiros</span>
                    <span className="font-medium text-[#0f2f4e]">{selectedTipo.banheiros}</span>
                  </div>
                )}
                {selectedTipo.vagas && (
                  <div className="flex justify-between py-2 border-b border-slate-200">
                    <span className="text-slate-600">Vagas</span>
                    <span className="font-medium text-[#0f2f4e]">{selectedTipo.vagas}</span>
                  </div>
                )}
                {selectedTipo.area_privativa && (
                  <div className="flex justify-between py-2 border-b border-slate-200">
                    <span className="text-slate-600">Área privativa</span>
                    <span className="font-medium text-[#0f2f4e]">{selectedTipo.area_privativa} m²</span>
                  </div>
                )}
                {selectedTipo.area_total && (
                  <div className="flex justify-between py-2 border-b border-slate-200">
                    <span className="text-slate-600">Área total</span>
                    <span className="font-medium text-[#0f2f4e]">{selectedTipo.area_total} m²</span>
                  </div>
                )}
              </div>

              {selectedTipo.preco && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-[#e5a855]/20">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Valor do investimento</span>
                    <span className="text-lg font-semibold text-[#e5a855]">
                      {formatCurrency(selectedTipo.preco)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}