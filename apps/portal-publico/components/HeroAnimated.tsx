"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HeroAnimated({
  heroStats,
  resultadosLabel,
  filteredEmpreendimentos,
  activeCity,
  activeState,
  filters,
  cidadeOptions,
  statusOptionsBase
}: any) {
  return (
    <section className="relative isolate overflow-hidden bg-slate-950 py-20 text-white lg:py-28">
      <div className="absolute inset-0">
        <Image
          src="/branding/ImagemCapa.jpg"
          alt="Ponte Hercílio Luz, Florianópolis"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          priority={true}
          className="z-0"
        />
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
          className="absolute bottom-8 left-8 pointer-events-none"
          aria-hidden="true"
        >
          <Image
            src="/branding/san-remo-logo.png"
            alt="San Remo Logo"
            width={160}
            height={160}
            className="opacity-90 object-contain drop-shadow-xl"
            priority={false}
          />
        </motion.div>
      </div>
      <div className="container relative flex justify-end items-center min-h-[340px] py-12 px-4">
        <motion.div
          className="space-y-8 max-w-2xl w-full text-right bg-black/40 rounded-2xl p-8 shadow-xl backdrop-blur-sm"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-secondary">
            Personal Shopper Imobiliário
          </span>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Viva o padrão San Remo no litoral catarinense
          </h1>
          <p className="max-w-2xl text-lg text-white/80">
            Descubra lançamentos, imóveis em obras e empreendimentos prontos para morar com a curadoria de um time que entende o luxo imobiliário catarinense.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
