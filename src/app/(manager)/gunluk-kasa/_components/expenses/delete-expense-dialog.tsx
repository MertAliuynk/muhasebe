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
        <Button variant="outline" size="icon" className="size-7 sm:size-8">
          <Trash2 size={14} className="sm:size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Gideri Sil</DialogTitle>
          <DialogDescription asChild>
            <div className="text-xs sm:text-sm mt-1">
              <Badge className="text-xs sm:text-sm">
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
