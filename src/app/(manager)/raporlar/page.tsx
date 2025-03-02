import React from "react"
import { api } from "@/trpc/server"

import { IncomeExpenseLineChart } from "./_components/income-expense-line-chart"

export default async function page() {
  const incomeExpenseLineChart = await api.report.incomeExpenseLineChart({
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-12-31"),
  })

  return (
    <div>
      <IncomeExpenseLineChart chartData={incomeExpenseLineChart} />
    </div>
  )
}
