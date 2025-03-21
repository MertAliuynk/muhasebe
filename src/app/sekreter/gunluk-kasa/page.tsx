import React from "react"

import { DatePicker } from "@/components/ui/date-picker"

import { CaseDetailDialog } from "./_components/case-detail-dialog"
import Expenses from "./_components/expenses"
import Incomes from "./_components/incomes"

export default async function Page() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Günlük Kasa Akış</h1>
          <CaseDetailDialog />
        </div>
        <DatePicker />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Incomes />
        <Expenses />
      </div>
    </div>
  )
}
