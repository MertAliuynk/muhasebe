import React from "react"
import { type RouterOutputs } from "@/trpc/react"
import { format } from "date-fns"

import { parseDraftDoctorShares } from "@/lib/draft-doctor-shares"
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
  // Onaylı planda gerçek paylar, onaysız planda fiyat verirken girilen taslak paylar gösterilir
  const doctorShareRows = plan.isApproved
    ? plan.doctorShares.map((share) => ({
        id: share.id,
        name: share.doctor.user.name,
        totalAmount: share.totalAmount,
        paidAmount: share.paidAmount as number | null,
        remainingAmount: share.remainingAmount as number | null,
      }))
    : parseDraftDoctorShares(plan.draftDoctorShares).map((share) => ({
        id: share.doctorId,
        name:
          plan.patient.doctors.find((doctor) => doctor.id === share.doctorId)
            ?.user.name ?? "Hastadan çıkarılmış hekim",
        totalAmount: share.amount,
        paidAmount: null as number | null,
        remainingAmount: null as number | null,
      }))

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
          {doctorShareRows.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 text-lg font-medium">
                Hekim Payları
                {!plan.isApproved && (
                  <Badge variant="outline">Onay bekliyor</Badge>
                )}
              </h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="bg-muted-foreground/10 border border-muted-foreground/40 text-foreground">
                      Hekim
                    </TableHead>
                    <TableHead className="bg-muted-foreground/10 border border-muted-foreground/40 text-foreground">
                      Pay
                    </TableHead>
                    {plan.isApproved && (
                      <>
                        <TableHead className="bg-muted-foreground/10 border border-muted-foreground/40 text-foreground">
                          Tahsil Edilen
                        </TableHead>
                        <TableHead className="bg-muted-foreground/10 border border-muted-foreground/40 text-foreground">
                          Kalan
                        </TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctorShareRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="border border-muted-foreground/40">
                        {row.name}
                      </TableCell>
                      <TableCell className="border border-muted-foreground/40">
                        {formatCurrencyWithSymbol(row.totalAmount)}
                      </TableCell>
                      {plan.isApproved && (
                        <>
                          <TableCell className="border border-muted-foreground/40">
                            {formatCurrencyWithSymbol(row.paidAmount ?? 0)}
                          </TableCell>
                          <TableCell className="border border-muted-foreground/40">
                            {formatCurrencyWithSymbol(row.remainingAmount ?? 0)}
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
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
