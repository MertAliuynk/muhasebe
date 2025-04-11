"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { api } from "@/trpc/react"
import type { Patient } from "@prisma/client"
import { format } from "date-fns"
import { Clock } from "lucide-react"

import { formatCurrency, paymentTypeLabels } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import NewPaymentDialog from "@/components/new-payment-dialog"
import Spinner from "@/components/spinner"

import DeleteIncomeDialog from "./delete-income-dialog"

export default function Incomes() {
  const searchParams = useSearchParams()
  const date = searchParams.get("date")

  const { data: payments, isFetching } =
    api.payment.getAllPaymentsByDate.useQuery({
      date: date ?? format(new Date(), "yyyy-MM-dd"),
    })
  const { data: patients, isFetching: patientsIsFetching } =
    api.patient.getPatientsByBranch.useQuery()

  const isToday = date === format(new Date(), "yyyy-MM-dd")
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <div>
            <CardTitle className="text-lg sm:text-xl">Gelirler</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Bugün gelir akışı listeleniyor.
            </CardDescription>
          </div>
          <NewPaymentDialog
            patients={patients ?? []}
            isLoading={patientsIsFetching}
          />
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100vh-16rem)] overflow-y-auto">
        <div className="space-y-8 v">
          <div className="divide-y h-full">
            {isFetching || !payments ? (
              <Spinner className="mx-auto mt-20" />
            ) : payments.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground mt-20 underline">
                Herhangi bir gelir yok.
              </p>
            ) : (
              payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-2 sm:gap-0"
                >
                  <div>
                    <p className="font-medium text-sm sm:text-base">
                      {"patient" in payment ? (
                        <Link
                          href={`/hasta/${(payment.patient as Patient).id}`}
                          className="hover:underline"
                        >
                          {(payment.patient as Patient).name}
                        </Link>
                      ) : (
                        "Klinik Geliri"
                      )}
                    </p>
                    <div className="flex items-center gap-2 h-4">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {paymentTypeLabels[payment.paymentType]}
                      </p>{" "}
                      <Separator orientation="vertical" />
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {"doctorIncomes" in payment &&
                        payment.doctorIncomes &&
                        Array.isArray(payment.doctorIncomes) &&
                        payment.doctorIncomes.length > 0
                          ? payment.doctorIncomes[0]?.doctor?.user?.name
                          : ""}
                      </p>
                    </div>
                    {payment.note && (
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Not: {payment.note}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div>
                      <p className="font-medium text-sm sm:text-base">
                        {formatCurrency(payment.amount)}
                      </p>
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground justify-end">
                        <Clock size={14} />
                        {format(payment.createdAt, "HH:mm")}
                      </div>
                    </div>
                    {isToday && <DeleteIncomeDialog payment={payment} />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
