import React from 'react';
import SectionTitle from '@/components/typography/SectionTitle';
import Eyebrow from '@/components/typography/Eyebrow';
import { Button } from '@/components/ui/button';
import type { PublicEmpreendimento } from '@/lib/types';
import Image from 'next/image';

type Props = {
  empreendimentos: PublicEmpreendimento[];
};

function getImages(emp: PublicEmpreendimento) {
  const imgs: string[] = [];
  if (emp.imagem_capa) imgs.push(emp.imagem_capa);
  if (emp.galeria) {
    emp.galeria
      .sort((a, b) => a.ordem - b.ordem)
      .slice(0, 5 - imgs.length)
      .forEach((g) => imgs.push(g.url));
  }
  return imgs.slice(0, 5);
}

export default function MostSearched({ empreendimentos }: Props) {
  // names to pick (in order)
  const wanted = [
    'Fragata',
    'BOSC',
    'Nautic',
    'Acqua'
  ];

  const items = wanted
    .map((w) => empreendimentos.find((e) => e.nome.toLowerCase().includes(w.toLowerCase())))
    .filter(Boolean) as PublicEmpreendimento[];

  return (
    <section className="container py-12">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Eyebrow>Curadoria San Remo</Eyebrow>
            <SectionTitle>Empreendimentos mais buscados</SectionTitle>
          </div>
        </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {items.map((emp) => (
            <article key={emp.id} className="bg-white rounded-lg shadow-sm border overflow-hidden h-full flex flex-col">
              <div className="flex gap-1 h-36 p-3">
                {getImages(emp).map((src, i) => (
                  <div key={i} className="relative flex-1 overflow-hidden rounded-md bg-slate-100">
                    <Image src={src} alt={`${emp.nome} ${i + 1}`} fill className="object-cover" sizes="(max-width: 640px) 100px, 160px" />
                  </div>
                ))}
                {/* fill placeholders to keep layout */}
                {Array.from({ length: Math.max(0, 5 - getImages(emp).length) }).map((_, i) => (
                  <div key={`ph-${i}`} className="flex-1 rounded-md bg-slate-100" />
                ))}
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-sm text-slate-500">{emp.cidade} · {emp.estado}</div>
                  <div className="mt-1 text-lg font-semibold text-primary-900">{emp.nome}</div>
                  <div className="text-sm text-slate-700 mt-1">{emp.destaque ?? emp.descricao ?? ''}</div>
                </div>
              </div>
            </article>
          ))}

          {/* CTA card */}
          <article className="col-span-1 md:col-span-1 lg:col-span-1 bg-primary text-white rounded-lg shadow-lg flex flex-col justify-between p-6 h-full">
            <div>
              <div className="text-sm uppercase tracking-wider font-semibold">Lançamentos</div>
              <h3 className="mt-2 text-2xl font-bold">Confira todos os lançamentos imobiliários de Florianópolis</h3>
              <p className="mt-3 text-sm text-white/90">Radar de lançamentos com atualização semanal.</p>
            </div>
            <div className="mt-6">
              <Button className="bg-white text-primary hover:bg-white/90">Conhecer lançamentos</Button>
            </div>
          </article>
          </div>
      </div>
    </section>
  );
}
