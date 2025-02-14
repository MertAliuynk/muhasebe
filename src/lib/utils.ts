import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toSentenceCase(str: string) {
  return str
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase())
    .replace(/\s+/g, " ")
    .trim()
}

export function turkishToEnglish(text: string): string {
  const charMap: Record<string, string> = {
    ı: "i",
    ğ: "g",
    ü: "u",
    ş: "s",
    ö: "o",
    ç: "c",
    İ: "I",
    Ğ: "G",
    Ü: "U",
    Ş: "S",
    Ö: "O",
    Ç: "C",
  }

  return text.replace(/[ıİğĞüÜşŞöÖçÇ]/g, (char) => charMap[char] ?? char)
}

export function slugify(text: string): string {
  const slug = turkishToEnglish(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  if (slug.length === 0) return crypto.randomUUID()

  return slug
}

export function calculateAge(birthDate: Date | null) {
  if (!birthDate) return null
  const today = new Date()
  const age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    return age - 1
  }
  return age
}

export function formatCurrency(
  amount: number | string | null | undefined
): string {
  if (amount === null || amount === undefined) return "₺0,00"

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount))
}
