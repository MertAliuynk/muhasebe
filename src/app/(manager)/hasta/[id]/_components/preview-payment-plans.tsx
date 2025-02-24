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

import columns from "./payment-plans-columuns"

type PageProps = {
  paymentPlans: RouterOutputs["paymentPlan"]["getPatientPaymentPlanById"]
}

export default function PreviewPaymentPlans({ paymentPlans }: PageProps) {
  const hasApprovedPaymentPlan = paymentPlans.some((plan) => plan.isApproved)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <CreditCard className="size-4 text-muted-foreground" />
          Ödeme Planları ({paymentPlans.length ?? 0})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Ödeme Planları</DialogTitle>
          <DialogDescription>
            Ödeme planlarını aşağıda görüntüleyebilirsiniz.
          </DialogDescription>
        </DialogHeader>
        <DataTable
          columns={columns(hasApprovedPaymentPlan)}
          data={paymentPlans}
        />
      </DialogContent>
    </Dialog>
  )
}
