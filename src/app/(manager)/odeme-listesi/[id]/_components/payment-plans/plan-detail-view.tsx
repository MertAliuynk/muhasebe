import React from "react"
import { type RouterOutputs } from "@/trpc/react"
import { format } from "date-fns"

import { formatCurrencyWithSymbol } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type PageProps = {
  children: React.ReactNode
  plan: RouterOutputs["paymentPlan"]["getPatientPaymentPlanById"][number]
}

export default function PlanDetailView({ children, plan }: PageProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div>Ödeme Planı Detayı</div>
            <Badge>{plan.patient.name}</Badge>
          </DialogTitle>
          <DialogDescription className="sr-only">
            adlı hasta için oluşturulan ödeme planının detayı.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-10">
          <div className="border border-muted-foreground/40 p-4">
            <div className="text-lg font-medium">Not</div>
            <p className="text-sm underline">
              {plan.note || "Herangi bir not belirtilmemiş."}
            </p>
          </div>
          <div>
            <h2 className="text-lg font-medium">Genel Bilgiler</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="bg-muted-foreground/10 border border-muted-foreground/40 text-foreground">
                    Tutar
                  </TableHead>
                  <TableHead className="bg-muted-foreground/10 border border-muted-foreground/40 text-foreground">
                    Faiz Oranı
                  </TableHead>
                  <TableHead className="bg-muted-foreground/10 border border-muted-foreground/40 text-foreground">
                    Taksit Sayısı
                  </TableHead>
                  <TableHead className="bg-muted-foreground/10 border border-muted-foreground/40 text-foreground">
                    Toplam Ödenecek Tutar
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="border border-muted-foreground/40">
                    {formatCurrencyWithSymbol(plan.originalAmount)}
                  </TableCell>
                  <TableCell className="border border-muted-foreground/40">
                    {plan.interestRate}%
                  </TableCell>
                  <TableCell className="border border-muted-foreground/40">
                    {plan.installmentCount}
                  </TableCell>
                  <TableCell className="border border-muted-foreground/40">
                    {formatCurrencyWithSymbol(plan.totalAmount)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div>
            <h2 className="text-lg font-medium">Taksit Bilgileri</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="bg-muted-foreground/10 border border-muted-foreground/40 text-foreground">
                    Taksit No
                  </TableHead>
                  <TableHead className="bg-muted-foreground/10 border border-muted-foreground/40 text-foreground">
                    Taksit Tarihi
                  </TableHead>
                  <TableHead className="bg-muted-foreground/10 border border-muted-foreground/40 text-foreground">
                    Taksit Tutarı
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plan.installments.map((installment, index) => (
                  <TableRow key={installment.id}>
                    <TableCell className="border border-muted-foreground/40">
                      {index + 1}
                    </TableCell>
                    <TableCell className="border border-muted-foreground/40">
                      {format(new Date(installment.dueDate), "PPP")}
                    </TableCell>
                    <TableCell className="border border-muted-foreground/40">
                      {formatCurrencyWithSymbol(installment.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end">
            <div className="flex gap-2 text-end text-sm">
              <p className="font-bold">Toplam Ödenecek Tutar:</p>
              <p>{formatCurrencyWithSymbol(plan.totalAmount)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
