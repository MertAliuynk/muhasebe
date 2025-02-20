import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

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

import { Button } from "./ui/button"

type PageProps = {
  children: React.ReactNode
  title: string
  description: string
  action: {
    mutateAsync: () => Promise<void>
    isPending: boolean
  }
}

export default function DeleteByIdDiaglog({
  children,
  title,
  description,
  action,
}: PageProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleDelete = async () => {
    toast.promise(
      action.mutateAsync().then(() => {
        setIsOpen(false)

        router.refresh()
      }),
      {
        loading: "Siliniyor...",
        success: "Silindi",
        error: "Silme işlemi başarısız oldu",
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">İptal</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            loading={action.isPending}
          >
            <Trash2 size={14} className="mr-2" />
            Sil
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
