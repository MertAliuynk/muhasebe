"use client"

import { type PatientPaymentPlan } from "@prisma/client"
import type { ColumnDef } from "@tanstack/react-table"

import { formatCurrencyWithSymbol } from "@/lib/utils"

type Item = PatientPaymentPlan

export default [
  {
    accessorKey: "totalAmount",
    header: "Toplam Tutar",
    cell: ({ row }) => {
      const totalAmount = row.original.totalAmount
      return formatCurrencyWithSymbol(totalAmount)
    },
  },
  {
    accessorKey: "installmentCount",
    header: "Taksit Sayısı",
    cell: ({ row }) => {
      const installmentCount = row.original.installmentCount
      return installmentCount
    },
  },
  {
    accessorKey: "interestRate",
    header: "Faiz Oranı",
    cell: ({ row }) => {
      const interestRate = row.original.interestRate
      return `${interestRate}%`
    },
  },
] as ColumnDef<Item>[]
