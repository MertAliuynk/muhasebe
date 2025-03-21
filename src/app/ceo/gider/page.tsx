import React from "react"
import { api } from "@/trpc/server"

import { DashboardHeader } from "@/components/dashboard-heading"
import { DataTable } from "@/components/data-table"

import columns from "./_components/expense-type-columns"
import SaveExpenseTypeDialog from "./_components/save-expense-type-dialog"

export default async function page() {
  const expenseTypes = await api.expense.getAllExpenseTypes()

  return (
    <div className="space-y-5">
      <DashboardHeader
        heading="Gider Kalemleri"
        text="Gider kalemlerini listeleyin ve yönetin."
      >
        <SaveExpenseTypeDialog />
      </DashboardHeader>

      <DataTable
        columns={columns}
        data={expenseTypes}
        pagination
        searchKey="name"
      />
    </div>
  )
}
