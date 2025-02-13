"use client"

import type { RouterOutputs } from "@/trpc/react"
import type { ColumnDef } from "@tanstack/react-table"
import { EllipsisVerticalIcon, Pencil, Trash2 } from "lucide-react"
import { formatPhoneNumber } from "react-phone-number-input"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/components/data-table/components/column-header"

type Item = RouterOutputs["branch"]["getAll"][number]

export default [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Şube Adı" />
    ),
  },
  {
    accessorKey: "address",
    header: "Adres",
  },
  {
    accessorKey: "phone",
    header: "Telefon",
    cell: ({ row }) => {
      const phone = row.original.phone
      return phone ? formatPhoneNumber(phone) : "Yok"
    },
  },
  {
    accessorKey: "manager",
    header: "Yönetici",
    cell: ({ row }) => {
      const manager = row.original.manager
      return <Badge variant="outline">{manager.name}</Badge>
    },
  },
  {
    accessorKey: "doctors",
    header: () => <p className="text-center">Doktor Sayısı</p>,
    cell: ({ row }) => {
      const doctors = row.original.doctors
      return <p className="text-center">{doctors.length}</p>
    },
  },
  {
    accessorKey: "action",
    header: "",
    cell: () => {
      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <EllipsisVerticalIcon size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                Düzenle
                <Pencil size={16} />
              </DropdownMenuItem>
              <DropdownMenuItem>
                Sil
                <Trash2 size={16} />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
] as ColumnDef<Item>[]
