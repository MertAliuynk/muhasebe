"use client"

import { useState } from "react"
import { api, type RouterOutputs } from "@/trpc/react"
import type { Doctor, User } from "@prisma/client"
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
  expense: RouterOutputs["expense"]["getExpensesByBranchId"][number]
}

export default function DeleteExpenseDialog({ expense }: PageProps) {
  const utils = api.useUtils()
  const { mutateAsync: deleteExpense, isPending } =
    api.expense.deleteExpense.useMutation()

  const [isOpen, setIsOpen] = useState(false)

  const handleDelete = async () => {
    toast.promise(
      deleteExpense({
        id: expense.id,
        doctorId:
          "doctor" in expense ? (expense.doctor as Doctor).id : undefined,
      }).then(async () => {
        setIsOpen(false)
        await utils.expense.getExpensesByBranchId.invalidate()
        await utils.cashReport.getTodayCashReport.invalidate()
      }),
      {
        loading: "Gider siliniyor...",
        success: "Gider başarıyla silindi",
        error: "Gider silinirken bir hata oluştu",
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
          <DialogTitle>Gideri Sil</DialogTitle>
          <DialogDescription asChild>
            <div>
              <Badge>
                {"doctor" in expense
                  ? (expense.doctor as Doctor & { user: User }).user.name
                  : "Klinik Gideri"}{" "}
                {formatCurrencyWithSymbol(expense.amount)}
              </Badge>{" "}
              tutarındaki giderinizi silmek istediğinize emin misiniz? Bu işlem
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
