"use client"

import React from "react"
import { useSearchParams } from "next/navigation"
import { api } from "@/trpc/react"
import { format } from "date-fns"

import { formatCurrencyWithSymbol, paymentTypeLabels } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Spinner from "@/components/spinner"

export default function DoctorIncomes({ doctorId }: { doctorId: string }) {
  const searchParams = useSearchParams()
  const dateParam = searchParams.get("date")

  let startDate: string | undefined
  let endDate: string | undefined

  if (dateParam) {
    const dates = dateParam.split(",")
    startDate = dates[0] || undefined
    endDate = dates[1] || undefined
  }
  const { data: incomes, isLoading } = api.doctor.getDoctorIncomes.useQuery({
    id: doctorId,
    startDate,
    endDate,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hekim Gelirleri</CardTitle>
        <CardDescription>
          Bu bölümde hekimin gelirlerini görebilirsiniz.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[calc(100vh-20rem)] overflow-y-auto no-scrollbar">
        <div className="grid grid-cols-[2fr_3fr_1fr] gap-4 text-sm text-muted-foreground">
          <p>Hasta</p>
          <p>Tarih</p>
          <p>Tutar</p>
        </div>
        <div className="divide-y">
          {isLoading ? (
            <Spinner className="mx-auto mt-20" />
          ) : incomes?.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground mt-20 underline">
              Herhangi bir gelir yok.
            </p>
          ) : (
            incomes?.map((income) => (
              <div
                key={income.id}
                className="grid grid-cols-[2fr_3fr_1fr] items-center gap-4 first:pt-2 py-4"
              >
                <div className=" items-center gap-2">
                  <p>{income.patientName}</p>
                  <p className="text-muted-foreground text-sm">
                    {paymentTypeLabels[income.paymentType]}
                  </p>
                </div>
                <p>{format(income.paymentDate, "PPP EEEE HH:mm")}</p>
                <p>{formatCurrencyWithSymbol(income.amount)}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
