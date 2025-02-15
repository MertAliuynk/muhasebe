import React from "react"
import { api } from "@/trpc/server"

import { DashboardHeader } from "@/components/dashboard-heading"
import { DataTable } from "@/components/data-table"

import columns from "./_components/patients-columns"

export default async function page() {
  const patients = await api.patient.getPatientsAdmin()

  return (
    <div className="space-y-5">
      <DashboardHeader
        heading="Hastalar"
        text="Hastaları listeleyin ve yönetin."
      />
      <DataTable
        columns={columns}
        data={patients}
        searchKey="name"
        viewOption
      />
    </div>
  )
}
