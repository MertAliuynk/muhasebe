"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api, type RouterOutputs } from "@/trpc/react"
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
import {
  DropdownMenuItem,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu"

type PageProps = {
  payment: RouterOutputs["payment"]["getAllPaymentsByDate"][number]
}

export default function DeletePatientPaymentDialog({ payment }: PageProps) {
  const router = useRouter()
  const { mutateAsync: deletePayment, isPending } =
    api.payment.deletePayment.useMutation()

  const [isOpen, setIsOpen] = useState(false)

  const handleDelete = async () => {
    toast.promise(
      deletePayment({
        id: payment.id,
        whereToPay: "patient",
        patientId: payment.id,
      }).then(async () => {
        setIsOpen(false)
        router.refresh()
      }),
      {
        loading: "Ödeme siliniyor...",
        success: "Ödeme başarıyla silindi",
        error: "Ödeme silinirken bir hata oluştu",
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem modal variant="destructive">
          Sil
          <DropdownMenuShortcut>
            <Trash2 size={14} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ödemeyi Sil</DialogTitle>
          <DialogDescription asChild>
            <div>
              <Badge>{formatCurrencyWithSymbol(payment.amount)}</Badge>{" "}
              tutarındaki ödemeyi silmek istediğinize emin misiniz? Bu işlem
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
