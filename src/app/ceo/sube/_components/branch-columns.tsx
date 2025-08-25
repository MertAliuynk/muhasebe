"use client"

import { api, type RouterOutputs } from "@/trpc/react"
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
import DeleteByIdDiaglog from "@/components/delete-by-id-diaglog"

import SaveBranchDialog from "./save-branch-dialog"

type Item = RouterOutputs["branch"]["getAll"]["branches"][number]

export default [
  {
    accessorKey: "name",
    header: "Şube Adı",
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
    cell: ({ row }) => {
      const { mutateAsync, isPending } = api.branch.deleteBranch.useMutation()

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <EllipsisVerticalIcon size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <SaveBranchDialog
                branch={row.original}
                trigger={
                  <DropdownMenuItem modal>
                    Düzenle
                    <Pencil size={14} className="ml-auto" />
                  </DropdownMenuItem>
                }
              />
              <DeleteByIdDiaglog
                title="Şube Sil"
                description="Bu şubeyi silmek istediğinize emin misiniz?"
                action={{
                  mutateAsync: () => mutateAsync({ id: row.original.id }),
                  isPending,
                }}
              >
                <DropdownMenuItem modal variant="destructive">
                  Sil
                  <Trash2 size={14} className="ml-auto" />
                </DropdownMenuItem>
              </DeleteByIdDiaglog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
] as ColumnDef<Item>[]
