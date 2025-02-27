import React from "react"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { type SearchParams } from "nuqs/server"

import { DatePicker } from "@/components/ui/date-picker"

import { CaseDetailDialog } from "./_components/case-detail-dialog"
import Expenses from "./_components/expenses"
import Incomes from "./_components/incomes"

const today = format(new Date(), "yyyy-MM-dd")

type PageProps = {
  searchParams: Promise<SearchParams>
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  if (!params.date) {
    redirect(`/gunluk-kasa?date=${today}`)
  }

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
