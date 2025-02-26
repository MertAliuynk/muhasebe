"use client"

import React from "react"
import { useSearchParams } from "next/navigation"
import { api } from "@/trpc/react"
import { AlertCircle, Banknote, CreditCard, Wallet } from "lucide-react"

import { formatCurrencyWithSymbol } from "@/lib/utils"
import Spinner from "@/components/spinner"

export default function FinancialCards() {
  const searchParams = useSearchParams()
  const dateParam = searchParams.get("date")

  let startDate: string | undefined
  let endDate: string | undefined

  if (dateParam) {
    const dates = dateParam.split(",")
    startDate = dates[0] || undefined
    endDate = dates[1] || undefined
  }

  const { data: financialData, isFetching } =
    api.doctor.getDoctorFinancialData.useQuery(
      {
        id: "cm7jl2rl2002xd35xxqyw13dw",
        startDate,
        endDate,
      },
      {
        enabled: true,
      }
    )

  return (
    <div className="grid grid-cols-4 gap-4 mt-6">
      <div className="group relative overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-500/10 transition-transform duration-300 group-hover:scale-105" />
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Toplam Gelir</span>
            <CreditCard className="size-5 text-green-500" />
          </div>
          <p className="mt-4 text-3xl font-semibold">
            {isFetching ? (
              <Spinner className="mx-auto mt-8" />
            ) : (
              formatCurrencyWithSymbol(financialData?.totalIncome)
            )}
          </p>
        </div>
      </div>

      <div className="group relative overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-destructive/10 transition-transform duration-300 group-hover:scale-105" />
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Toplam Gider</span>
            <Banknote className="size-5 text-destructive" />
          </div>
          <p className="mt-4 text-3xl font-semibold">
            {isFetching ? (
              <Spinner className="mx-auto mt-8" />
            ) : (
              formatCurrencyWithSymbol(financialData?.totalExpense || 0)
            )}
          </p>
        </div>
      </div>

      <div className="group relative overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-500/10 transition-transform duration-300 group-hover:scale-105" />
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Hakediş</span>
            <Wallet className="size-5 text-primary" />
          </div>
          <p className="mt-4 text-3xl font-semibold">
            {isFetching ? (
              <Spinner className="mx-auto mt-8" />
            ) : (
              formatCurrencyWithSymbol(financialData?.totalCommission || 0)
            )}
          </p>
        </div>
      </div>
      <div className="group relative overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-500/10 transition-transform duration-300 group-hover:scale-105" />
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Bekleyen Ödemeler</span>
            <AlertCircle className="size-5 text-orange-500" />
          </div>
          <p className="mt-4 text-3xl font-semibold">
            {isFetching ? (
              <Spinner className="mx-auto mt-8" />
            ) : (
              formatCurrencyWithSymbol(financialData?.pendingPayments || 0)
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
