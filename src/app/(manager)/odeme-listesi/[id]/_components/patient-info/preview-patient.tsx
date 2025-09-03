"use client"

import Link from "next/link"
import { type RouterOutputs } from "@/trpc/react"
import { format } from "date-fns"
import { CalendarDays, MessageSquare, Phone } from "lucide-react"
import { formatPhoneNumberIntl } from "react-phone-number-input"

import { calculateAge, formatCurrency, getImageUrl } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import EditPatientDoctorsDialog from "@/components/edit-patient-doctors-dialog"

import CreatePaymentPlan from "../payment-plans/create-payment-plan"
import PreviewPaymentPlans from "../payment-plans/preview-payment-plans"
import PatientNotesDialog from "./patient-notes-dialog"
import SendSmsDialog from "./send-sms-dialog"

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
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h2 className="text-4xl font-light">{patient?.name}</h2>
              </div>
              <div className="flex items-center gap-5 text-muted-foreground text-sm">
                {patient?.birthDate && (
                  <div className="flex items-center gap-1">
                    <CalendarDays className="size-3 text-primary" />
                    {`${format(patient?.birthDate, "dd.MM.yyyy")} (${calculateAge(
                      patient.birthDate
                    )} yaşında)`}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Phone className="size-3 text-primary" />
                  <span>{formatPhoneNumberIntl(patient?.phone ?? "")}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <SendSmsDialog patient={patient}>
                <Button variant="outline" size="sm">
                  <MessageSquare className="size-4 text-muted-foreground mr-2" />
                  SMS Gönder
                </Button>
              </SendSmsDialog>
            </div>
            <PatientNotesDialog patient={patient} />
            <PreviewPaymentPlans paymentPlans={paymentPlans} />
          </div>
        </div>
        {/* Sağ Taraf - Aksiyonlar */}
        <div className="flex flex-col justify-between items-end">
          <CreatePaymentPlan
            patientId={patient?.id ?? ""}
            patientName={patient?.name ?? ""}
          />
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {patient.doctorShares && patient.doctorShares.length > 0
                ? patient.doctorShares.map(({ doctor, remainingAmount }) => (
                    <Link
                      key={doctor.id}
                      href={`/hekim/${doctor.id}`}
                      className="flex items-center gap-2 hover:bg-muted-foreground/20 rounded-md p-2 px-4 transition-colors duration-300"
                    >
                      <Avatar className="ring ring-border">
                        <AvatarImage src={getImageUrl(doctor.user.imagePath)} />
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
                        <p className="text-xs text-muted-foreground">
                          Kalan Tutar:{" "}
                          {remainingAmount
                            ? formatCurrency(remainingAmount)
                            : "Pay Belirtilmemiş"}
                        </p>
                      </div>
                    </Link>
                  ))
                : patient.doctors && patient.doctors.length > 0
                  ? patient.doctors.map((doctor) => (
                      <Link
                        key={doctor.id}
                        href={`/hekim/${doctor.id}`}
                        className="flex items-center gap-2 hover:bg-muted-foreground/20 rounded-md p-2 px-4 transition-colors duration-300"
                      >
                        <Avatar className="ring ring-border">
                          <AvatarImage
                            src={getImageUrl(doctor.user.imagePath)}
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
                          <p className="text-xs text-muted-foreground">
                            Ödeme Planı Yok
                          </p>
                        </div>
                      </Link>
                    ))
                  : null}
            </div>
            <EditPatientDoctorsDialog patientId={patient.id || ""} />
          </div>
        </div>
      </div>
    </div>
  )
}
