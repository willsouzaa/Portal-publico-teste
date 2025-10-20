"use client";

import Image from "next/image";
import Link from "next/link";
import { Building2, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function Header() {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (open) {
      closeButtonRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Skip link for keyboard users */}
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white text-primary px-3 py-2 rounded">Pular para o conteúdo</a>

      <div className="container flex h-14 sm:h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="relative h-8 w-8 sm:h-10 sm:w-10 overflow-hidden rounded-lg bg-primary/10 p-1.5">
            <Image 
              src="/san-remo-logo.png" 
              alt="San Remo" 
              width={40} 
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-primary">San Remo</span>
            <span className="text-xs text-muted-foreground hidden sm:block">Portal Público</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6" aria-label="Navegação principal">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
          >
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Empreendimentos</span>
          </Link>
          <Link 
            href="/sobre" 
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
          >
            Sobre
          </Link>
          <Link 
            href="/contato" 
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400"
          >
            Contato
          </Link>
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link href="/contato" className="rounded-md bg-primary/90 px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400">
            Contato
          </Link>

          <button
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            onClick={() => setOpen((s) => !s)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground/90 hover:bg-muted/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-[60] flex ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setOpen(false)}
        />
        <aside className={`relative ml-auto w-[80%] max-w-xs bg-background p-6 shadow-xl transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`} aria-hidden={!open}>
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-8 w-8 overflow-hidden rounded bg-primary/10 p-1">
                <Image src="/san-remo-logo.png" alt="San Remo" width={32} height={32} className="object-contain" />
              </div>
              <span className="font-semibold">San Remo</span>
            </Link>
            <button ref={closeButtonRef} onClick={() => setOpen(false)} aria-label="Fechar menu" className="inline-flex h-9 w-9 items-center justify-center rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-4" aria-label="Menu móvel">
            <Link href="/" className="text-sm font-medium text-foreground/90">Empreendimentos</Link>
            <Link href="/sobre" className="text-sm font-medium text-foreground/90">Sobre</Link>
            <Link href="/contato" className="text-sm font-medium text-primary">Contato</Link>
          </nav>
        </aside>
      </div>
    </header>
  );
}
