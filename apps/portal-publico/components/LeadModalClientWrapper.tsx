"use client";
import { useEffect, useState } from "react";
import { LeadCaptureModal } from "@/components/LeadCaptureModal";

export default function LeadModalClientWrapper() {
  // Wrapper mounts the modal. Add a small dev-only button to force-open the modal
  // when running on localhost or when NEXT_PUBLIC_DEBUG_OPEN_MODAL === '1'.
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    try {
      const host = typeof window !== 'undefined' ? window.location.hostname : '';
      const debugEnv = process.env.NEXT_PUBLIC_DEBUG_OPEN_MODAL === '1';
      if (host === 'localhost' || host === '127.0.0.1' || debugEnv) setShowDebug(true);
    } catch (err) {
      // ignore
    }
  }, []);

  return (
    <>
      <LeadCaptureModal />
      {showDebug && (
        <button
          onClick={() => {
            try {
              (window as any).__openLeadModal?.({ force: true });
            } catch (err) {}
          }}
          title="Abrir modal de leads (dev)"
          className="fixed z-[99999] right-4 bottom-4 bg-primary-600 text-white px-3 py-2 rounded-lg text-sm shadow-lg"
        >
          Abrir modal (dev)
        </button>
      )}
    </>
  );
}
