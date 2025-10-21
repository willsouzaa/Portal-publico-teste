"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FormState = { nome: string; contato: string; tipo: "whatsapp" | "email" };

const STORAGE_KEY = "lead_modal_last_shown";
const HIDE_AFTER_SUBMIT = "lead_modal_submitted";
const DRAFT_KEY = "lead_modal_draft";

export function LeadCaptureModal() {
  const [open, setOpen] = useState(false);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<FormState>({ nome: "", contato: "", tipo: "whatsapp" });
  const shownRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [submittedOk, setSubmittedOk] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!shownRef.current) {
        setOpen(true);
        shownRef.current = true;
      }
    }, 7000);
    return () => clearTimeout(timer);
  }, []);

  function closeModal() {
    setOpen(false);
  }

  async function saveLead(payload: FormState) {
    setLoading(true);
    await fetch('/api/leads/quick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    localStorage.setItem(HIDE_AFTER_SUBMIT, '1');
    setSubmittedOk(true);
    setLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveLead(form);
    if (form.tipo === "whatsapp") {
      const phone = form.contato.replace(/\D/g, "");
      const text = encodeURIComponent(`Olá! Meu nome é ${form.nome}. Tenho interesse em informações sobre investimentos San Remo.`);
      window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && closeModal()}>
      <DialogContent
        className="
          relative overflow-hidden rounded-3xl p-0 border-none max-w-[640px]
          bg-gradient-to-br from-[#FF7A3D] via-[#FF5400] to-[#FF2E00]
          text-white shadow-2xl"
      >
        {/* Fundo com brilho animado */}
        <div className="absolute inset-0 bg-[url('/textures/noise.svg')] opacity-10 pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, type: "spring" }}
          className="relative z-10 p-8 flex flex-col items-center text-center"
        >
          <img
            src="/branding/san-remo-logo.png"
            alt="San Remo"
            className="h-10 mb-4 animate-pulse drop-shadow-lg"
          />

          <h2 className="text-3xl font-extrabold tracking-tight mb-2">
            💎 Atendimento Exclusivo San Remo
          </h2>
          <p className="text-white/90 text-sm max-w-md mb-6 leading-relaxed">
            Preencha abaixo e garanta <strong>um contato direto com nosso consultor</strong> —
            descubra as oportunidades de investimento mais seguras e rentáveis do momento.
          </p>

          {submittedOk ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mt-4 text-center shadow-lg"
            >
              <div className="w-14 h-14 flex items-center justify-center bg-emerald-500 rounded-full mx-auto mb-3 shadow-md">
                <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              </div>
              <h3 className="text-lg font-semibold mb-1">Recebemos seus dados!</h3>
              <p className="text-sm text-white/90">Nosso consultor entrará em contato em breve. Fique atento ao seu {form.tipo === "whatsapp" ? "WhatsApp" : "E-mail"}.</p>
              <Button
                onClick={closeModal}
                className="mt-4 rounded-full px-5 py-2 bg-white text-[#FF4E00] font-semibold hover:brightness-105 transition-all shadow-md"
              >
                Fechar
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-3">
              <Input
                ref={firstInputRef as any}
                required
                placeholder="Seu nome completo"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="rounded-full bg-white text-gray-800 placeholder-gray-400 border-none shadow-md py-2 px-4 focus:ring-2 focus:ring-white"
              />

              <div className="flex gap-2">
                <select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value as any })}
                  className="rounded-full bg-white text-gray-700 text-sm font-medium shadow-md border-none px-3 py-2 focus:ring-2 focus:ring-white"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">E-mail</option>
                </select>
                <Input
                  required
                  placeholder={form.tipo === "whatsapp" ? "Ex: 5548999999999" : "Digite seu e-mail"}
                  value={form.contato}
                  onChange={(e) => setForm({ ...form, contato: e.target.value })}
                  className="flex-1 rounded-full bg-white text-gray-800 border-none shadow-md py-2 px-4 focus:ring-2 focus:ring-white"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-full bg-white text-[#FF4E00] font-extrabold text-base py-3 tracking-tight shadow-xl hover:brightness-105 hover:scale-[1.03] transition-transform flex items-center justify-center gap-2"
              >
                {loading ? (
                  <svg className="h-5 w-5 animate-spin text-[#FF4E00]" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                ) : (
                  <>
                    🚀 Quero meu atendimento agora
                  </>
                )}
              </Button>

              <p className="text-[11px] text-white/80 mt-2">
                🔒 Seus dados estão seguros. Prometemos não enviar spam.
              </p>
            </form>
          )}
        </motion.div>

        {/* Círculos de destaque no fundo */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#FF2E00]/30 rounded-full blur-3xl" />
      </DialogContent>
    </Dialog>
  );
}
