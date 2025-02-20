import React from "react"
import { api } from "@/trpc/server"

import { DashboardHeader } from "@/components/dashboard-heading"
import { DataTable } from "@/components/data-table"

import columns from "./_components/expense-type-columns"
import SaveExpenseTypeDrawer from "./_components/save-expense-type-drawer"

export default async function page() {
  const expenseTypes = await api.expense.getAllExpenseTypes()

  return (
    <div className="space-y-5">
      <DashboardHeader
        heading="Gider Kalemleri"
        text="Gider kalemlerini listeleyin ve yönetin."
      >
        <SaveExpenseTypeDrawer />
      </DashboardHeader>

      <DataTable columns={columns} data={expenseTypes} />
    </div>
  )
}
