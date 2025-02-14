import React from "react"
import { notFound } from "next/navigation"
import { api } from "@/trpc/server"

import PreviewDoctor from "./_components/preview-doctor"

type PageProps = {
  params: Promise<{ doctorId: string }>
}
export default async function page({ params }: PageProps) {
  const { doctorId } = await params

  const doctor = await api.doctor.getDoctorById({
    id: doctorId,
  })

  if (!doctor) {
    return notFound()
  }

  return (
    <div className="grid grid-cols-[240px_1fr] gap-5">
      <PreviewDoctor doctor={doctor} />
    </div>
  )
}
