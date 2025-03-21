import React from "react"
import { notFound } from "next/navigation"
import { auth } from "@/server/auth"
import { api } from "@/trpc/server"

import { Separator } from "@/components/ui/separator"

import PreviewDoctor from "./_components/doctor-info/preview-doctor"
import DoctorExpenses from "./_components/expenses"
import FinancialCards from "./_components/financial/financial-cards"
import DoctorIncomes from "./_components/incomes"

export default async function page() {
  const session = await auth()
  const id = session?.user.doctorId ?? ""

  const doctor = await api.doctor.getDoctorById({
    id,
  })

  if (!doctor) {
    return notFound()
  }

  return (
    <div className="space-y-8">
      <div className="relative">
        <PreviewDoctor doctor={doctor} />
        <FinancialCards doctorId={id} />
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-8">
        <DoctorIncomes doctorId={id} />
        <DoctorExpenses doctorId={id} />
      </div>
    </div>
  )
}
