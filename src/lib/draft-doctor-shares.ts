// Ödeme planı üzerinde taslak olarak saklanan hekim paylarını (draftDoctorShares)
// güvenli şekilde okur. Paylar, plan tutarının hangi kısmının hangi hekime ait
// olduğunu gösterir (örn. 125.000 → 75.000 + 50.000). Hekim hakedişi, bu tutar
// tahsil edildikçe hekimin komisyon oranına göre ayrıca hesaplanır.
export type DraftDoctorShare = { doctorId: string; amount: number }

export function parseDraftDoctorShares(value: unknown): DraftDoctorShare[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((item: unknown) => {
    if (typeof item !== "object" || item === null) return []
    const { doctorId, amount } = item as { doctorId?: unknown; amount?: unknown }
    if (typeof doctorId !== "string" || typeof amount !== "number") return []
    return [{ doctorId, amount }]
  })
}
