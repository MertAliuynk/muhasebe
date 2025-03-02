"use client"

import { api, type RouterOutputs } from "@/trpc/react"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { EllipsisVerticalIcon, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/components/data-table/components/column-header"
import DeleteByIdDiaglog from "@/components/delete-by-id-diaglog"

import SaveManagerDialog from "./save-manager-dialog"

type Item = RouterOutputs["user"]["getUsers"][number]

export default [
  {
    accessorKey: "name",
    header: "Yönetici Adı Soyadı",
    size: 50,
  },
  {
    accessorKey: "username",
    header: "Kullanıcı Adı",
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Oluşturulma Tarihi" />
    ),
    cell: ({ row }) => {
      return format(row.original.createdAt, "dd MMMM yyyy, EEEE")
    },
  },
  {
    accessorKey: "action",
    header: "",
    cell: ({ row }) => {
      const { mutateAsync, isPending } = api.user.deleteUser.useMutation()
      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <EllipsisVerticalIcon size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <SaveManagerDialog
                user={row.original}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Düzenle
                    <Pencil size={16} className="ml-auto" />
                  </DropdownMenuItem>
                }
              />
              <DeleteByIdDiaglog
                title="Yönetici Sil"
                description="Bu yöneticiyi silmek istediğinize emin misiniz?"
                action={{
                  mutateAsync: () => mutateAsync({ id: row.original.id }),
                  isPending,
                }}
              >
                <DropdownMenuItem modal variant="destructive">
                  Sil
                  <Trash2 size={16} className="ml-auto" />
                </DropdownMenuItem>
              </DeleteByIdDiaglog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
] as ColumnDef<Item>[]
