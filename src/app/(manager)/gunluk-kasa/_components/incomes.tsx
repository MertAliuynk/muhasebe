import Link from "next/link"
import { api } from "@/trpc/server"
import { type Patient } from "@prisma/client"
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
import NewPaymentDialog from "@/components/new-payment-dialog"

export default async function Incomes({ date }: { date: string }) {
  const payments = await api.payment.getAllPaymentsByDate({
    date,
  })

  const patients = await api.patient.getPatientsByBranch()
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gelirler</CardTitle>
            <CardDescription>Bugün gelir akışı listeleniyor.</CardDescription>
          </div>
          <NewPaymentDialog patients={patients} />
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100vh-24rem)] overflow-y-auto no-scrollbar">
        <div className="space-y-8">
          <div className="divide-y">
            {payments.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-4"
              >
                <div>
                  <p className="font-medium">
                    {"patient" in item ? (
                      <Link
                        href={`/hasta/${(item.patient as Patient).id}`}
                        className="hover:underline"
                      >
                        {(item.patient as Patient).name}
                      </Link>
                    ) : (
                      "Klinik Geliri"
                    )}
                  </p>
                  <div className="flex items-center gap-2 h-4">
                    <p className="text-sm text-muted-foreground">
                      {paymentTypeLabels[item.paymentType]}
                    </p>
                  </div>
                  {item.note && (
                    <p className="text-sm text-muted-foreground">
                      Not: {item.note}
                    </p>
                  )}
                </div>
                <div>
                  <p className="font-medium">{formatCurrency(item.amount)}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground justify-end">
                    <Clock size={14} />
                    {format(item.createdAt, "HH:mm")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
