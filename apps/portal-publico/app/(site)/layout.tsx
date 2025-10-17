import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/SiteFooter";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-white">{children}</main>
      <SiteFooter />
    </div>
  );
}
