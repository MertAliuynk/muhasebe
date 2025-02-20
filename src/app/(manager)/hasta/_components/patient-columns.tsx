"use client"

import Link from "next/link"
import { type RouterOutputs } from "@/trpc/react"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { formatPhoneNumberIntl } from "react-phone-number-input"

import { env } from "@/env"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

type Item = RouterOutputs["patient"]["getPatientsByBranch"][number]

export default [
  {
    accessorKey: "name",
    header: "Hasta Adı ve Soyadı",
    cell: ({ row }) => {
      const patient = row.original
      return (
        <Link
          href={`/hasta/${patient.id}`}
          className="flex items-center gap-2 hover:bg-muted p-2 rounded-md transition-all duration-300"
        >
          <div>{patient.name}</div>
        </Link>
      )
    },
  },
  {
    accessorKey: "phone",
    header: "Telefon Numarası",
    cell: ({ row }) => {
      const phone = row.original.phone
      return <div>{phone ? formatPhoneNumberIntl(phone) : "Yok"}</div>
    },
  },
  {
    accessorKey: "birthDate",
    header: "Doğum Tarihi",
    cell: ({ row }) => {
      const birthDate = row.original.birthDate
      return <div>{birthDate ? format(birthDate, "dd.MM.yyyy") : "Yok"}</div>
    },
  },
  {
    accessorKey: "doctor",
    header: "Doktor'u",
    cell: ({ row }) => {
      const doctor = row.original.doctor
      if (!doctor)
        return (
          <Badge variant="destructive">Doktor&apos;u sistemden silinmiş!</Badge>
        )
      return (
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage
              src={`${env.NEXT_PUBLIC_MINIO_URL}${doctor?.user?.imagePath}`}
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <p>{doctor?.user?.name}</p>
            <p className="text-xs text-muted-foreground">{doctor?.specialty}</p>
          </div>
        </div>
      )
    },
  },
] as ColumnDef<Item>[]
