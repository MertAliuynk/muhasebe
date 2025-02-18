"use client"

import type { RouterOutputs } from "@/trpc/react"
import type { ColumnDef } from "@tanstack/react-table"
import { EllipsisVerticalIcon, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Item = RouterOutputs["expense"]["getAll"][number]

export default [
  {
    accessorKey: "name",
    header: "Gider Kalem Adı",
  },
  {
    accessorKey: "description",
    header: "Açıklama",
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
