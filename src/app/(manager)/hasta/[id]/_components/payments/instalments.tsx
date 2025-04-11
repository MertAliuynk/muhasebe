import type { RouterOutputs } from "@/trpc/react"
import { format } from "date-fns"

import { formatCurrency, formatCurrencyWithSymbol } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import PrintInstalments from "./print-instalments"

type PageProps = {
  approvedPaymentPlan: RouterOutputs["paymentPlan"]["getPatientPaymentPlanById"][number]
  payments: RouterOutputs["payment"]["getAllPaymentsByPatientId"]
}

export default function Instalments({
  payments,
  approvedPaymentPlan,
}: PageProps) {
  if (!approvedPaymentPlan)
    return (
      <p className="text-muted-foreground text-center">
        Onaylanmış <span className="underline">ödeme planı</span>{" "}
        bulunmamaktadır.
      </p>
    )

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <div className="flex justify-between">
          <div>
            <CardTitle>Taksitler</CardTitle>
            <CardDescription>
              Hasta için olan taksitler listeleniyor.
            </CardDescription>
          </div>
        </div>
        <PrintInstalments
          payments={payments}
          patientName={approvedPaymentPlan.patient.name}
          instalments={approvedPaymentPlan.installments}
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div className="divide-y">
            <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] items-center justify-between text-muted-foreground">
              <p className="font-medium hidden md:block">Ödeme Tarihi</p>
              <p className="font-medium hidden md:block">Taksit Ödeme Tarihi</p>
              <p className="font-medium hidden md:block">
                En Son Ödeme Yapılan Tarih
              </p>
              <p className="font-medium text-end hidden md:block">Tutar</p>
            </div>
            {approvedPaymentPlan.installments.map((instalment) => {
              const paidPercentage =
                (instalment.paidAmount * 100) / instalment.amount
              const isOverdue = new Date(instalment.dueDate) < new Date()
              const isCompleted = instalment.isCompleted

              return (
                <div key={instalment.id} className="relative">
                  <div
                    className={
                      "grid grid-cols-[1.5fr_1fr_1fr_1fr] items-center justify-between py-4"
                    }
                  >
                    <div className="flex items-center gap-5">
                      <p className="font-medium">{instalment.number}.Taksit</p>
                      <div className="flex flex-col gap-1">
                        {isOverdue && !isCompleted && (
                          <span className="text-sm px-2 py-1 rounded-full bg-red-100 text-red-700 text-center">
                            Gecikmiş Ödeme
                          </span>
                        )}
                        {paidPercentage > 0 && !isCompleted && (
                          <span className="text-sm px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                            {formatCurrencyWithSymbol(instalment.paidAmount)}{" "}
                            Ödendi ( %{Math.round(paidPercentage)})
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-sm px-2 py-1 rounded-full bg-green-100 text-green-700">
                            Tamamlandı
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="font-medium hidden md:block">
                      {format(instalment.dueDate, "PPP EEEE")}
                    </p>
                    <p className="font-medium hidden md:block">
                      {instalment.lastPaymentDate ? (
                        format(instalment.lastPaymentDate, "PPP EEEE HH:mm")
                      ) : (
                        <span className="text-red-400">
                          Henüz ödeme yapılmadı
                        </span>
                      )}
                    </p>
                    <p className="font-medium text-end">
                      {formatCurrency(instalment.amount)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
