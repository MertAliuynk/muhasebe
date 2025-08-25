"use client"

import React, { useState } from "react"
import { type RouterOutputs } from "@/trpc/react"
import { HousePlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import SaveBranchForm from "./save-branch-form"

type Branch = RouterOutputs["branch"]["getAll"]["branches"][number]

interface SaveBranchDialogProps {
  branch?: Branch
  trigger?: React.ReactNode
}

export default function SaveBranchDialog({
  branch,
  trigger,
}: SaveBranchDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <HousePlus className="md:mr-2 size-4 flex-shrink-0" />
            <p className="hidden md:block">Yeni Şube Ekle</p>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className={branch ? "" : "sr-only"}>
          <DialogTitle>
            {branch ? "Şube Bilgilerini Düzenle" : "Yeni Şube Ekle"}
          </DialogTitle>
          <DialogDescription>
            {branch
              ? "Şubenin adı, adresi, telefonu ve yöneticisi gibi temel bilgilerini düzenleyebilirsiniz."
              : "Yeni bir şube oluşturmak için bilgileri giriniz."}
          </DialogDescription>
        </DialogHeader>
        <div className="max-w-2xl mx-auto">
          <SaveBranchForm setIsOpen={setIsOpen} branch={branch} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
