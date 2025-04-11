"use client"

import { useState } from "react"
import { api, type RouterOutputs } from "@/trpc/react"
import type { Patient } from "@prisma/client"
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
        setIsOpen(false)
        await utils.invalidate()
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
        <Button variant="outline" size="icon" className="size-7 sm:size-8">
          <Trash2 size={14} className="sm:size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Geliri Sil</DialogTitle>
          <DialogDescription asChild>
            <div className="text-xs sm:text-sm mt-1">
              <Badge className="text-xs sm:text-sm">
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
        <DialogFooter className="sm:justify-end gap-2">
          <DialogClose asChild>
            <Button
              variant="outline"
              className="text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10"
            >
              İptal
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            loading={isPending}
            className="text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10"
          >
            <Trash2 size={14} className="mr-2" />
            Sil
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
