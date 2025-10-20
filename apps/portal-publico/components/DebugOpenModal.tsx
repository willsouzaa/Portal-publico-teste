"use client";

import React from "react";

export default function DebugOpenModal() {
  return (
    <button
      // Use delegated attribute so the central handler opens the modal and prevents navigation
      data-open-lead
      onClick={(e) => {
        try {
          e.preventDefault();
        } catch {}
        try {
          (window as any).__openLeadModal?.({ force: true });
        } catch (err) {
          console.error('__openLeadModal not available', err);
        }
      }}
      className="fixed bottom-6 left-6 z-[9999] rounded-full bg-primary text-white px-3 py-2 shadow-lg"
      aria-label="Abrir modal de lead (debug)"
    >
      Abrir modal (debug)
    </button>
  );
}
