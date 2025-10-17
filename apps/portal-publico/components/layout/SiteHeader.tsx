"use client";

import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { fetchBairros } from "@/lib/supabase/fetchBairros";
import { buildCityLandingSegment } from "@/lib/urls";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const NAV_ITEMS = [
  { href: "/empreendimentos", label: "Apartamentos à venda" },
  { href: "/empreendimentos?status=planta", label: "Apartamentos na planta" },
  { href: "/blog", label: "Blog" }
];

export function SiteHeader() {
  // Ajuste: cidade e estado fixos para exemplo. Ideal: buscar dinamicamente ou via contexto.
  const cidade = "Florianópolis";
  const estado = "SC";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [bairros, setBairros] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchBairros().then((bairros) => {
      console.log('Bairros carregados:', bairros);
      setBairros(bairros);
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qs = search.trim() ? `?q=${encodeURIComponent(search.trim())}` : "";
    router.push(`/empreendimentos${qs}`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="relative">
  <div className="container flex h-20 items-center gap-6 relative z-10 justify-between">
          <Link href="/" className="flex items-center gap-3 text-left" aria-label="Ir para a página inicial">
            <span className="relative flex h-40 w-40 items-center justify-center overflow-hidden">
              <Image src="/branding/san-remo-logo.png" alt="San Remo" width={160} height={160} priority className="object-contain" />
            </span>
          </Link>
          <div className="flex items-center flex-1 gap-6">
            <form onSubmit={onSubmit} className="flex items-center gap-3 lg:flex">
              <div className="relative w-full">
                <Input
                  value={search}
                  onChange={(e) => setSearch((e.target as HTMLInputElement).value)}
                  placeholder="Onde você quer morar?"
                  aria-label="Onde você quer morar?"
                  className="h-10 rounded-xl border-primary/10 bg-white/95 text-sm placeholder:text-slate-400 pl-10 w-full"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <circle cx="11" cy="11" r="7"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </span>
              </div>
            </form>
            <nav className="hidden items-center gap-6 text-sm font-medium text-primary/80 lg:flex" aria-label="Menu principal">
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  className="transition hover:text-primary px-2 py-1 rounded flex items-center gap-1"
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                  onClick={() => setDropdownOpen((open) => !open)}
                >
                  Apartamentos à venda
                  <svg className={`ml-1 h-4 w-4 transition-transform ${dropdownOpen ? "rotate-180" : "rotate-0"}`} viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z"/></svg>
                </button>
                {dropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 rounded-xl bg-white shadow-lg border border-primary/10 z-50 animate-fade-in">
                    <ul className="py-2 max-h-64 overflow-auto">
                      {bairros.length === 0 ? (
                        <li className="px-4 py-2 text-sm text-primary">Nenhum bairro encontrado</li>
                      ) : (
                        bairros.map((bairro) => (
                          <li key={bairro}>
                            <Link
                              href={`/empreendimentos?bairro=${encodeURIComponent(bairro)}`}
                              className="block px-4 py-2 text-sm text-primary hover:bg-primary/5 focus:bg-primary/10 focus:outline-none"
                              tabIndex={0}
                              onClick={() => setDropdownOpen(false)}
                            >
                              {bairro}
                            </Link>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                )}
              </div>
              <Link
                href="/empreendimentos?status=planta"
                className="transition hover:text-primary"
              >
                Apartamentos na planta
              </Link>
              {NAV_ITEMS.filter(item => item.label !== "Apartamentos à venda" && item.label !== "Apartamentos na planta" && item.label !== "Sobre nós").map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="hidden lg:flex items-center">
            <Button asChild className="rounded-xl bg-secondary px-5 py-2 text-sm font-semibold text-primary-900 shadow-sm transition hover:bg-secondary/90 ml-8">
              <a href="https://lancamentos.sanremoimoveis.com.br/" target="_blank" rel="noopener noreferrer">Entrar</a>
            </Button>
          </div>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 text-primary lg:hidden"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Abrir menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="border-t border-primary/10 bg-white px-6 py-4 shadow-lg lg:hidden">
          <form onSubmit={onSubmit} className="mb-4">
            <Input
              value={search}
              onChange={(e) => setSearch((e.target as HTMLInputElement).value)}
              placeholder="Pesquisar empreendimentos..."
              className="w-full rounded-xl"
            />
          </form>
          <nav className="flex flex-col gap-3 text-sm font-medium text-primary/90" aria-label="Menu móvel">
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                className="transition hover:text-primary px-2 py-1 rounded flex items-center gap-1"
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
                onClick={() => setDropdownOpen((open) => !open)}
              >
                Apartamentos à venda
                <svg className={`ml-1 h-4 w-4 transition-transform ${dropdownOpen ? "rotate-180" : "rotate-0"}`} viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z"/></svg>
              </button>
              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-xl bg-white shadow-lg border border-primary/10 z-50 animate-fade-in">
                  <ul className="py-2 max-h-64 overflow-auto">
                    {bairros.length === 0 ? (
                      <li className="px-4 py-2 text-sm text-primary">Nenhum bairro encontrado</li>
                    ) : (
                      bairros.map((bairro) => (
                        <li key={bairro}>
                          <Link
                            href={`/empreendimentos?bairro=${encodeURIComponent(bairro)}`}
                            className="block px-4 py-2 text-sm text-primary hover:bg-primary/5 focus:bg-primary/10 focus:outline-none"
                            tabIndex={0}
                            onClick={() => {
                              setDropdownOpen(false);
                              setIsMenuOpen(false);
                            }}
                          >
                            {bairro}
                          </Link>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>
            <Link
              href="/empreendimentos?status=planta"
              className="rounded-xl px-3 py-2 hover:bg-primary/5"
              onClick={() => setIsMenuOpen(false)}
            >
              Apartamentos na planta
            </Link>
            {NAV_ITEMS.filter(item => item.label !== "Apartamentos à venda" && item.label !== "Apartamentos na planta" && item.label !== "Sobre nós").map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-2 hover:bg-primary/5"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Button asChild className="mt-2 rounded-xl bg-secondary text-sm font-semibold text-primary-900 shadow-sm hover:bg-secondary/90">
              <Link href="/entrar">Entrar</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
