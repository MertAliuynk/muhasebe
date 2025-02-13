"use client"

import React from "react"
import { UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"

import SaveManagerForm from "./save-manager-form"

export default function SaveManagerDrawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button size="sm">
          <UserPlus className="md:mr-2 size-4 flex-shrink-0" />
          <p className="hidden md:block">Yeni Yönetici Ekle</p>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="max-w-2xl mx-auto w-full">
          <SaveManagerForm />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
