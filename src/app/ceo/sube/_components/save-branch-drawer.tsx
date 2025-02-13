import React from "react"
import { HousePlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"

import SaveBranchForm from "./save-branch-form"

export default function SaveBranchDrawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button size="sm">
          <HousePlus className="md:mr-2 size-4 flex-shrink-0" />
          <p className="hidden md:block">Yeni Şube Ekle</p>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="max-w-2xl mx-auto w-full">
          <SaveBranchForm />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
