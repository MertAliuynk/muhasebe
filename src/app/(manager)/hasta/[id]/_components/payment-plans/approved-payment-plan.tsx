import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/trpc/react"
import { TRPCClientError } from "@trpc/client"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type PageProps = {
  children: React.ReactNode
  id: string
}

export default function ApprovedPaymentPlan({ children, id }: PageProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const { mutateAsync: approvePaymentPlan, isPending } =
    api.paymentPlan.approvePlan.useMutation()

  const handleApprovePaymentPlan = async () => {
    try {
      await approvePaymentPlan({ id })
      router.refresh()
      setIsOpen(false)
    } catch (error: unknown) {
      if (error instanceof TRPCClientError) {
        toast.error(error.message)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ödeme Planı Onayla</DialogTitle>
          <DialogDescription>
            Bu işlem sonrası ödeme planı onaylanacaktır.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">İptal</Button>
          </DialogClose>
          <Button onClick={handleApprovePaymentPlan} loading={isPending}>
            Onayla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
