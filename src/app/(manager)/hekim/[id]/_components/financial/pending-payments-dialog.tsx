"use client"

import React from "react"
import { useSearchParams } from "next/navigation"
import { api } from "@/trpc/react"
import { parse } from "date-fns"
import { tr } from "date-fns/locale"

import { formatCurrencyWithSymbol } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DataTable } from "@/components/data-table"
// import { DatePickerWithRange } from "@/components/date-picker-with-range"
import Spinner from "@/components/spinner"

import columns from "./pending-payments-columuns"

type PageProps = {
  doctorId: string
  children: React.ReactNode
}

export default function PendingPaymentsDialog({
  doctorId,
  children,
}: PageProps) {
  const searchParams = useSearchParams()
  const dateParam = searchParams.get("date")

  let startDate: string | undefined
  let endDate: string | undefined

  if (dateParam) {
    const dates = dateParam.split(",")
    startDate = dates[0] || undefined
    endDate = dates[1] || undefined
  }

  const { data: pendingPayments, isLoading } =
    api.doctor.getDoctorPendingPayments.useQuery({
      doctorId,
      startDate,
      endDate,
    })

  const totalRemainingAmount =
    pendingPayments?.reduce(
      (acc, payment) => acc + payment.remainingAmount,
      0
    ) || 0

  // Tüm aylık ödemeleri birleştir
  const allMonthlyPayments =
    pendingPayments?.reduce(
      (acc, payment) => {
        payment.monthlyPayments.forEach((monthlyPayment) => {
          const existingMonth = acc.find(
            (m) => m.month === monthlyPayment.month
          )
          if (existingMonth) {
            existingMonth.amount += monthlyPayment.amount
            existingMonth.count += monthlyPayment.count
          } else {
            acc.push({
              month: monthlyPayment.month,
              amount: monthlyPayment.amount,
              count: monthlyPayment.count,
            })
          }
        })
        return acc
      },
      [] as { month: string; amount: number; count: number }[]
    ) || []

  // Ayları sırala
  allMonthlyPayments.sort((a, b) => {
    // "Mart 2024" formatındaki string'i Date objesine çevir
    const dateA = parse(a.month, "MMMM yyyy", new Date(), { locale: tr })
    const dateB = parse(b.month, "MMMM yyyy", new Date(), { locale: tr })
    return dateA.getTime() - dateB.getTime()
  })

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Bekleyen Ödemeler</DialogTitle>
          <DialogDescription>
            Doktorun hastalarına ait bekleyen ödemeler listesi
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between mb-4">
          {/* <DatePickerWithRange
            locale={tr}
            className="w-[300px]"
            placeholder="Tarih aralığı seçin"
          /> */}
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-end">
              <div className="text-lg font-semibold">
                Toplam Bekleyen Tutar:{" "}
                {formatCurrencyWithSymbol(totalRemainingAmount)}
              </div>
            </div>
            <DataTable columns={columns} data={pendingPayments || []} />

            <Card>
              <CardHeader>
                <CardTitle>Aylık Ödemeler</CardTitle>
                <CardDescription>
                  Gösterilen tutarlar ortalama tutarlardır. Aylık ortalama:{" "}
                  {formatCurrencyWithSymbol(
                    totalRemainingAmount / allMonthlyPayments.length
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allMonthlyPayments.map((payment) => (
                    <div
                      key={payment.month}
                      className="p-4 border rounded-lg bg-muted/50"
                    >
                      <div className="font-medium">{payment.month}</div>
                      <div className="text-lg font-semibold">
                        {formatCurrencyWithSymbol(payment.amount)}
                      </div>
                      {payment.count > 1 && (
                        <div className="text-sm text-muted-foreground">
                          {payment.count} taksit
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
