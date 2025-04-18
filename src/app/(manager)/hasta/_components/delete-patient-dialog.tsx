"use client"

import { useState } from "react"
import { api, type RouterOutputs } from "@/trpc/react"
import type { TRPCError } from "@trpc/server"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenuItem,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu"

type Patient = RouterOutputs["patient"]["getPatientsByBranch"][number]

type Props = {
  patient: Patient
}

export default function DeletePatientDialog({ patient }: Props) {
  const utils = api.useUtils()
  const [isOpen, setIsOpen] = useState(false)

  const { mutateAsync, isPending } = api.patient.deletePatient.useMutation()

  const handleDelete = async () => {
    toast.promise(
      mutateAsync({ id: patient.id }).then(async () => {
        setIsOpen(false)
        await utils.invalidate()
      }),
      {
        loading: "Hasta siliniyor...",
        success: "Hasta başarıyla silindi.",
        error: (err: TRPCError) =>
          err.message || "Hasta silinirken bir hata oluştu.",
      }
    )
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem variant="destructive" modal>
          Sil
          <DropdownMenuShortcut>
            <Trash2 size={14} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hasta Sil</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium">{patient.name}</span> isimli hastayı
            silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>İptal</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            loading={isPending}
          >
            <Trash2 size={14} className="mr-2" />
            Sil
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
