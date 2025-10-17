import Image from "next/image";
import Link from "next/link";
import { Building2 } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-primary/10 p-1.5">
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

        <nav className="flex items-center gap-6" aria-label="Navegação principal">
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
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Contato
          </Link>
        </nav>
      </div>
    </header>
  );
}
