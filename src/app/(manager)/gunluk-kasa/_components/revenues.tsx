"use client"

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
    patientName: "Ahmet Yılmaz",
    paymentType: "CASH",
    amount: 1500,
    date: new Date(),
  },
  {
    id: "2",
    patientName: "Ayşe Demir",
    paymentType: "CREDIT_CARD",
    amount: 2500,
    date: new Date(),
  },
  {
    id: "3",
    patientName: "Mehmet Kaya",
    paymentType: "BANK_TRANSFER",
    amount: 3000,
    date: new Date(),
  },
  {
    id: "4",
    patientName: "Fatma Şahin",
    paymentType: "CASH",
    amount: 1000,
    date: new Date(),
  },
  {
    id: "5",
    patientName: "Ali Öztürk",
    paymentType: "CREDIT_CARD",
    amount: 5000,
    date: new Date(),
  },
  {
    id: "6",
    patientName: "Zeynep Yıldız",
    paymentType: "BANK_TRANSFER",
    amount: 4500,
    date: new Date(),
  },
  {
    id: "7",
    patientName: "Mustafa Aydın",
    paymentType: "CASH",
    amount: 2000,
    date: new Date(),
  },
  {
    id: "8",
    patientName: "Elif Çelik",
    paymentType: "CREDIT_CARD",
    amount: 3500,
    date: new Date(),
  },
  {
    id: "9",
    patientName: "Hüseyin Kara",
    paymentType: "BANK_TRANSFER",
    amount: 6000,
    date: new Date(),
  },
  {
    id: "10",
    patientName: "Ayşe Yılmaz",
    paymentType: "CASH",
    amount: 1800,
    date: new Date(),
  },
  {
    id: "11",
    patientName: "Mehmet Demir",
    paymentType: "CREDIT_CARD",
    amount: 4200,
    date: new Date(),
  },
  {
    id: "12",
    patientName: "Fatma Öz",
    paymentType: "BANK_TRANSFER",
    amount: 2800,
    date: new Date(),
  },
  {
    id: "13",
    patientName: "Ali Şahin",
    paymentType: "CASH",
    amount: 3200,
    date: new Date(),
  },
  {
    id: "14",
    patientName: "Zeynep Kaya",
    paymentType: "CREDIT_CARD",
    amount: 5500,
    date: new Date(),
  },
  {
    id: "15",
    patientName: "Mustafa Yıldız",
    paymentType: "BANK_TRANSFER",
    amount: 4000,
    date: new Date(),
  },
]

export default function Revenues() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gelirler</CardTitle>
            <CardDescription>Bugün gelir akışı listeleniyor.</CardDescription>
          </div>
          <Button variant="outline">
            <HandCoins size={18} className="mr-2" />
            Yeni Gelir Ekle
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100vh-24rem)] overflow-y-auto no-scrollbar">
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
                <p className="font-medium">{formatCurrency(item.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
