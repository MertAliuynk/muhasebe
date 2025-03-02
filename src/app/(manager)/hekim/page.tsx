import React from "react"
import { db } from "@/server/db"
import { UserRole } from "@prisma/client"

import { DataTable } from "@/components/data-table"

import doctorColumns from "./_components/doctor-columns"

export default async function page() {
  const doctors = await db.user.findMany({
    where: {
      role: UserRole.DOCTOR,
      doctor: {
        isDeleted: false,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      doctor: {
        include: {
          patients: {
            include: {
              _count: true,
            },
          },
        },
      },
    },
  })

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
