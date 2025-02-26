"use client"

import { type RouterOutputs } from "@/trpc/react"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

import { formatCurrencyWithSymbol, paymentTypeLabels } from "@/lib/utils"

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
] as ColumnDef<Item>[]
