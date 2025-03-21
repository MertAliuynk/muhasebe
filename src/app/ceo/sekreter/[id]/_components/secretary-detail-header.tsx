"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api, type RouterOutputs } from "@/trpc/react"
import { Trash } from "lucide-react"
import { toast } from "sonner"

import { getImageUrl } from "@/lib/utils"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

type Secretary = RouterOutputs["secretary"]["getSecretaryById"]

interface SecretaryDetailHeaderProps {
  secretary: Secretary
}

export function SecretaryDetailHeader({
  secretary,
}: SecretaryDetailHeaderProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const { mutate } = api.secretary.deleteSecretary.useMutation({
    onSuccess: () => {
      toast.success("Sekreter başarıyla silindi")
      router.push("/ceo/sekreter")
      router.refresh()
    },
    onError: (error) => {
      toast.error(error.message)
      setIsDeleting(false)
    },
  })

  const handleDelete = () => {
    setIsDeleting(true)
    mutate({ id: secretary.id })
  }

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Avatar className="size-20 rounded-xl">
          <AvatarImage
            src={getImageUrl(secretary.user.imagePath)}
            alt={secretary.user.name}
          />
          <AvatarFallback className="rounded-xl text-xl">
            {secretary.user.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold">{secretary.user.name}</h2>
          <p className="text-muted-foreground">{secretary.branch.name}</p>
        </div>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm">
            <Trash className="mr-2 size-4" />
            Sil
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sekreteri Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Bu sekreteri silmek istediğinizden emin
              misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Siliniyor..." : "Evet, Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
