import type { RouterOutputs } from "@/trpc/react"
import { format } from "date-fns"
import { HandCoins } from "lucide-react"

import { formatCurrency, formatCurrencyWithSymbol } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type PageProps = {
  approvedPaymentPlan: RouterOutputs["paymentPlan"]["getPatientPaymentPlanById"][number]
}

export default function Instalments({ approvedPaymentPlan }: PageProps) {
  if (!approvedPaymentPlan)
    return (
      <p className="text-muted-foreground text-center">
        Onaylanmış <span className="underline">ödeme planı</span>{" "}
        bulunmamaktadır.
      </p>
    )

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <CardTitle>Taksitler</CardTitle>
            <CardDescription>
              Hasta için olan taksitler listeleniyor.
            </CardDescription>
          </div>
          <Button variant="outline">
            <HandCoins size={18} className="mr-2" />
            Yeni Ödeme Ekle
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div className="divide-y">
            <div className="grid grid-cols-3 items-center justify-between gap-4 text-muted-foreground">
              <p className="font-medium"></p>
              <p className="font-medium">Ödeme Tarihi</p>
              <p className="font-medium text-end">Tutar</p>
            </div>
            {approvedPaymentPlan.installments.map((instalment) => {
              const paidPercentage =
                (instalment.paidAmount * 100) / instalment.amount
              const isOverdue = new Date(instalment.dueDate) < new Date()
              const isPaid = paidPercentage === 100

              return (
                <div key={instalment.id} className="relative">
                  <div
                    className={
                      "grid grid-cols-3 items-center justify-between py-4"
                    }
                  >
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{instalment.number}.Taksit</p>
                      {paidPercentage > 0 && !isPaid && (
                        <span className="text-sm px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                          {formatCurrencyWithSymbol(instalment.paidAmount)}{" "}
                          Ödendi ( %{Math.round(paidPercentage)})
                        </span>
                      )}
                      {isOverdue && (
                        <span className="text-sm px-2 py-1 rounded-full bg-red-100 text-red-700">
                          Gecikmiş Ödeme
                        </span>
                      )}
                      {isPaid && (
                        <span className="text-sm px-2 py-1 rounded-full bg-green-100 text-green-700">
                          Tamamlandı
                        </span>
                      )}
                    </div>
                    <p className="font-medium">
                      {format(instalment.dueDate, "PPP EEEE")}
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
