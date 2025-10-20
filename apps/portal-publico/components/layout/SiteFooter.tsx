import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";

const NAV_LINKS = {
  explorar: [
    { href: "/empreendimentos", label: "Empreendimentos" },
    { href: "/empreendimentos?status=lancamento", label: "Lançamentos" },
    { href: "/financiamento", label: "Financiamento imobiliário" },
    { href: "/blog", label: "Blog" }
  ],
  guias: [
    { href: "/guias/comprador", label: "Guia do comprador" },
    { href: "/guias/investidor", label: "Guia do investidor" },
    { href: "/sobre-nos", label: "Sobre nós" },
    { href: "/contato", label: "Contato" }
  ]
};

const SOCIAL_LINKS = [
  { href: "https://facebook.com", icon: Facebook, label: "Facebook" },
  { href: "https://instagram.com", icon: Instagram, label: "Instagram" },
  { href: "https://linkedin.com", icon: Linkedin, label: "LinkedIn" }
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "San Remo Serviços Imobiliários",
    "url": "https://www.sanremo.com.br",
    "logo": "https://www.sanremo.com.br/branding/san-remo-logo.png",
    "telephone": "+554830362513",
    "email": "contato@sanremo.com.br",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "R. Lauro Linhares, 589",
      "addressLocality": "Florianópolis",
      "addressRegion": "SC",
      "postalCode": "88036-000",
      "addressCountry": "BR"
    },
    "sameAs": ["https://www.facebook.com","https://www.instagram.com","https://www.linkedin.com"]
  };

  return (
    <footer role="contentinfo" className="mt-16 border-t border-primary/10 bg-gradient-to-br from-[#0f1f36] via-[#132c4b] to-[#1f3b5f] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />

      <div className="container grid gap-12 py-16 lg:grid-cols-4">
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold">San Remo Serviços Imobiliários</h3>
          <p className="text-sm text-white/80">
            Imóveis de alto padrão e soluções em investimento imobiliário. Atendimento personalizado para
            compra, venda e investimento em apartamentos e terrenos em Florianópolis e região.
          </p>
          <address className="not-italic text-sm text-white/70 space-y-1">
            <div className="flex items-center gap-3"><Phone className="h-4 w-4" /> <a href="tel:+554830362513" className="hover:underline">(48) 3036-2513</a></div>
            <div className="flex items-center gap-3"><Mail className="h-4 w-4" /> <a href="mailto:contato@sanremo.com.br" className="hover:underline">contato@sanremo.com.br</a></div>
            <div className="flex items-center gap-3"><MapPin className="h-4 w-4" /> R. Lauro Linhares, 589 — Florianópolis/SC</div>
          </address>
        </div>

        <nav aria-label="Links de explorar">
          <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-secondary">Explorar</h4>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            {NAV_LINKS.explorar.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-secondary" aria-label={link.label}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Guias e recursos">
          <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-secondary">Guias</h4>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            {NAV_LINKS.guias.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-secondary" aria-label={link.label}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-secondary">Fale com a San Remo</h4>
          <p className="text-sm text-white/70">
            Nosso time de consultores auxilia na seleção de imóveis ideais para moradia ou investimento — soluções com foco em resultado.
          </p>
          <Link
            href="https://wa.me/55488888888"
            className="inline-flex items-center justify-center rounded-xl bg-secondary px-5 py-3 text-sm font-semibold text-primary-900 shadow-sm transition hover:bg-secondary/90"
            aria-label="Conversar por WhatsApp - San Remo"
            rel="noopener noreferrer"
          >
            Conversar por WhatsApp
          </Link>
          <div className="flex items-center gap-3 mt-2">
            {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
              <a
                key={href}
                href={href}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-secondary hover:text-primary-900"
                aria-label={`San Remo no ${label}`}
                target="_blank"
                rel="noopener noreferrer nofollow"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-[#0b1627] py-6">
        <div className="container flex flex-col items-start justify-between gap-4 text-xs text-white/50 md:flex-row">
          <p>
            © {year} San Remo Serviços Imobiliários LTDA · CNPJ: 35.895.467/0001-21 · CRECI-SC 7220
          </p>
          <div className="flex gap-4">
            <Link href="/politica-de-privacidade" className="transition hover:text-secondary" aria-label="Política de Privacidade">
              Política de Privacidade
            </Link>
            <Link href="/termos-de-uso" className="transition hover:text-secondary" aria-label="Termos de Uso">
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
