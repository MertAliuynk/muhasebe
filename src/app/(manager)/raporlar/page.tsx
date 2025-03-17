import React from "react"
import { api } from "@/trpc/server"
import { endOfMonth, isSameMonth, startOfMonth } from "date-fns"

import { DateRangePicker } from "@/components/ui/date-range-picker"

import BranchPaymentSummary from "./_components/branch-payment-summary"
import { GoToCurrentMonthButton } from "./_components/go-to-current-month-button"
import { IncomeExpenseLineChart } from "./_components/income-expense-line-chart"
import { PeriodSelect } from "./_components/period-select"

export default async function page({
  searchParams,
}: {
  searchParams: {
    startDate?: string
    endDate?: string
    period?: "daily" | "monthly"
  }
}) {
  const currentMonthStart = startOfMonth(new Date())
  const currentMonthEnd = endOfMonth(new Date())

  const startDate = searchParams.startDate
    ? new Date(searchParams.startDate)
    : currentMonthStart

  const endDate = searchParams.endDate
    ? new Date(searchParams.endDate)
    : currentMonthEnd

  const period = searchParams.period ?? "daily"

  const incomeExpenseLineChart = await api.report.incomeExpenseLineChart({
    startDate,
    endDate,
    period,
  })

  const isCurrentMonth =
    isSameMonth(startDate, currentMonthStart) &&
    isSameMonth(endDate, currentMonthEnd)

  return (
    <div className="container mx-auto">
      <h1 className="mb-6 text-2xl font-bold">Raporlar</h1>

      <div className="space-y-8">
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Ödeme Özeti</h2>
          <BranchPaymentSummary />
        </section>

        <div className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Gelir-Gider Raporu</h2>
            <div className="flex items-center gap-4">
              <PeriodSelect defaultValue={period} />
              {!isCurrentMonth && (
                <GoToCurrentMonthButton
                  period={period}
                  currentMonthStart={currentMonthStart}
                  currentMonthEnd={currentMonthEnd}
                />
              )}
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                className="w-[300px]"
              />
            </div>
          </div>
          <IncomeExpenseLineChart chartData={incomeExpenseLineChart} />
        </div>
      </div>
    </div>
  )
}
