"use client"

import React from "react"
import { useSearchParams } from "next/navigation"
import { api } from "@/trpc/react"
import { format } from "date-fns"

import { formatCurrencyWithSymbol } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Spinner from "@/components/spinner"

export default function DoctorExpenses() {
  const searchParams = useSearchParams()
  const dateParam = searchParams.get("date")

  let startDate: string | undefined
  let endDate: string | undefined

  if (dateParam) {
    const dates = dateParam.split(",")
    startDate = dates[0] || undefined
    endDate = dates[1] || undefined
  }
  const { data: expenses, isLoading } = api.doctor.getDoctorExpenses.useQuery({
    id: "cm7jl2rl2002xd35xxqyw13dw",
    startDate,
    endDate,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hekim Giderleri</CardTitle>
        <CardDescription>
          Bu bölümde hekimin giderlerini görebilirsiniz.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[calc(100vh-20rem)] overflow-y-auto no-scrollbar">
        <div className="grid grid-cols-[1fr_3fr_1fr] gap-4 text-sm text-muted-foreground">
          <p>Türü</p>
          <p>Tarih</p>
          <p>Tutar</p>
        </div>
        <div className="divide-y">
          {isLoading ? (
            <Spinner className="mx-auto mt-20" />
          ) : expenses?.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground mt-20 underline">
              Herhangi bir gider yok.
            </p>
          ) : (
            expenses?.map((expense) => (
              <div
                key={expense.id}
                className="grid grid-cols-[1fr_3fr_1fr] gap-4 first:pt-2 py-4"
              >
                <p>{expense.expenseType}</p>
                <p>{format(expense.date, "PPP EEEE HH:mm")}</p>
                <p>{formatCurrencyWithSymbol(expense.amount)}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
