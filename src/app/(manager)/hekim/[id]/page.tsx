import React from "react"
import { notFound } from "next/navigation"
import { api } from "@/trpc/server"

import { Separator } from "@/components/ui/separator"

import PreviewDoctor from "./_components/doctor-info/preview-doctor"
import DoctorExpenses from "./_components/expenses"
import FinancialCards from "./_components/financial/financial-cards"
import DoctorIncomes from "./_components/incomes"

type PageProps = {
  params: Promise<{ id: string }>
}
export default async function page({ params }: PageProps) {
  const { id } = await params

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
        <FinancialCards doctorId={doctor.id} />
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-8">
        <DoctorIncomes doctorId={doctor.id} />
        <DoctorExpenses doctorId={doctor.id} />
      </div>
    </div>
  )
}
