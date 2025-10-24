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
  // Show the most recently added empreendimentos.
  // Prefer `created_at` when available, otherwise fall back to `updated_at`.
  function getEmpDate(emp: PublicEmpreendimento) {
    // created_at might not be present in the TypeScript type (DB may have it).
    // Use a runtime check and fallback to updated_at.
    const raw = (emp as any).created_at ?? emp.updated_at;
    const d = raw ? new Date(raw) : new Date(0);
    return d.getTime();
  }

  const sortedByDate = [...empreendimentos].sort((a, b) => getEmpDate(b) - getEmpDate(a));

  const display = sortedByDate.slice(0, 3);

  return (
    <section className="container py-12">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Eyebrow>Curadoria San Remo</Eyebrow>
            <SectionTitle>Últimos empreendimentos</SectionTitle>
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
