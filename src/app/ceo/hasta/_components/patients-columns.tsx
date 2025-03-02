"use client"

import Link from "next/link"
import { type RouterOutputs } from "@/trpc/react"
import type { ColumnDef } from "@tanstack/react-table"
import { formatPhoneNumberIntl } from "react-phone-number-input"

import { getImageUrl } from "@/lib/utils"
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
    accessorKey: "doctor",
    header: "Hekimler",
    cell: ({ row }) => {
      const doctors = row.original.doctors

      if (!doctors)
        return (
          <Badge variant="destructive">Doktor&apos;u sistemden silinmiş!</Badge>
        )

      return (
        <div className="flex items-center">
          {doctors.map((doctor, index) => (
            <Link
              href={`/hekim/${doctor.id}`}
              key={doctor.id}
              className="flex items-center -ml-3 first:ml-0 hover:scale-125 transition-transform cursor-pointer"
              style={{ zIndex: doctors.length - index }}
            >
              <Avatar className="ring-2 ring-border">
                <AvatarImage src={getImageUrl(doctor?.user?.imagePath)} />
                <AvatarFallback>
                  {doctor?.user?.name?.split(" ")[0]?.charAt(0)}
                  {doctor?.user?.name?.split(" ")[1]?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Link>
          ))}
        </div>
      )
    },
  },
] as ColumnDef<Item>[]
