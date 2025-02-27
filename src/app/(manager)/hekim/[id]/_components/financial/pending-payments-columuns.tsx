"use client"

import { type RouterOutputs } from "@/trpc/react"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

import { formatCurrencyWithSymbol } from "@/lib/utils"

type Item = RouterOutputs["doctor"]["getDoctorPendingPayments"][number]

export default [
  {
    accessorKey: "patientName",
    header: "Hasta Adı ve Soyadı",
  },
  {
    accessorKey: "totalAmount",
    header: "Toplam Tutar",
    cell: ({ row }) => {
      const item = row.original
      return formatCurrencyWithSymbol(item.totalAmount)
    },
  },
  {
    accessorKey: "paidAmount",
    header: "Ödenen Tutar",
    cell: ({ row }) => {
      const item = row.original
      return formatCurrencyWithSymbol(item.paidAmount)
    },
  },
  {
    accessorKey: "remainingAmount",
    header: "Kalan Tutar",
    cell: ({ row }) => {
      const item = row.original
      return formatCurrencyWithSymbol(item.remainingAmount)
    },
  },
  {
    accessorKey: "installmentCount",
    header: "Taksit Sayısı",
    cell: ({ row }) => {
      const item = row.original
      return item.installmentCount
    },
  },
  {
    accessorKey: "nextPaymentDate",
    header: "Sonraki Ödeme Tarihi",
    cell: ({ row }) => {
      const item = row.original
      return item.nextPaymentDate
        ? format(item.nextPaymentDate, "PPP")
        : "Bilinmiyor"
    },
  },
] as ColumnDef<Item>[]
