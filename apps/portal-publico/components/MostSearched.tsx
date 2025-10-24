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

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
          {/* Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {items.slice(0, 4).map((emp) => (
              <article key={emp.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                <div className="relative w-full h-48 md:h-56 lg:h-48">
                  {getImages(emp)[0] ? (
                    <Image src={getImages(emp)[0]} alt={emp.nome} fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
                  ) : (
                    <Image src={'/branding/ImagemCapa.jpg'} alt={emp.nome} fill className="object-cover" />
                  )}
                </div>

                <div className="p-3 text-center">
                  <h4 className="text-base font-semibold text-slate-800">
                    {emp.nome}
                  </h4>
                </div>
              </article>
            ))}
          </div>

          {/* CTA card to the right on large screens */}
          <article className="bg-primary text-white rounded-lg shadow-lg flex flex-col justify-between p-6 h-full">
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
