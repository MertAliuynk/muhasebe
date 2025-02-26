"use client"

import { useState } from "react"
import { api, type RouterOutputs } from "@/trpc/react"
import { type Patient } from "@prisma/client"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

import { formatCurrencyWithSymbol } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
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
  payment: RouterOutputs["payment"]["getAllPaymentsByDate"][number]
}

export default function DeleteIncomeDialog({ payment }: PageProps) {
  const utils = api.useUtils()
  const { mutateAsync: deletePayment, isPending } =
    api.payment.deletePayment.useMutation()

  const [isOpen, setIsOpen] = useState(false)

  const handleDelete = async () => {
    toast.promise(
      deletePayment({
        id: payment.id,
        whereToPay: "patient" in payment ? "patient" : "branch",
        patientId:
          "patient" in payment ? (payment.patient as Patient).id : undefined,
      }).then(async () => {
        await utils.payment.getAllPaymentsByDate.invalidate()
        setIsOpen(false)
      }),
      {
        loading: "Gelir siliniyor...",
        success: "Gelir başarıyla silindi",
        error: "Gelir silinirken bir hata oluştu",
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="size-8">
          <Trash2 size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Geliri Sil</DialogTitle>
          <DialogDescription asChild>
            <div>
              <Badge>
                {"patient" in payment
                  ? (payment.patient as Patient).name
                  : "Klinik Geliri"}{" "}
                {formatCurrencyWithSymbol(payment.amount)}
              </Badge>{" "}
              tutarındaki gelirinizi silmek istediğinize emin misiniz? Bu işlem
              geri alınamaz.
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">İptal</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            loading={isPending}
          >
            <Trash2 size={14} className="mr-2" />
            Sil
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
