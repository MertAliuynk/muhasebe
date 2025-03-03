import React from "react"
import { api } from "@/trpc/server"

import { DataTable } from "@/components/data-table"

import doctorColumns from "./_components/doctor-columns"

export default async function page() {
  const doctors = await api.doctor.getDoctorsByBranch()

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Hekimler</h1>
        <p className="text-sm text-muted-foreground">
          Hekimleri bu ekranda görüntüleyebilirsiniz.
        </p>
      </div>
      <DataTable columns={doctorColumns} data={doctors} />
    </div>
  )
}
