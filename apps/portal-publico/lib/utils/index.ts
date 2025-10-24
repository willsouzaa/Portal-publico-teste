import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STATUS_OVERRIDES: Record<string, string> = {
  pre_lancamento: "Pré-lançamento",
  lancamento: "Lançamento",
  obra: "Em Obra",
  pronto_pra_morar: "Pronto Pra Morar",
  entregue: "Pronto para morar"
};

export function formatLabel(label?: string | null, overrides?: Record<string, string>): string {
  if (!label) return "";
  const map = { ...STATUS_OVERRIDES, ...(overrides ?? {}) };
  if (map[label]) return map[label];

  const parts = String(label).trim().replace(/[_-]+/g, " ").split(/\s+/);
  return parts
    .map((p) => {
      const lower = p.toLocaleLowerCase("pt-BR");
      return lower.charAt(0).toLocaleUpperCase("pt-BR") + lower.slice(1);
    })
    .join(" ");
}