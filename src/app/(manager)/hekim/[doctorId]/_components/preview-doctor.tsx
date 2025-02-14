"use client"

import Image from "next/image"
import { type RouterOutputs } from "@/trpc/react"
import { Calendar, Phone, User } from "lucide-react"
import { formatPhoneNumber } from "react-phone-number-input"

import { env } from "@/env"
import { calculateAge } from "@/lib/utils"

export default function PreviewDoctor({
  doctor,
}: {
  doctor: RouterOutputs["doctor"]["getDoctorById"]
}) {
  return (
    <div className="space-y-2">
      <div className="relative aspect-[2/3] size-full max-h-96 shadow select-none">
        <div className="relative size-full">
          <Image
            fill
            priority
            alt="Thumbnail"
            src={
              doctor?.user.imagePath
                ? `${env.NEXT_PUBLIC_MINIO_URL}${doctor.user.imagePath}`
                : "/images/placeholder.svg"
            }
            className="object-cover size-full rounded-md"
          />
        </div>
        <div className="overlay" />
      </div>
      <div className="flex items-center gap-2 bg-muted/20 p-1 text-sm font-medium rounded-xl border">
        <div className="bg-sidebar rounded-xl p-2">
          <User className="size-4 text-muted-foreground" />
        </div>
        <p>{doctor?.user.name}</p>
      </div>
      <div className="flex items-center gap-2 bg-muted/20 p-2 text-sm font-medium rounded-xl border">
        <div className="bg-sidebar rounded-xl p-2">
          <Phone className="size-4 text-muted-foreground" />
        </div>
        <p>{formatPhoneNumber(doctor?.phoneNumber ?? "")}</p>
      </div>
      <div className="flex items-center gap-2 bg-muted/20 p-2 text-sm font-medium rounded-xl border">
        <div className="bg-sidebar rounded-xl p-2">
          <Calendar className="size-4 text-muted-foreground" />
        </div>
        <p>
          {doctor?.birthDate && ` ${calculateAge(doctor.birthDate)} yaşında`}
        </p>
      </div>
    </div>
  )
}
