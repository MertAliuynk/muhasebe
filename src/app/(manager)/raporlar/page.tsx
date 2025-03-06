import React from "react"
import { api } from "@/trpc/server"
import { endOfMonth, isSameMonth, startOfMonth } from "date-fns"

import { DateRangePicker } from "@/components/ui/date-range-picker"

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
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gelir-Gider Raporu</h1>
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
  )
}
