import React from "react"
import { type RouterOutputs } from "@/trpc/react"
import { Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DataTable } from "@/components/data-table"

import columns from "./payment-detail-columuns"

type PageProps = {
  payments: RouterOutputs["payment"]["getAllPaymentsByPatientId"]
}

export default function PaymentDetailDialog({ payments }: PageProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          <Info size={18} className="mr-2" />
          Ödeme Detayı Görüntüle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Ödeme Detayı</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <DataTable columns={columns} data={payments} />
      </DialogContent>
    </Dialog>
  )
}
