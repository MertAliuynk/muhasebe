import React from "react"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import type { SearchParams } from "nuqs/server"

import { DatePicker } from "@/components/ui/date-picker"

import Expenses from "./_components/expenses"
import Incomes from "./_components/incomes"

type PageProps = {
  searchParams: Promise<SearchParams>
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams

  if (!params.date) {
    redirect(`/gunluk-kasa?date=${format(new Date(), "yyyy-MM-dd")}`)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold">Günlük Kasa Akış</h1>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Incomes />
        <Expenses />
      </div>
    </div>
  )
}
