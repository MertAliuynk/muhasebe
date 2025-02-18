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
    accessorKey: "downPaymentAmount",
    header: "Peşinat Tutarı",
    cell: ({ row }) => {
      const downPaymentAmount = row.original.downPaymentAmount
      return formatCurrencyWithSymbol(downPaymentAmount)
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
  {
    accessorKey: "totalInstallmentAmount",
    header: "Toplam Ödenecek Tutar",
    cell: ({ row }) => {
      const totalInstallmentAmount =
        row.original.totalAmount - row.original.downPaymentAmount
      const totalInstallmentAmountWithInterest =
        totalInstallmentAmount * (1 + row.original.interestRate / 100)
      return formatCurrencyWithSymbol(totalInstallmentAmountWithInterest)
    },
  },
  {
    accessorKey: "monthlyInstallmentAmount",
    header: "Aylık Ödenecek Tutar",
    cell: ({ row }) => {
      const totalInstallmentAmount =
        row.original.totalAmount - row.original.downPaymentAmount
      const totalInstallmentAmountWithInterest =
        totalInstallmentAmount * (1 + row.original.interestRate / 100)
      const monthlyInstallmentAmount =
        totalInstallmentAmountWithInterest / row.original.installmentCount
      return formatCurrencyWithSymbol(monthlyInstallmentAmount)
    },
  },
] as ColumnDef<Item>[]
