"use client"

import Image from "next/image"
import { type RouterOutputs } from "@/trpc/react"
import { format } from "date-fns"
import {
  BadgeDollarSign,
  CalendarDays,
  Phone,
  Stethoscope,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react"
import { formatPhoneNumber } from "react-phone-number-input"

import { env } from "@/env"
import { calculateAge, formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function PreviewDoctor({
  doctor,
}: {
  doctor: RouterOutputs["doctor"]["getDoctorByUsername"]
}) {
  return (
    <div className="space-y-8">
      <div className="relative">
        {/* Üst Kısım - Doktor Bilgileri */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-background to-primary/10 p-8">
          <div className="absolute inset-0 bg-grid-white/10" />

          <div className="relative z-10 flex flex-col md:flex-row gap-8">
            {/* Sol Taraf - Profil Resmi */}
            <div className="relative group">
              <div className="relative rounded-[2rem] size-[270px] overflow-hidden ring-4 ring-primary/20 select-none shrink-0 transition-transform duration-300 group-hover:scale-105">
                <Image
                  fill
                  priority
                  alt="Thumbnail"
                  src={
                    doctor?.user.imagePath
                      ? `${env.NEXT_PUBLIC_MINIO_URL}${doctor.user.imagePath}`
                      : "/images/placeholder.svg"
                  }
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-background/30" />
              </div>
            </div>

            {/* Sağ Taraf - Doktor Detayları */}
            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-light">{doctor?.user.name}</h2>
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                    <Stethoscope className="size-4 mr-2" />
                    <span className="font-medium">{doctor?.specialty}</span>
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-primary" />
                  <span>
                    {doctor?.birthDate &&
                      `${format(doctor?.birthDate, "dd.MM.yyyy")} (${calculateAge(
                        doctor.birthDate
                      )} yaşında)`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-4 text-primary" />
                  <span>{formatPhoneNumber(doctor?.phoneNumber ?? "")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alt Kısım - İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="group relative overflow-hidden rounded-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 transition-transform duration-300 group-hover:scale-105" />
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Hasta Sayısı</span>
                <Users className="size-5 text-primary" />
              </div>
              <p className="mt-4 text-3xl font-semibold">156</p>
              <div className="mt-2 h-2 w-full rounded-full bg-primary/10">
                <div className="h-full w-[80%] rounded-full bg-primary transition-all duration-300" />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-500/10 transition-transform duration-300 group-hover:scale-105" />
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Toplam Gelir</span>
                <TrendingUp className="size-5 text-green-500" />
              </div>
              <p className="mt-4 text-3xl font-semibold">
                {formatCurrency(132000)}
              </p>
              <div className="mt-2 h-2 w-full rounded-full bg-green-500/10">
                <div className="h-full w-[60%] rounded-full bg-green-500 transition-all duration-300" />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-destructive/10 transition-transform duration-300 group-hover:scale-105" />
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Toplam Gider</span>
                <Wallet className="size-5 text-destructive" />
              </div>
              <p className="mt-4 text-3xl font-semibold">
                {formatCurrency(82000)}
              </p>
              <div className="mt-2 h-2 w-full rounded-full bg-destructive/10">
                <div className="h-full w-[40%] rounded-full bg-destructive transition-all duration-300" />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-500/10 transition-transform duration-300 group-hover:scale-105" />
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Hakediş</span>
                <BadgeDollarSign className="size-5 text-blue-500" />
              </div>
              <p className="mt-4 text-3xl font-semibold">
                {formatCurrency(50000)}
              </p>
              <div className="mt-2 h-2 w-full rounded-full bg-blue-500/10">
                <div className="h-full w-[70%] rounded-full bg-blue-500 transition-all duration-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-4"></div>
    </div>
  )
}
