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
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Expenses from "@/app/(manager)/gunluk-kasa/_components/expenses"
import Revenues from "@/app/(manager)/gunluk-kasa/_components/revenues"

export default function PreviewDoctor({
  doctor,
}: {
  doctor: RouterOutputs["doctor"]["getDoctorByUsername"]
}) {
  return (
    <div className="space-y-8">
      <div className="relative flex items-center">
        <div className="container relative z-10">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="relative group">
              <div className="relative rounded-[80px] size-[270px] overflow-hidden ring-4 ring-primary/20 select-none shrink-0 transition-transform duration-300 group-hover:scale-105">
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

            <div className="flex-1 space-y-6 text-center md:text-left">
              <div className="space-y-2">
                <h2 className="text-4xl font-light tracking-tight">
                  {doctor?.user.name}
                </h2>
                <Badge>
                  <Stethoscope className="size-4 mr-2" />
                  <span className="font-medium">{doctor?.specialty}</span>
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 cursor-default"
                >
                  <CalendarDays className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {doctor?.birthDate &&
                      `${format(doctor?.birthDate, "dd.MM.yyyy")} (${calculateAge(
                        doctor.birthDate
                      )} yaşında)`}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 cursor-default"
                >
                  <Phone className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {formatPhoneNumber(doctor?.phoneNumber ?? "")}
                  </span>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-none hover:scale-105 transition-transform duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="size-4 text-primary" />
                      <span className="text-sm font-medium">Hasta Sayısı</span>
                    </div>
                    <p className="text-2xl font-semibold mt-2">156</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-none hover:scale-105 transition-transform duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="size-4 text-green-500" />
                      <span className="text-sm font-medium">Toplam Gelir</span>
                    </div>
                    <p className="text-2xl font-semibold mt-2">
                      {formatCurrency(132000)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-none hover:scale-105 transition-transform duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Wallet className="size-4 text-destructive" />
                      <span className="text-sm font-medium">Toplam Gider</span>
                    </div>
                    <p className="text-2xl font-semibold mt-2">
                      {formatCurrency(82000)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-none hover:scale-105 transition-transform duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <BadgeDollarSign className="size-4 text-blue-500" />
                      <span className="text-sm font-medium">Hakediş</span>
                    </div>
                    <p className="text-2xl font-semibold mt-2">
                      {formatCurrency(50000)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-4">
        <Revenues />
        <Expenses />
      </div>
    </div>
  )
}
