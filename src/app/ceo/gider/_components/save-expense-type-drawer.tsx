import React from "react"
import { NotebookPen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"

import SaveExpenseTypeForm from "./save-expense-type-form"

export default function SaveExpenseTypeDrawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button size="sm">
          <NotebookPen className="md:mr-2 size-4 flex-shrink-0" />
          <p className="hidden md:block">Yeni Gider Kalem Ekle</p>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="max-w-2xl mx-auto w-full">
          <SaveExpenseTypeForm />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
