import React from "react"
import { api } from "@/trpc/server"
import { UserRole } from "@prisma/client"

import { DashboardHeader } from "@/components/dashboard-heading"
import { DataTable } from "@/components/data-table"

import columns from "./_components/managers-columns"
import SaveManagerDrawer from "./_components/save-manager-drawer"

export default async function page() {
  const managers = await api.user.getUsers({
    where: {
      role: UserRole.MANAGER,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="space-y-5">
      <DashboardHeader
        heading="Yöneticiler"
        text="Yöneticileri listeleyin ve yönetin."
      >
        <SaveManagerDrawer />
      </DashboardHeader>

      <DataTable
        columns={columns}
        data={managers}
        searchKey="name"
        viewOption
      />
    </div>
  )
}
