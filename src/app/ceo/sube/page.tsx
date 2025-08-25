import React from "react"
import { api } from "@/trpc/server"

import { DashboardHeader } from "@/components/dashboard-heading"
import { DataTable } from "@/components/data-table"

import columns from "./_components/branch-columns"
import SaveBranchDialog from "./_components/save-branch-dialog"

export default async function page() {
  const result = await api.branch.getAll()
  const branches = result.branches

  return (
    <div className="space-y-5">
      <DashboardHeader heading="Şubeler" text="Şubeleri listeleyin ve yönetin.">
        <SaveBranchDialog />
      </DashboardHeader>

      <DataTable columns={columns} data={branches} />
    </div>
  )
}
