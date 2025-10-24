"use client";

import { useState } from "react";
import Image from "next/image";
import { Mail, Phone, User, MessageSquare, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface LeadFormProps {
  empreendimentoId: string;
  empreendimentoNome: string;
  precoInicial?: string | number | null;
}

export function LeadForm({ empreendimentoId, empreendimentoNome, precoInicial }: LeadFormProps) {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    mensagem: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          empreendimento_id: empreendimentoId,
          empreendimento_nome: empreendimentoNome,
          created_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar lead");
      }

      setSubmitStatus("success");
      setFormData({ nome: "", email: "", telefone: "", mensagem: "" });
      setTimeout(() => setSubmitStatus("idle"), 4000);
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper para formatar preço quando for número
  const formatCurrencyLocal = (value?: string | number | null) => {
    if (value === null || value === undefined || value === "") return null;
    const numeric = typeof value === "number" ? value : Number(String(value).replace(/[^0-9.-]+/g, ""));
    if (!Number.isFinite(numeric)) return String(value);
    // Ex.: R$ 364.000 -> want to show in short format like R$ 364 mil when >=1000 and divisible by 1000
    if (numeric >= 1000 && numeric % 1000 === 0) {
      const thousands = numeric / 1000;
      return `R$ ${thousands.toLocaleString('pt-BR')} mil`;
    }
    return numeric.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const displayPrice = formatCurrencyLocal(precoInicial);

  return (
    <Card className="overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-xl">
      <CardHeader className="px-6 py-6 bg-transparent">
        <div className="flex flex-col items-start gap-4">
          {displayPrice ? (
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-[0.12em] text-slate-500">A partir de</div>
              <div className="text-2xl font-extrabold text-slate-900">{displayPrice}</div>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <Image src="/branding/san-remo-logo.png" alt="San Remo" width={120} height={120} className="object-contain" />
            </div>
          )}

          <div className="mt-2 grid w-full gap-2">
            <button type="button" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Avise-me se o preço mudar</button>
            <button type="button" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Simular plano de pagamento</button>
            <a href="#lead" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f2f4e] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0b263f]">Agende sua visita</a>
          </div>

          <div className="mt-3 inline-flex items-center gap-3 rounded-full bg-[#25D366] px-3 py-1 text-white text-xs font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffffff" className="h-4 w-4">
              <path d="M20.52 3.48A11.94 11.94 0 0012 0C5.37 0 0 5.37 0 12c0 2.12.55 4.13 1.6 5.93L0 24l6.18-1.62A11.94 11.94 0 0012 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.85 0-3.63-.5-5.18-1.44l-.37-.22-3.67.96.98-3.58-.24-.37A9.94 9.94 0 012 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.2-7.8c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.12-.12.28-.32.42-.48.14-.16.18-.28.28-.46.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.34-.01-.52-.01-.18 0-.48.07-.73.34-.25.27-.97.95-.97 2.3 0 1.35.99 2.65 1.13 2.83.14.18 1.95 2.98 4.74 4.06.66.28 1.18.45 1.58.58.66.21 1.26.18 1.73.11.53.08 1.65-.67 1.89-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.18-.53-.32z" />
            </svg>
            receber contato em até três minutos
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 px-6 py-6">
        <form id="lead" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="nome" className="flex items-center gap-2 text-sm font-semibold text-primary-900">
              <User className="h-4 w-4" /> Nome completo
            </label>
            <Input
              id="nome"
              type="text"
              placeholder="Seu nome"
              value={formData.nome}
              onChange={(event) => setFormData({ ...formData, nome: event.target.value })}
              required
              disabled={isSubmitting}
              className="h-12 rounded-xl border-slate-200"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-primary-900">
              <Mail className="h-4 w-4" /> E-mail
            </label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(event) => setFormData({ ...formData, email: event.target.value })}
              required
              disabled={isSubmitting}
              className="h-12 rounded-xl border-slate-200"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="telefone" className="flex items-center gap-2 text-sm font-semibold text-primary-900">
              <Phone className="h-4 w-4" /> Telefone
            </label>
            <Input
              id="telefone"
              type="tel"
              placeholder="(48) 99999-9999"
              value={formData.telefone}
              onChange={(event) => setFormData({ ...formData, telefone: event.target.value })}
              required
              disabled={isSubmitting}
              className="h-12 rounded-xl border-slate-200"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="mensagem" className="flex items-center gap-2 text-sm font-semibold text-primary-900">
              <MessageSquare className="h-4 w-4" /> Mensagem (opcional)
            </label>
            <textarea
              id="mensagem"
              rows={4}
              className="flex min-h-[96px] w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-600 shadow-sm focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Conte-nos o que você procura..."
              value={formData.mensagem}
              onChange={(event) => setFormData({ ...formData, mensagem: event.target.value })}
              disabled={isSubmitting}
            />
          </div>

          <Button
            type="submit"
            variant="accent"
            className="h-12 w-full rounded-xl shadow-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              "Enviando..."
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" /> Enviar mensagem
              </>
            )}
          </Button>

          {submitStatus === "success" && (
            <p className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              ✓ Mensagem enviada com sucesso! Em breve entraremos em contato.
            </p>
          )}

          {submitStatus === "error" && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              ✗ Ocorreu um erro. Tente novamente mais tarde.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
