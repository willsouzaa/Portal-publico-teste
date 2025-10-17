"use client";

import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FormState = { nome: string; contato: string; tipo: "whatsapp" | "email" };

const STORAGE_KEY = "lead_modal_last_shown";
const HIDE_AFTER_SUBMIT = "lead_modal_submitted";

export function LeadCaptureModal() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>({ nome: "", contato: "", tipo: "whatsapp" });
  const shownRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [debug, setDebug] = useState({ lastShown: null as string | null, submitted: null as string | null });

  // Não mostrar se já submeteu
  useEffect(() => {
    console.log("[LeadModal] mounted");
    setMounted(true);
    // populate debug from localStorage
    try {
      setDebug({ lastShown: localStorage.getItem(STORAGE_KEY), submitted: localStorage.getItem(HIDE_AFTER_SUBMIT) });
    } catch (err) {
      // ignore
    }

    // helper para abrir manualmente via console: window.__openLeadModal()
    try {
      (window as any).__openLeadModal = () => {
        console.log("[LeadModal] __openLeadModal called");
        shownRef.current = true;
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
        try { setDebug({ lastShown: localStorage.getItem(STORAGE_KEY), submitted: localStorage.getItem(HIDE_AFTER_SUBMIT) }); } catch {}
        setOpen(true);
      };
    } catch (err) {
      // ignore (SSR safety)
    }

    if (localStorage.getItem(HIDE_AFTER_SUBMIT)) {
      console.log('[LeadModal] suppressed: already submitted (localStorage)');
      return;
    }
    const last = localStorage.getItem(STORAGE_KEY);
    if (last) {
      const t = Number(last);
      // não mostrar se exibido nas últimas 24h
      if (!isNaN(t) && Date.now() - t < 1000 * 60 * 60 * 24) {
        console.log('[LeadModal] suppressed: shown within 24h');
        return;
      }
    }

    // Delay automático
    const timer = setTimeout(() => {
      if (!shownRef.current) {
        console.log('[LeadModal] trigger: delay');
        openModal("delay");
        try { setDebug({ lastShown: localStorage.getItem(STORAGE_KEY), submitted: localStorage.getItem(HIDE_AFTER_SUBMIT) }); } catch {}
      }
    }, 7000); // 7s

    // Scroll 60%
    const onScroll = () => {
      const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (pct >= 60 && !shownRef.current) {
        console.log('[LeadModal] trigger: scroll >= 60%');
        openModal("scroll");
        try { setDebug({ lastShown: localStorage.getItem(STORAGE_KEY), submitted: localStorage.getItem(HIDE_AFTER_SUBMIT) }); } catch {}
      }
    };
    window.addEventListener("scroll", onScroll);

    // Exit intent (mouse to top)
    const onMouseMove = (e: MouseEvent) => {
      if (e.clientY < 10 && !shownRef.current) {
        console.log('[LeadModal] trigger: exit intent (mouse to top)');
        openModal("exit");
        try { setDebug({ lastShown: localStorage.getItem(STORAGE_KEY), submitted: localStorage.getItem(HIDE_AFTER_SUBMIT) }); } catch {}
      }
    };
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  function openModal(reason?: string) {
    shownRef.current = true;
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    try { setDebug({ lastShown: localStorage.getItem(STORAGE_KEY), submitted: localStorage.getItem(HIDE_AFTER_SUBMIT) }); } catch {}
    setOpen(true);
    // opcional: track event
    // console.log("Lead modal opened:", reason);
  }

  function closeModal() {
    setOpen(false);
  }

  async function saveLead(payload: FormState) {
    try {
      const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
      const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !anon) throw new Error("Supabase public env missing");

      // Escreve na tabela `leads` via REST (public anon key)
      await fetch(`${url}/rest/v1/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: anon,
          Authorization: `Bearer ${anon}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          nome: payload.nome,
          contato: payload.contato,
          canal: payload.tipo,
          created_at: new Date().toISOString(),
        }),
      });
      // Marcar para não mostrar de novo
      localStorage.setItem(HIDE_AFTER_SUBMIT, "1");
      try { setDebug({ lastShown: localStorage.getItem(STORAGE_KEY), submitted: localStorage.getItem(HIDE_AFTER_SUBMIT) }); } catch {}
    } catch (err) {
      // Fail silently / log
      console.error("saveLead error:", err);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveLead(form);

    // Opcional: abrir WhatsApp se telefone fornecido e tipo whatsapp
    if (form.tipo === "whatsapp") {
      const phone = form.contato.replace(/\D/g, "");
      const text = encodeURIComponent(
        `Olá! Meu nome é ${form.nome}. Tenho interesse em informações sobre investimentos San Remo.`
      );
      // substitua o prefixo nacional se necessário
      window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
    }

    closeModal();
  };

  return (
    <Dialog open={open} onOpenChange={(v: boolean) => { if (!v) closeModal(); }}>
      <DialogContent className="max-w-md rounded-3xl bg-white/95 backdrop-blur-lg shadow-2xl border border-slate-200 animate-fadeIn">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary-900">
            Sua oportunidade em minutos
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Mais de <strong>1.000 investidores</strong> satisfeitos com San Remo.
            <br />Preencha rapidinho — te chamamos pelo WhatsApp em até 1 minuto.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <Input
            required
            placeholder="Seu nome"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />

          <div className="flex gap-2">
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value as any })}
              className="rounded-full border px-3 py-2 bg-white"
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="email">E‑mail</option>
            </select>

            <Input
              required
              placeholder={form.tipo === "whatsapp" ? "WhatsApp (ex: 5548...)" : "Email"}
              value={form.contato}
              onChange={(e) => setForm({ ...form, contato: e.target.value })}
            />
          </div>

          <Button
            type="submit"
            className="w-full rounded-full bg-[#F54F0D] hover:bg-[#d7470c] text-white font-semibold py-3 transition"
          >
            Quero meu atendimento personalizado
          </Button>
        </form>

        <p className="mt-3 text-xs text-center text-slate-500">
          Garantimos sigilo. Contato apenas por consultores San Remo.
        </p>
      </DialogContent>
        {/* Debug overlay (visible in dev) */}
        {mounted && (
          <div className="fixed left-4 bottom-4 z-[9999] bg-white/95 border rounded-md p-2 text-xs shadow-lg">
            <div className="font-medium">LeadModal debug</div>
            <div>mounted: {String(mounted)}</div>
            <div>open: {String(open)}</div>
            <div>shownRef: {String(shownRef.current)}</div>
            <div>lastShown: {debug.lastShown ?? "-"}</div>
            <div>submitted: {debug.submitted ?? "-"}</div>
            <div className="mt-1 flex gap-1">
              <button
                onClick={() => {
                  try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(HIDE_AFTER_SUBMIT); setDebug({ lastShown: null, submitted: null }); shownRef.current = false; setOpen(false); }
                  catch {}
                }}
                className="px-2 py-1 bg-slate-100 rounded"
              >
                Clear LS
              </button>
              <button
                onClick={() => {
                  try { (window as any).__openLeadModal?.(); }
                  catch {}
                }}
                className="px-2 py-1 bg-slate-100 rounded"
              >
                Force Open
              </button>
            </div>
          </div>
        )}
    </Dialog>
  );
}