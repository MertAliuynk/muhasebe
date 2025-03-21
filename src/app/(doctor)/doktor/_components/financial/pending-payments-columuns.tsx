"use client"

import { type RouterOutputs } from "@/trpc/react"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

import { formatCurrencyWithSymbol } from "@/lib/utils"

type Item = RouterOutputs["doctor"]["getDoctorPendingPayments"][number]

const columns: ColumnDef<Item>[] = [
  {
    accessorKey: "patientName",
    header: "Hasta Adı",
  },
  {
    accessorKey: "totalAmount",
    header: "Toplam Tutar",
    cell: ({ row }) => formatCurrencyWithSymbol(row.original.totalAmount),
  },
  {
    accessorKey: "paidAmount",
    header: "Ödenen Tutar",
    cell: ({ row }) => formatCurrencyWithSymbol(row.original.paidAmount),
  },
  {
    accessorKey: "remainingAmount",
    header: "Kalan Tutar",
    cell: ({ row }) => formatCurrencyWithSymbol(row.original.remainingAmount),
  },
  {
    accessorKey: "installmentCount",
    header: "Kalan Taksit",
  },
  {
    accessorKey: "nextPaymentDate",
    header: "Sonraki Ödeme",
    cell: ({ row }) =>
      row.original.nextPaymentDate
        ? format(new Date(row.original.nextPaymentDate), "dd MMMM yyyy", {
            locale: tr,
          })
        : "-",
  },
]

export default columns
