"use client"

import { type RouterOutputs } from "@/trpc/react"
import { format } from "date-fns"
import { Banknote, CalendarDays, CreditCard, Phone, Wallet } from "lucide-react"
import { formatPhoneNumber } from "react-phone-number-input"

import { calculateAge, formatCurrencyWithSymbol } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

import CreatePaymentPlan from "./create-payment-plan"
import Instalments from "./instalments"
import PreviewPaymentPlans from "./preview-payment-plans"

export default function PreviewPatient({
  patient,
}: {
  patient: NonNullable<RouterOutputs["patient"]["getPatientById"]>
}) {
  return (
    <div className="space-y-8">
      <div className="relative">
        {/* Üst Kısım - Hasta Bilgileri */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-background to-primary/10 p-8">
          <div className="absolute inset-0 bg-grid-white/10" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
            {/* Sol Taraf - Hasta Detayları */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-semibold text-primary">
                      {patient?.name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-green-500 border-2 border-background" />
                </div>
                <div>
                  <h2 className="text-3xl font-light">{patient?.name}</h2>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <CalendarDays className="size-3" />
                    {patient?.birthDate &&
                      `${format(patient?.birthDate, "dd.MM.yyyy")} (${calculateAge(
                        patient.birthDate
                      )} yaşında)`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="size-4 text-primary" />
                  <span>{formatPhoneNumber(patient?.phone ?? "")}</span>
                </div>
                <PreviewPaymentPlans paymentPlans={patient?.paymentPlan} />
              </div>
            </div>

            {/* Sağ Taraf - Aksiyonlar */}
            <div className="flex items-start gap-2">
              <CreatePaymentPlan patientId={patient?.id ?? ""} />
            </div>
          </div>
        </div>

        {/* Alt Kısım - Finansal Kartlar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="group relative overflow-hidden rounded-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 transition-transform duration-300 group-hover:scale-105" />
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Toplam Ödenecek</span>
                <CreditCard className="size-5 text-primary" />
              </div>
              <p className="mt-4 text-3xl font-semibold">
                {formatCurrencyWithSymbol(25000)}
              </p>
              <div className="mt-2 h-2 w-full rounded-full bg-primary/10">
                <div className="h-full w-[20%] rounded-full bg-primary transition-all duration-300" />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-500/10 transition-transform duration-300 group-hover:scale-105" />
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Toplam Ödenen</span>
                <Banknote className="size-5 text-green-500" />
              </div>
              <p className="mt-4 text-3xl font-semibold">
                {formatCurrencyWithSymbol(5000)}
              </p>
              <div className="mt-2 h-2 w-full rounded-full bg-green-500/10">
                <div className="h-full w-[80%] rounded-full bg-green-500 transition-all duration-300" />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-destructive/10 transition-transform duration-300 group-hover:scale-105" />
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Kalan Tutar</span>
                <Wallet className="size-5 text-destructive" />
              </div>
              <p className="mt-4 text-3xl font-semibold">
                {formatCurrencyWithSymbol(20000)}
              </p>
              <div className="mt-2 h-2 w-full rounded-full bg-destructive/10">
                <div className="h-full w-[60%] rounded-full bg-destructive transition-all duration-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <Instalments />
    </div>
  )
}
