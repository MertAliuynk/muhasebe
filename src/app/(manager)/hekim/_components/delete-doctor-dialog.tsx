"use client"

import { useState } from "react"
import { api } from "@/trpc/react"
import type { Doctor, Patient, User } from "@prisma/client"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
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

interface DoctorWithDetails extends User {
  doctor:
    | (Doctor & {
        patients: Patient[]
      })
    | null
}

type Props = {
  doctor: DoctorWithDetails
  onSuccess?: () => void
}

export default function DeleteDoctorDialog({ doctor, onSuccess }: Props) {
  const utils = api.useUtils()
  const [isOpen, setIsOpen] = useState(false)

  const { mutateAsync, isPending } = api.doctor.deleteDoctor.useMutation()

  const handleDelete = async () => {
    toast.promise(
      mutateAsync({ id: doctor.doctor?.id || "" }).then(async () => {
        setIsOpen(false)
        await utils.doctor.getDoctorsByBranch.invalidate()
        if (onSuccess) onSuccess()
      }),
      {
        loading: "Hekim siliniyor...",
        success: "Hekim başarıyla silindi.",
        error: "Hekim silinirken bir hata oluştu.",
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
          <AlertDialogTitle>Hekim Sil</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium">{doctor.name}</span> isimli hekimi
            silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>İptal</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Siliniyor..." : "Sil"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
