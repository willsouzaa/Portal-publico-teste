import React from 'react';
import SectionTitle from '@/components/typography/SectionTitle';
import Eyebrow from '@/components/typography/Eyebrow';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { PublicEmpreendimento } from '@/lib/types';
import Image from 'next/image';

type Props = {
  empreendimentos: PublicEmpreendimento[];
  slugMap?: Record<string, string>;
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

export default function MostSearched({ empreendimentos, slugMap }: Props) {
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

  // Ensure we have up to 3 items: start with wanted matches, then fill from the list
  const display: PublicEmpreendimento[] = [];
  const added = new Set<string>();

  for (const it of items) {
    if (!added.has(it.id)) {
      display.push(it);
      added.add(it.id);
      if (display.length >= 3) break;
    }
  }

  if (display.length < 3) {
    for (const emp of empreendimentos) {
      if (added.has(emp.id)) continue;
      display.push(emp);
      added.add(emp.id);
      if (display.length >= 3) break;
    }
  }

  return (
    <section className="container py-12">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Eyebrow>Curadoria San Remo</Eyebrow>
            <SectionTitle>Empreendimentos mais buscados</SectionTitle>
          </div>
        </div>

  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {display.map((emp) => {
              const img = getImages(emp)[0] ?? '/branding/ImagemCapa.jpg';
              const href = slugMap && slugMap[emp.id] ? `/${slugMap[emp.id]}` : `/empreendimentos/${emp.id}`;
              return (
                <Link key={emp.id} href={href} className="block bg-white rounded-lg overflow-hidden shadow-md h-full">
                  <div className="relative w-full h-40 md:h-48 bg-slate-100">
                    <Image src={img} alt={emp.nome} fill className="object-cover" sizes="(max-width:640px) 100vw, 25vw" />
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-sm font-semibold text-slate-800">{emp.nome}</div>
                  </div>
                </Link>
              );
            })}

            {/* CTA in the 4th slot — styled like the image cards */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md h-full flex flex-col justify-between p-6">
              <div>
                <div className="text-sm uppercase tracking-wider font-semibold text-slate-500">Quer mais opções</div>
                <h3 className="mt-2 text-lg font-bold text-slate-800">Ver todos os empreendimentos</h3>
                <p className="mt-3 text-sm text-slate-600">Explore o portfólio completo e encontre seu próximo investimento.</p>
              </div>
              <div className="mt-4">
                <Button asChild variant="accent" className="w-full rounded-xl py-3">
                  <Link href="/empreendimentos">Ver empreendimentos</Link>
                </Button>
              </div>
            </div>
          </div>
      </div>
    </section>
  );
}
