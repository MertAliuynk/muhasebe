"use client"

import React from "react"
import { type RouterOutputs } from "@/trpc/react"
import { UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

import SaveManagerForm from "./save-manager-form"

type User = RouterOutputs["user"]["getUsers"][number]

interface SaveManagerDialogProps {
  user?: User
  trigger?: React.ReactNode
}

export default function SaveManagerDialog({
  user,
  trigger,
}: SaveManagerDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <UserPlus className="md:mr-2 size-4 flex-shrink-0" />
            <p className="hidden md:block">Yeni Yönetici Ekle</p>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <div className="max-w-2xl mx-auto w-full">
          <SaveManagerForm user={user} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
