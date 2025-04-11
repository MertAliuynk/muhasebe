import React from "react"
import { type RouterOutputs } from "@/trpc/react"
import { Banknote, CreditCard, Wallet } from "lucide-react"

import { formatCurrencyWithSymbol } from "@/lib/utils"

export default function FinancialCards({
  approvedPaymentPlan,
}: {
  approvedPaymentPlan: RouterOutputs["paymentPlan"]["getPatientPaymentPlanById"][number]
}) {
  if (!approvedPaymentPlan) return null

  const paidPercentage =
    (approvedPaymentPlan.paidAmount / approvedPaymentPlan.totalAmount) * 100

  const remainingPercentage =
    (approvedPaymentPlan.remainingAmount / approvedPaymentPlan.totalAmount) *
    100

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <div className="group relative overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 transition-transform duration-300 group-hover:scale-105" />
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Toplam Tutar</span>
            <CreditCard className="size-5 text-primary" />
          </div>
          <p className="mt-4 text-3xl font-semibold">
            {formatCurrencyWithSymbol(approvedPaymentPlan.totalAmount)}
          </p>
        </div>
      </div>

      <div className="group relative overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-500/10 transition-transform duration-300 group-hover:scale-105" />
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Toplam Ödenen</span>
            <Banknote className="size-5 text-green-500" />
          </div>
          <p className="mt-4 text-3xl font-semibold">
            {formatCurrencyWithSymbol(approvedPaymentPlan.paidAmount)}
          </p>
          <div className="mt-2 h-2 w-full rounded-full bg-green-500/10">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-300"
              style={{ width: `${paidPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="group relative overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-destructive/10 transition-transform duration-300 group-hover:scale-105" />
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Kalan Tutar</span>
            <Wallet className="size-5 text-destructive" />
          </div>
          <p className="mt-4 text-3xl font-semibold">
            {formatCurrencyWithSymbol(approvedPaymentPlan.remainingAmount)}
          </p>
          <div className="mt-2 h-2 w-full rounded-full bg-destructive/10">
            <div
              className="h-full rounded-full bg-destructive transition-all duration-300"
              style={{ width: `${remainingPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
