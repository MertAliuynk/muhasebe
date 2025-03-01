"use client"

import { api, type RouterOutputs } from "@/trpc/react"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import {
  MoreVertical,
  Printer,
  ReceiptText,
  SquareCheckBig,
  Trash2,
} from "lucide-react"

import { formatCurrencyWithSymbol } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import DeleteByIdDiaglog from "@/components/delete-by-id-diaglog"

import ApprovedPaymentPlan from "./approved-payment-plan"
import PlanDetailView from "./plan-detail-view"
import { PrintPaymentPlan } from "./print-payment-plan"

type Item = RouterOutputs["paymentPlan"]["getPatientPaymentPlanById"][number]

export default function PaymentPlansColumns(hasApprovedPaymentPlan: boolean) {
  return [
    {
      accessorKey: "totalAmount",
      header: "Ödenecek Toplam Tutar",
      cell: ({ row }) => {
        const totalAmount = row.original.totalAmount
        return formatCurrencyWithSymbol(totalAmount)
      },
    },
    {
      accessorKey: "installmentCount",
      header: "Taksit Sayısı",
      cell: ({ row }) => {
        const installmentCount = row.original.installmentCount
        return installmentCount
      },
    },
    {
      accessorKey: "isApproved",
      header: "Durum",
      cell: ({ row }) => {
        const isApproved = row.original.isApproved
        return isApproved ? (
          <Badge variant="default">Onaylandı</Badge>
        ) : (
          <Badge variant="outline">Onaylanmadı</Badge>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Oluşturulma Tarihi",
      cell: ({ row }) => {
        const createdAt = row.original.createdAt
        return format(createdAt, "PPP EEEE")
      },
      side: "end",
    },
    {
      accessorKey: "actions",
      header: "",
      cell: ({ row }) => {
        const { mutateAsync, isPending } =
          api.paymentPlan.deleteById.useMutation()
        const data = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {!hasApprovedPaymentPlan && (
                <ApprovedPaymentPlan data={data}>
                  <DropdownMenuItem modal>
                    İşleme Al
                    <DropdownMenuShortcut>
                      <SquareCheckBig size={14} />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                </ApprovedPaymentPlan>
              )}
              <PrintPaymentPlan
                data={{
                  patientName: data.patient.name,
                  totalAmount: data.totalAmount,
                  installmentCount: data.installmentCount,
                  startDate: data.startDate,
                  installments: data.installments.map((installment) => ({
                    date: installment.dueDate,
                    amount: installment.amount,
                  })),
                }}
              >
                <DropdownMenuItem modal>
                  Yazdır
                  <DropdownMenuShortcut>
                    <Printer size={14} />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </PrintPaymentPlan>
              <PlanDetailView plan={data}>
                <DropdownMenuItem modal>
                  Detaylı Görüntüle
                  <DropdownMenuShortcut>
                    <ReceiptText size={14} />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </PlanDetailView>
              <DeleteByIdDiaglog
                title="Ödeme Planı Sil"
                description="Bu ödeme planını silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
                action={{
                  mutateAsync: async () => {
                    await mutateAsync({ id: data.id })
                    return
                  },
                  isPending,
                }}
              >
                <DropdownMenuItem variant="destructive" modal>
                  Sil
                  <DropdownMenuShortcut>
                    <Trash2 size={14} />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </DeleteByIdDiaglog>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      side: "end",
      size: "10",
    },
  ] as ColumnDef<Item>[]
}
