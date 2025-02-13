import React from "react"
import { api } from "@/trpc/server"

import { DashboardHeader } from "@/components/dashboard-heading"
import { DataTable } from "@/components/data-table"

import columns from "./_components/branch-columns"
import SaveBranchDrawer from "./_components/save-branch-drawer"

export default async function page() {
  const branches = await api.branch.getAll()

  return (
    <div className="space-y-5">
      <DashboardHeader heading="Şubeler" text="Şubeleri listeleyin ve yönetin.">
        <SaveBranchDrawer />
      </DashboardHeader>

      <DataTable columns={columns} data={branches} />
    </div>
  )
}
