import Link from "next/link";
import { Building2, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full border-t bg-gradient-to-br from-primary via-primary-light to-secondary">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Branding */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-secondary" />
              <div>
                <h3 className="text-lg font-bold text-white">San Remo</h3>
                <p className="text-xs text-white/80">Excelência imobiliária</p>
              </div>
            </div>
            <p className="text-sm text-white/70">
              Líderes em desenvolvimento imobiliário com compromisso, qualidade e inovação.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Links Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-white/70 transition-colors hover:text-secondary">
                  Empreendimentos
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="text-sm text-white/70 transition-colors hover:text-secondary">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-sm text-white/70 transition-colors hover:text-secondary">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-secondary mt-0.5" />
                <span className="text-sm text-white/70">(11) 3456-7890</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-secondary mt-0.5" />
                <span className="text-sm text-white/70">contato@sanremo.com.br</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-secondary mt-0.5" />
                <span className="text-sm text-white/70">São Paulo, SP</span>
              </li>
            </ul>
          </div>

          {/* Informações Legais */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/termos" className="text-sm text-white/70 transition-colors hover:text-secondary">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="text-sm text-white/70 transition-colors hover:text-secondary">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-8 text-center">
          <p className="text-sm text-white/60">
            © {currentYear} San Remo. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
