"use client"

import Link from "next/link"
import { type RouterOutputs } from "@/trpc/react"
import { format } from "date-fns"
import { CalendarDays, Phone } from "lucide-react"
import { formatPhoneNumberIntl } from "react-phone-number-input"

import { env } from "@/env"
import { calculateAge } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import CreatePaymentPlan from "./create-payment-plan"
import PreviewPaymentPlans from "./preview-payment-plans"

export default function PreviewPatient({
  patient,
  paymentPlans,
}: {
  patient: RouterOutputs["patient"]["getPatientById"]
  paymentPlans: RouterOutputs["paymentPlan"]["getPatientPaymentPlanById"]
}) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-background to-primary/10 p-8">
      <div className="absolute inset-0 bg-grid-white/10" />
      <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
        {/* Sol Taraf - Hasta Detayları */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-semibold text-primary">
                  {patient?.name?.split(" ")[0]?.charAt(0)}
                  {patient?.name?.split(" ")[1]?.charAt(0)}
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
              <span>{formatPhoneNumberIntl(patient?.phone ?? "")}</span>
            </div>
            <PreviewPaymentPlans paymentPlans={paymentPlans} />
          </div>
        </div>
        {/* Sağ Taraf - Aksiyonlar */}
        <div className="flex flex-col justify-between items-end">
          <CreatePaymentPlan
            patientId={patient?.id ?? ""}
            patientName={patient?.name ?? ""}
          />
          <div className="flex items-center">
            {patient?.doctors.map((doctor) => (
              <Link
                key={doctor.id}
                href={`/hekim/${doctor.user.username}`}
                className="flex items-center gap-2 hover:bg-muted-foreground/20 rounded-md p-2 px-4 transition-colors duration-300"
              >
                <Avatar className="ring ring-border">
                  <AvatarImage
                    src={`${env.NEXT_PUBLIC_MINIO_URL}${doctor.user.imagePath}`}
                  />
                  <AvatarFallback>
                    {doctor.user.name
                      ?.split(" ")
                      .map((name) => name.charAt(0))
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm">{doctor.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {doctor.specialty}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
