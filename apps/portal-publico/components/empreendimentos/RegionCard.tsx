import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

type Props = {
  city: string
  state?: string
  image?: string | null
  bairros: string[]
}

export default function RegionCard({ city, state, image, bairros }: Props) {
  const cidadeTag = state && state.length ? `${city}, ${state}` : city

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md ring-1 ring-slate-100 transition-transform hover:shadow-lg hover:-translate-y-1">
  <div className="relative w-full h-28 md:h-32 lg:h-36 bg-slate-100">
        {image ? (
          <Image src={image} alt={`Imóveis em ${cidadeTag}`} fill className="object-cover w-full h-full" sizes="(max-width:640px) 100vw, 33vw" />
        ) : (
          <Image src={'/branding/ImagemCapa.jpg'} alt={`Imóveis em ${cidadeTag}`} fill className="object-cover w-full h-full" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" aria-hidden />
        <h3 className="absolute left-4 bottom-4 text-xl md:text-2xl font-semibold text-white drop-shadow-lg">
          {cidadeTag}
        </h3>
      </div>

      <ul className="divide-y divide-slate-200 bg-white">
        {bairros.length === 0 ? (
          <li className="px-4 py-2 text-sm text-slate-600">Em breve novidades</li>
        ) : (
          bairros.map((bairro) => (
            <li key={`${city}-${bairro}`} className="px-4 py-2">
              <Link
                href={`/empreendimentos?cidade=${encodeURIComponent(String(city))}&bairro=${encodeURIComponent(String(bairro))}&tipo=venda`}
                className="text-sm text-slate-700 hover:underline block leading-tight"
              >
                Apartamentos à venda {bairro}
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
