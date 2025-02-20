import React from "react"
import { api } from "@/trpc/server"

import { DataTable } from "@/components/data-table"

import patientColumns from "./_components/patient-columns"

export default async function page() {
  const patients = await api.patient.getPatientsByBranch()

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Hastalar</h1>
        <p className="text-sm text-muted-foreground">
          Hastaları bu ekranda görüntüleyebilir ve yönetebilirsiniz.
        </p>
      </div>
      <DataTable
        columns={patientColumns}
        data={patients}
        searchKey="name"
        pagination
      />
    </div>
  )
}
