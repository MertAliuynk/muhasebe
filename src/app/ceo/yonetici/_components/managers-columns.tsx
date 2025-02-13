"use client"

import type { RouterOutputs } from "@/trpc/react"
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
