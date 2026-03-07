import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 🌍 Helper de Formateo de Moneda (Personalizable)
export function formatPrice(price: number, locale = 'es-CO', currency = 'COP', digits = 0) {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(price || 0);
  } catch (e) {
    // Fallback en caso de error de locale
    return `$${(price || 0).toLocaleString()}`;
  }
}
