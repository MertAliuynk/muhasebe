"use client"

import React from "react"
import { api } from "@/trpc/react"
import { UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DashboardHeader } from "@/components/dashboard-heading"
import { DataTable } from "@/components/data-table"

import { AddSecretaryDialog } from "./_components/add-secretary-dialog"
import columns from "./_components/secretaries-columns"

export default function SecretariesPage() {
  const { data: secretaries = [] } =
    api.secretary.getSecretariesAdmin.useQuery()

  return (
    <div className="space-y-5">
      <DashboardHeader
        heading="Sekreterler"
        text="Sekreterleri listeleyin ve yönetin."
      >
        <AddSecretaryDialog
          trigger={
            <Button size="sm">
              <UserPlus className="size-4 mr-2" />
              Yeni Sekreter Ekle
            </Button>
          }
        />
      </DashboardHeader>
      <DataTable
        columns={columns}
        data={secretaries}
        searchKey="name"
        viewOption
      />
    </div>
  )
}
