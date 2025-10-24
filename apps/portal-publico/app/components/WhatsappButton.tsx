"use client";

import React from "react";

export default function WhatsappButton() {
  return (
    <a
      href="https://wa.me/554888888888?text=Ol%C3%A1!%20Quero%20mais%20informa%C3%A7%C3%B5es%20sobre%20im%C3%B3veis%20San%20Remo."
      target="_blank"
      rel="noopener noreferrer"
  className="fixed z-50 bottom-6 right-6 w-16 h-16 rounded-full hover:bg-[#20b64d] shadow-lg flex items-center justify-center text-white transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-green-300 border-2 border-white"
  style={{ boxShadow: '0 4px 16px 0 rgba(34,197,94,0.25)', backgroundColor: '#25D366' }}
      aria-label="Conversar no WhatsApp"
      onClick={() => {
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag('event', 'whatsapp_click', { event_category: 'lead', event_label: 'whatsapp_fixo' });
        }
        console.log('Lead clicou no WhatsApp!');
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffffff" className="w-8 h-8">
        <path d="M20.52 3.48A11.94 11.94 0 0012 0C5.37 0 0 5.37 0 12c0 2.12.55 4.13 1.6 5.93L0 24l6.18-1.62A11.94 11.94 0 0012 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.85 0-3.63-.5-5.18-1.44l-.37-.22-3.67.96.98-3.58-.24-.37A9.94 9.94 0 012 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.2-7.8c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.12-.12.28-.32.42-.48.14-.16.18-.28.28-.46.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.34-.01-.52-.01-.18 0-.48.07-.73.34-.25.27-.97.95-.97 2.3 0 1.35.99 2.65 1.13 2.83.14.18 1.95 2.98 4.74 4.06.66.28 1.18.45 1.58.58.66.21 1.26.18 1.73.11.53.08 1.65-.67 1.89-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.18-.53-.32z" />
      </svg>
      <span className="sr-only">Conversar no WhatsApp</span>
    </a>
  );
}
