"use client"

import { type RouterOutputs } from "@/trpc/react"
import { format } from "date-fns"
import { Banknote, CalendarDays, CreditCard, Phone, Wallet } from "lucide-react"
import { formatPhoneNumber } from "react-phone-number-input"

import { calculateAge, formatCurrencyWithSymbol } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
      <div className="relative flex items-center">
        <div className="container relative z-10">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="flex-1 space-y-6 text-center md:text-left">
              <div className="flex justify-between">
                <h2 className="text-4xl font-light tracking-tight">
                  {patient?.name}
                </h2>
                <CreatePaymentPlan patientId={patient?.id ?? ""} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <PreviewPaymentPlans paymentPlans={patient?.paymentPlan} />
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 cursor-default"
                >
                  <CalendarDays className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {patient?.birthDate &&
                      `${format(patient?.birthDate, "dd.MM.yyyy")} (${calculateAge(
                        patient.birthDate
                      )} yaşında)`}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 cursor-default"
                >
                  <Phone className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {formatPhoneNumber(patient?.phone ?? "")}
                  </span>
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-none hover:scale-105 transition-transform duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CreditCard className="size-4 text-primary" />
                      <span className="text-sm font-medium">
                        Toplam Ödenecek Tutar
                      </span>
                    </div>
                    <p className="text-2xl font-semibold mt-2">
                      {formatCurrencyWithSymbol(25000)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-none hover:scale-105 transition-transform duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Banknote className="size-4 text-green-500" />
                      <span className="text-sm font-medium">
                        Toplam Ödenen Tutar
                      </span>
                    </div>
                    <p className="text-2xl font-semibold mt-2">
                      {formatCurrencyWithSymbol(5000)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-none hover:scale-105 transition-transform duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Wallet className="size-4 text-destructive" />
                      <span className="text-sm font-medium">Kalan Tutar</span>
                    </div>
                    <p className="text-2xl font-semibold mt-2">
                      {formatCurrencyWithSymbol(20000)}
                    </p>
                  </CardContent>
                </Card>
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
