"use client"

import React, { useState } from "react"
import type { ExpenseType } from "@prisma/client"
import { NotebookPen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

import SaveExpenseTypeForm from "./save-expense-type-form"

interface SaveExpenseTypeDialogProps {
  expenseType?: ExpenseType
  trigger?: React.ReactNode
}

export default function SaveExpenseTypeDialog({
  expenseType,
  trigger,
}: SaveExpenseTypeDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <NotebookPen className="md:mr-2 size-4 flex-shrink-0" />
            <p className="hidden md:block">Yeni Gider Kalem Ekle</p>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <SaveExpenseTypeForm expenseType={expenseType} setIsOpen={setIsOpen} />
      </DialogContent>
    </Dialog>
  )
}
