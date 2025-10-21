"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
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
const DRAFT_KEY = "lead_modal_draft";

export function LeadCaptureModal() {
  const [open, setOpen] = useState(false);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<FormState>({ nome: "", contato: "", tipo: "whatsapp" });
  const shownRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submittedOk, setSubmittedOk] = useState(false);
  const [debug, setDebug] = useState({ lastShown: null as string | null, submitted: null as string | null });
  const svgWrapperRef = useRef<HTMLDivElement | null>(null);
  const autosaveTimer = useRef<number | null>(null);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const draftTokenRef = useRef<string | null>(null);

  // Não mostrar se já submeteu
  useEffect(() => {
    console.log("[LeadModal] mounted");
    setMounted(true);
    try {
      // keep mounted flag; dev badge removed in compact mode
    } catch {}
    // populate debug from localStorage
    try {
      setDebug({ lastShown: localStorage.getItem(STORAGE_KEY), submitted: localStorage.getItem(HIDE_AFTER_SUBMIT) });
      // load draft if present
      const rawDraft = localStorage.getItem(DRAFT_KEY);
      if (rawDraft) {
        try {
          const parsed = JSON.parse(rawDraft) as FormState & { savedAt?: string };
          if ((parsed as any).draft_token) draftTokenRef.current = (parsed as any).draft_token;
          setForm((prev) => ({ nome: prev.nome || parsed.nome || "", contato: prev.contato || parsed.contato || "", tipo: parsed.tipo || prev.tipo }));
          if (parsed && (parsed.nome || parsed.contato)) {
            setDraftSavedAt(parsed.savedAt ? new Date(parsed.savedAt).toLocaleTimeString() : new Date().toLocaleTimeString());
          }
        } catch {}
      }
    } catch (err) {
      // ignore
    }

    // helper para abrir manualmente via console: window.__openLeadModal({ force: true })
    try {
      (window as any).__openLeadModal = (opts?: { force?: boolean }) => {
        try {
          if (!opts?.force && localStorage.getItem(HIDE_AFTER_SUBMIT)) {
            console.log('[LeadModal] __openLeadModal suppressed: already submitted');
            return;
          }
        } catch (err) {
          // ignore localStorage errors
        }

        console.log("[LeadModal] __openLeadModal called", opts);
        shownRef.current = true;
        try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch {}
        try { setDebug({ lastShown: localStorage.getItem(STORAGE_KEY), submitted: localStorage.getItem(HIDE_AFTER_SUBMIT) }); } catch {}
        setOpen(true);
      };
    } catch (err) {
      // ignore (SSR safety)
    }

    // Open via URL param ?openLeadModal=1 or ?leadModal=1. Also support
    // ?forceOpenLeadModal=1 (forces open even if previously submitted) and
    // ?openLeadModalDebug=1 which behaves the same. This allows QA to test
    // without clearing localStorage.
    let forcedOpenFromParam = false;
    try {
      const params = new URLSearchParams(window.location.search);
      forcedOpenFromParam = params.get("forceOpenLeadModal") === "1" || params.get("openLeadModalDebug") === "1";
      if (forcedOpenFromParam) {
        console.log('[LeadModal] trigger: force url param');
        try { (window as any).__openLeadModal?.({ force: true }); } catch {}
      } else if ((params.get("openLeadModal") === "1" || params.get("leadModal") === "1") && !(localStorage.getItem(HIDE_AFTER_SUBMIT))) {
        console.log('[LeadModal] trigger: url param');
        try { (window as any).__openLeadModal?.(); } catch {}
      }
    } catch (err) {
      // ignore
    }

    // Delegated click handler removed: debug/open buttons on the page no longer trigger modal.

    // In debug mode we may want to bypass suppression for QA/testing. Consider
    // build-time flag, runtime localhost, or the force URL param.
    let debugBypass = process.env.NEXT_PUBLIC_DEBUG_OPEN_MODAL === "1";
    try {
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1') debugBypass = true;
      if (forcedOpenFromParam) debugBypass = true;
    } catch (err) {
      // ignore
    }

    if (!debugBypass && localStorage.getItem(HIDE_AFTER_SUBMIT)) {
      console.log('[LeadModal] suppressed: already submitted (localStorage)');
      return;
    }
    const last = localStorage.getItem(STORAGE_KEY);
    if (last) {
      const t = Number(last);
      // não mostrar se exibido nas últimas 24h
      if (!isNaN(t) && Date.now() - t < 1000 * 60 * 60 * 24) {
        if (!debugBypass) {
          console.log('[LeadModal] suppressed: shown within 24h');
          return;
        }
        console.log('[LeadModal] debug bypass: ignoring 24h suppression');
      }
    }

    // Delay automático (fallback) - shows after 7s if nothing else opened it
    const timer = setTimeout(() => {
      if (!shownRef.current) {
        console.log('[LeadModal] trigger: delay');
        openModal("delay");
        try { setDebug({ lastShown: localStorage.getItem(STORAGE_KEY), submitted: localStorage.getItem(HIDE_AFTER_SUBMIT) }); } catch {}
      }
    }, 7000); // 7s

    // Open immediately on first visit (short delay) to ensure automatic opening without needing a click
    // This will not bypass the "submitted" suppression.
    const immediateTimer = setTimeout(() => {
      try {
        if (localStorage.getItem(HIDE_AFTER_SUBMIT)) return;
      } catch (err) {
        // ignore
      }
      if (!shownRef.current && !localStorage.getItem(STORAGE_KEY)) {
        console.log('[LeadModal] trigger: immediate (first visit)');
        openModal('immediate');
        try { setDebug({ lastShown: localStorage.getItem(STORAGE_KEY), submitted: localStorage.getItem(HIDE_AFTER_SUBMIT) }); } catch {}
      }
    }, 1500);

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

    // compact modal: no pointer parallax handlers

    return () => {
      clearTimeout(timer);
      clearTimeout(immediateTimer);
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  // Autosave draft to localStorage on form changes and optional server-side autosave (debounced)
  useEffect(() => {
    try {
      // don't save empty drafts
      if (!form.nome && !form.contato) return;
      const payload = { ...form, savedAt: new Date().toISOString() };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
      setDraftSavedAt(new Date().toLocaleTimeString());

      // Optional server autosave (debounced). Enable by setting NEXT_PUBLIC_AUTOSAVE_TO_SERVER === '1'
      const enableServer = process.env.NEXT_PUBLIC_AUTOSAVE_TO_SERVER === "1";
      if (enableServer) {
        // clear previous timer
        if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current as any);
        autosaveTimer.current = window.setTimeout(async () => {
          try {
            // POST to internal API which will persist draft server-side
            const res = await fetch('/api/leads/quick', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ nome: form.nome, contato: form.contato, canal: form.tipo, is_draft: true, draft_token: draftTokenRef.current })
            });
            if (res.ok) {
              const j = await res.json();
              // store returned draft id/token for subsequent updates
              if (j?.data?.id) {
                draftTokenRef.current = String(j.data.id);
                const raw = localStorage.getItem(DRAFT_KEY);
                const parsed = raw ? JSON.parse(raw) : {};
                parsed.draft_token = draftTokenRef.current;
                localStorage.setItem(DRAFT_KEY, JSON.stringify(parsed));
              }
            }
          } catch (err) {
            console.error('autosave draft failed', err);
          }
        }, 1500) as unknown as number;
      }
    } catch (err) {
      // ignore localStorage errors
    }

    return () => {
      if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current as any);
    };
  }, [form]);

  function openModal(reason?: string) {
    shownRef.current = true;
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    try { setDebug({ lastShown: localStorage.getItem(STORAGE_KEY), submitted: localStorage.getItem(HIDE_AFTER_SUBMIT) }); } catch {}
    setOpen(true);
    // opcional: track event
    // console.log("Lead modal opened:", reason);
    // focus first input after opening
    setTimeout(() => {
      try { firstInputRef.current?.focus(); } catch {}
    }, 100);
  }

  function closeModal() {
    setOpen(false);
  }

  async function saveLead(payload: FormState) {
    try {
      setLoading(true);

      // Use internal server endpoint to persist the lead. This avoids using
      // the Supabase anon key in the browser and centralizes validation.
      const res = await fetch('/api/leads/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: payload.nome,
          contato: payload.contato,
          canal: payload.tipo,
          is_draft: false,
          draft_token: draftTokenRef.current,
        }),
      });

      if (!res.ok) {
        // try to surface server error for debugging
        const text = await res.text().catch(() => null);
        console.error('Error saving lead (server):', res.status, text);
        setLoading(false);
        return;
      }

      const j = await res.json().catch(() => null);
      // store returned id/token if available
      if (j?.data?.id) {
        draftTokenRef.current = String(j.data.id);
        try {
          const raw = localStorage.getItem(DRAFT_KEY);
          const parsed = raw ? JSON.parse(raw) : {};
          parsed.draft_token = draftTokenRef.current;
          localStorage.setItem(DRAFT_KEY, JSON.stringify(parsed));
        } catch (err) {
          // ignore localStorage errors
        }
      }

      // Mark to not show again
      try { localStorage.setItem(HIDE_AFTER_SUBMIT, '1'); } catch {}
      try { setDebug({ lastShown: localStorage.getItem(STORAGE_KEY), submitted: localStorage.getItem(HIDE_AFTER_SUBMIT) }); } catch {}
      setSubmittedOk(true);
      setLoading(false);
    } catch (err) {
      setLoading(false);
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

    // keep modal open to show success state (saveLead sets submittedOk)
  };

  return (
    <Dialog open={open} onOpenChange={(v: boolean) => { if (!v) closeModal(); }}>
      <DialogContent className="w-full max-w-[640px] mx-auto max-h-[86vh] overflow-y-auto rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-slate-200 p-6">
        <motion.div initial={{ opacity: 0, y: 8, scale: 0.995 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.995 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }} className="flex flex-col">
          {/* Compact centered modal - logo above title, simplified layout */}
          <div className="flex items-center gap-3 mb-4">
            <img src="/branding/san-remo-logo.png" alt="San Remo" className="h-8 w-auto" />
            <h2 className="text-2xl font-extrabold text-primary-900">Atendimento personalizado</h2>
            <button onClick={closeModal} aria-label="Fechar" className="ml-auto text-slate-400 hover:text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {submittedOk ? (
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }} className="mt-2 rounded-xl bg-emerald-50 border border-emerald-100 p-6 text-center flex flex-col items-center gap-4">
              <div className="rounded-full bg-emerald-600 text-white w-16 h-16 flex items-center justify-center shadow">
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              </div>
              <h3 className="text-base font-semibold text-emerald-800">Recebemos sua mensagem</h3>
              <p className="text-sm text-emerald-700 max-w-xs">Em breve nosso consultor entrará em contato pelo canal escolhido.</p>
              <div className="mt-2">
                <button onClick={closeModal} className="px-4 py-2 rounded-full bg-emerald-600 text-white font-semibold shadow hover:brightness-105 transition">Fechar</button>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-2 grid grid-cols-1 gap-3">
              <Input
                ref={firstInputRef as any}
                required
                placeholder="Seu nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="py-2 border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded transition"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value as any })}
                  className="col-span-1 rounded border px-2 py-2 bg-white text-sm focus:ring-1 focus:ring-primary-500 transition"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">E‑mail</option>
                </select>

                <Input
                  required
                  placeholder={form.tipo === "whatsapp" ? "WhatsApp (ex: 5548...)" : "Email"}
                  value={form.contato}
                  onChange={(e) => setForm({ ...form, contato: e.target.value })}
                  className="sm:col-span-2 py-2 border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded transition"
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-[#FF7A3D] to-[#F54F0D] hover:from-[#ff914a] hover:to-[#d7470c] text-white font-bold py-2 text-sm shadow transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                )}
                <span>Quero meu atendimento personalizado</span>
              </Button>

              <div className="text-xs text-slate-500 text-center mt-1">Garantimos sigilo. Contato apenas por consultores San Remo.</div>
            </form>
          )}
        </motion.div>
      </DialogContent>
        {/* Debug overlay removed per request */}
    </Dialog>
  );
}