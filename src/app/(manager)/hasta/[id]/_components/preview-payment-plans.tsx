import React from "react"
import type { RouterOutputs } from "@/trpc/react"
import { CreditCard } from "lucide-react"

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

import columns from "./patient-payment-plans-columuns"

type PageProps = {
  paymentPlans: NonNullable<
    RouterOutputs["patient"]["getPatientById"]
  >["paymentPlan"]
}

export default function PreviewPaymentPlans({ paymentPlans }: PageProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <CreditCard className="size-4 text-muted-foreground" />
          Ödeme Planları ({paymentPlans?.length ?? 0})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Ödeme Planları</DialogTitle>
          <DialogDescription>
            Ödeme planlarını aşağıda görüntüleyebilirsiniz.
          </DialogDescription>
        </DialogHeader>
        <DataTable columns={columns} data={paymentPlans} />
      </DialogContent>
    </Dialog>
  )
}
