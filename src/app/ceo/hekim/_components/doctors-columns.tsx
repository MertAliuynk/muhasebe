"use client"

import Link from "next/link"
import { type RouterOutputs } from "@/trpc/react"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { formatPhoneNumberIntl } from "react-phone-number-input"

import { getImageUrl } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

type Item = RouterOutputs["doctor"]["getDoctorsAdmin"][number]

export default [
  {
    accessorFn: (row) => row.user.name,
    accessorKey: "name",
    header: "Hekim Adı Soyadı",
    cell: ({ row }) => {
      const name = row.original.user.name
      const image = row.original.user.imagePath
      const specialty = row.original.specialty ?? ""

      return (
        <Link
          href={`/ceo/hekim/${row.original.id}`}
          className="flex items-center gap-2 hover:bg-muted/30 p-2 rounded-md transition-all duration-300"
        >
          <Avatar className="rounded-xl">
            <AvatarImage src={getImageUrl(image)} />
            <AvatarFallback>
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{name}</p>
            <p className="text-muted-foreground text-xs">{specialty}</p>
          </div>
        </Link>
      )
    },
    size: 600,
  },
  {
    accessorKey: "branch",
    header: "Şube",
    cell: ({ row }) => {
      return row.original.branch.name
    },
  },
  {
    accessorKey: "phoneNumber",
    header: "Telefon Numarası",
    cell: ({ row }) => {
      const phone = row.original.phoneNumber
      return phone ? formatPhoneNumberIntl(phone) : "Yok"
    },
    size: 200,
  },
  {
    accessorKey: "birthDate",
    header: "Doğum Tarihi",
    cell: ({ row }) => {
      const birthDate = row.original.birthDate
      return birthDate ? format(birthDate, "dd MMMM yyyy") : "Yok"
    },
  },
  {
    accessorKey: "patients",
    header: () => <p className="text-center">Hasta Sayısı</p>,
    cell: ({ row }) => {
      const patients = row.original.patients

      return (
        <div className="flex justify-center">
          <Badge variant="outline">{patients?.length}</Badge>
        </div>
      )
    },
  },
] as ColumnDef<Item>[]
