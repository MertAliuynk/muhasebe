"use client"

import { FileInput } from "lucide-react"

import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Dummy data
const expenseData: Array<{
  id: string
  description: string
  expenseType: string
  amount: number
  date: Date
}> = [
  {
    id: "1",
    description: "Kırtasiye Malzemeleri",
    expenseType: "Ofis Giderleri",
    amount: 500,
    date: new Date(),
  },
  {
    id: "2",
    description: "İnternet Faturası",
    expenseType: "Sabit Giderler",
    amount: 800,
    date: new Date(),
  },
  {
    id: "3",
    description: "Temizlik Malzemeleri",
    expenseType: "Ofis Giderleri",
    amount: 300,
    date: new Date(),
  },
  {
    id: "4",
    description: "Su Faturası",
    expenseType: "Sabit Giderler",
    amount: 200,
    date: new Date(),
  },
  {
    id: "5",
    description: "Tıbbi Malzemeler",
    expenseType: "Medikal Giderler",
    amount: 1500,
    date: new Date(),
  },
  {
    id: "6",
    description: "Elektrik Faturası",
    expenseType: "Sabit Giderler",
    amount: 1200,
    date: new Date(),
  },
  {
    id: "7",
    description: "Personel Yemek",
    expenseType: "Personel Giderleri",
    amount: 2000,
    date: new Date(),
  },
  {
    id: "8",
    description: "Yazılım Lisansı",
    expenseType: "IT Giderleri",
    amount: 3500,
    date: new Date(),
  },
  {
    id: "9",
    description: "Bakım Onarım",
    expenseType: "Teknik Giderler",
    amount: 750,
    date: new Date(),
  },
  {
    id: "10",
    description: "Sigorta Ödemesi",
    expenseType: "Sabit Giderler",
    amount: 2500,
    date: new Date(),
  },
  {
    id: "11",
    description: "Reklam Giderleri",
    expenseType: "Pazarlama",
    amount: 1800,
    date: new Date(),
  },
  {
    id: "12",
    description: "Kargo Giderleri",
    expenseType: "Operasyonel",
    amount: 400,
    date: new Date(),
  },
  {
    id: "13",
    description: "Eğitim Materyalleri",
    expenseType: "Personel Giderleri",
    amount: 600,
    date: new Date(),
  },
  {
    id: "14",
    description: "Güvenlik Sistemi",
    expenseType: "Teknik Giderler",
    amount: 4000,
    date: new Date(),
  },
  {
    id: "15",
    description: "Mobilya Yenileme",
    expenseType: "Ofis Giderleri",
    amount: 5000,
    date: new Date(),
  },
]

export default function Expenses() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Giderler</CardTitle>
            <CardDescription>Bugün gider akışı listeleniyor.</CardDescription>
          </div>
          <Button variant="outline">
            <FileInput size={18} className=" mr-2" />
            Yeni Gider Ekle
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100vh-24rem)] overflow-y-auto no-scrollbar">
        <div className="space-y-8">
          <div className="divide-y">
            {expenseData.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-4"
              >
                <div>
                  <p className="font-medium">{item.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.expenseType}
                  </p>
                </div>
                <p className="font-medium text-destructive">
                  {formatCurrency(item.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
