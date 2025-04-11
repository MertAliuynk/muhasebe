"use client"

import Link from "next/link"
import type { RouterOutputs } from "@/trpc/react"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { MoreVertical } from "lucide-react"
import { formatPhoneNumberIntl } from "react-phone-number-input"

import { getImageUrl } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import DeleteDoctorDialog from "@/app/(manager)/hekim/_components/delete-doctor-dialog"
import EditDoctorDialog from "@/app/(manager)/hekim/_components/edit-doctor-dialog"

import { ChangeDoctorPasswordDialog } from "./change-password-modal"

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
  {
    accessorKey: "actions",
    header: "",
    cell: ({ row }) => {
      const data = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7 sm:size-8">
              <MoreVertical className="size-3 sm:size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="text-xs sm:text-sm min-w-[8rem]">
            <EditDoctorDialog doctor={data} />
            <ChangeDoctorPasswordDialog doctor={data} />
            <DeleteDoctorDialog doctor={data} />
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    side: "end",
    size: "10",
  },
] as ColumnDef<Item>[]
