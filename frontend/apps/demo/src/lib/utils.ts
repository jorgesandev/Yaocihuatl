import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortHash(hash: string) {
  if (hash.length <= 16) {
    return hash;
  }

  return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("es-MX").format(value);
}
