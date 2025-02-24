"use client"

import { api, type RouterOutputs } from "@/trpc/react"
import type { ColumnDef } from "@tanstack/react-table"
import { EllipsisVerticalIcon, Pencil, Trash2 } from "lucide-react"

import { formatCurrencyWithSymbol } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import DeleteByIdDiaglog from "@/components/delete-by-id-diaglog"

import SaveExpenseTypeDrawer from "./save-expense-type-drawer"

type Item = RouterOutputs["expense"]["getAllExpenseTypes"][number]

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
    accessorKey: "doctorExpenses",
    header: "Toplam Doktor Giderleri",
    cell: ({ row }) => {
      const totalAmount = row.original.doctorExpenses.reduce(
        (acc, expense) => acc + expense.amount,
        0
      )
      return formatCurrencyWithSymbol(totalAmount)
    },
  },
  {
    accessorKey: "branchExpenses",
    header: "Toplam Şube Giderleri",
    cell: ({ row }) => {
      const totalAmount = row.original.branchExpenses.reduce(
        (acc, expense) => acc + expense.amount,
        0
      )
      return formatCurrencyWithSymbol(totalAmount)
    },
  },
  {
    accessorKey: "action",
    header: "",
    cell: ({ row }) => {
      const { mutateAsync, isPending } =
        api.expense.softDeleteExpenseType.useMutation()
      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <EllipsisVerticalIcon size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <SaveExpenseTypeDrawer
                expenseType={row.original}
                trigger={
                  <DropdownMenuItem modal>
                    Düzenle
                    <Pencil size={16} />
                  </DropdownMenuItem>
                }
              />
              <DeleteByIdDiaglog
                title="Gider Kalemini Sil"
                description="Bu işlem geri alınamaz."
                action={{
                  mutateAsync: () => mutateAsync({ id: row.original.id }),
                  isPending,
                }}
              >
                <DropdownMenuItem variant="destructive" modal>
                  Sil
                  <Trash2 size={16} />
                </DropdownMenuItem>
              </DeleteByIdDiaglog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
] as ColumnDef<Item>[]
