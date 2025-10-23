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
}

export function LeadForm({ empreendimentoId, empreendimentoNome }: LeadFormProps) {
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

  return (
    <Card className="overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-xl">
      <CardHeader className="flex items-center justify-center px-6 py-10 bg-transparent">
        <span className="sr-only">Quero saber mais</span>
        <Image src="/branding/san-remo-logo.png" alt="San Remo" width={160} height={160} className="object-contain" />
      </CardHeader>
      <CardContent className="space-y-5 px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
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
