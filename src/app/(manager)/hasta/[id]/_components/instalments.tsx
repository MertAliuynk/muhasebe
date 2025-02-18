"use client"

import { format } from "date-fns"
import { HandCoins } from "lucide-react"

import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type PaymentType = "CASH" | "CREDIT_CARD" | "BANK_TRANSFER"

const paymentTypeLabels: Record<PaymentType, string> = {
  CASH: "Nakit",
  CREDIT_CARD: "Kredi Kartı",
  BANK_TRANSFER: "Havale/EFT",
}

const revenueData: Array<{
  id: string
  patientName: string
  paymentType: PaymentType
  amount: number
  date: Date
}> = [
  {
    id: "1",
    patientName: "6.Taksit",
    paymentType: "CASH",
    amount: 1500,
    date: new Date(),
  },
  {
    id: "2",
    patientName: "5.Taksit",
    paymentType: "CREDIT_CARD",
    amount: 2500,
    date: new Date(),
  },
  {
    id: "3",
    patientName: "4.Taksit",
    paymentType: "BANK_TRANSFER",
    amount: 3000,
    date: new Date(),
  },
  {
    id: "4",
    patientName: "3.Taksit",
    paymentType: "CASH",
    amount: 1000,
    date: new Date(),
  },
  {
    id: "5",
    patientName: "2.Taksit",
    paymentType: "CREDIT_CARD",
    amount: 5000,
    date: new Date(),
  },
  {
    id: "6",
    patientName: "1.Taksit",
    paymentType: "BANK_TRANSFER",
    amount: 4500,
    date: new Date(),
  },
]

export default function Instalments() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Taksitler</CardTitle>
            <CardDescription>
              Hasta için olan taksitler listeleniyor.
            </CardDescription>
          </div>
          <Button variant="outline">
            <HandCoins size={18} className="mr-2" />
            Yeni Gelir Ekle
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div className="divide-y">
            {revenueData.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-4"
              >
                <div>
                  <p className="font-medium">{item.patientName}</p>
                  <p className="text-sm text-muted-foreground">
                    {paymentTypeLabels[item.paymentType]}
                  </p>
                </div>
                <p className="font-medium">{format(item.date, "PPP EEEE")}</p>
                <p className="font-medium">{formatCurrency(item.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
