export function formatLabel(label: string) {
  if (!label) return "";
  return String(label).replace(/[-_]/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

export default { formatLabel };
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
