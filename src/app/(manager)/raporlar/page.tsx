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
  searchParams: Promise<{
    startDate?: string
    endDate?: string
    period?: "daily" | "monthly"
  }>
}) {
  const params = await searchParams
  const currentMonthStart = startOfMonth(new Date())
  const currentMonthEnd = endOfMonth(new Date())

  const startDate = params.startDate
    ? new Date(params.startDate)
    : currentMonthStart

  const endDate = params.endDate ? new Date(params.endDate) : currentMonthEnd

  const period = params.period ?? "daily"

  const incomeExpenseLineChart = await api.report.incomeExpenseLineChart({
    startDate,
    endDate,
    period,
  })

  const isCurrentMonth =
    isSameMonth(startDate, currentMonthStart) &&
    isSameMonth(endDate, currentMonthEnd)

  return (
    <div>
      <div className="space-y-8">
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Ödeme Özeti</h2>
          <BranchPaymentSummary />
        </section>

        <div className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold">Gelir-Gider Raporu</h2>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
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
                className="w-full sm:w-[300px]"
              />
            </div>
          </div>
          <IncomeExpenseLineChart chartData={incomeExpenseLineChart} />
        </div>
      </div>
    </div>
  )
}
