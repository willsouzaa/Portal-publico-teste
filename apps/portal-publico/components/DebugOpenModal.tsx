"use client";

import React from "react";

export default function DebugOpenModal() {
  return (
    <button
      onClick={() => {
        try {
          (window as any).__openLeadModal?.();
        } catch (err) {
          console.error("__openLeadModal not available", err);
        }
      }}
      className="fixed bottom-6 left-6 z-[9999] rounded-full bg-primary text-white px-3 py-2 shadow-lg"
    >
      Abrir modal (debug)
    </button>
  );
}
