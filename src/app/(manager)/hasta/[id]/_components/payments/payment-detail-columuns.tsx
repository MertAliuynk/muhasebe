"use client"

import { type RouterOutputs } from "@/trpc/react"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { MoreVertical } from "lucide-react"

import { formatCurrencyWithSymbol, paymentTypeLabels } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import EditPatientPaymentDialog from "./edit-patient-payment-dialog"

type Item = RouterOutputs["payment"]["getAllPaymentsByPatientId"][number]

export default [
  {
    accessorKey: "amount",
    header: "Tutar",
    cell: ({ row }) => {
      const payment = row.original
      return <div>{formatCurrencyWithSymbol(payment.amount)}</div>
    },
  },
  {
    accessorKey: "paymentType",
    header: "Ödeme Tipi",
    cell: ({ row }) => {
      const payment = row.original
      return <div>{paymentTypeLabels[payment.paymentType]}</div>
    },
  },
  {
    accessorKey: "note",
    header: "Not",
    cell: ({ row }) => {
      const payment = row.original
      return <div>{payment.note}</div>
    },
  },
  {
    accessorKey: "paymentDate",
    header: "Ödeme Tarihi",
    cell: ({ row }) => {
      const payment = row.original
      return <div>{format(payment.paymentDate, "PPP EEEE HH:mm")}</div>
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
            <Button variant="ghost" size="icon">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <EditPatientPaymentDialog payment={data} />
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    side: "end",
    size: "10",
  },
] as ColumnDef<Item>[]
